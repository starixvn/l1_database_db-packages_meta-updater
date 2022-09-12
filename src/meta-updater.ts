import { Collection, MongoClient } from 'mongodb';
import Logger from '@ldb/logger';
import { DBHelper, Utils } from '@ldb/db-common';
import MetaConfig, { MetaConfigInput } from './models/meta-config';
import { MetaAggregate } from './models/meta-aggregate';
import Config from './config';
import Source from './const/source';
import MetaQueue from './models/meta-queue';

export class MetaUpdater {
  #mongo: MongoClient;

  #configColl: Collection;

  #configStrs: string[] = [];

  #timeouts: { [k: string]: NodeJS.Timeout } = {};

  #flags: { [k: string]: boolean } = {};

  /**
   * @param {Collection} configColl
   */
  constructor(configColl: Collection) {
    if (!(configColl instanceof Collection)) throw Error('$configColl is not a Mongo Collection');

    this.#mongo  = DBHelper.getMongoClient(configColl);
    this.#configColl = configColl;

    const connStr = DBHelper.redactMongoConnectionString(this.#mongo);
    Logger.info(undefined, this.constructor.name, `Initialized on ${this.#configColl.namespace} @[${connStr}]`);
  };

  /**
   * @param {MetaConfig} config
   */
  async #executeRunner(config: MetaConfig) {
    /** Timer */
    const start = Date.now();
    const label = 'Runner';

    try {
      /** Target collection */
      const target = this.#mongo.db(config.db).collection(config.coll);

      /** Build agg */
      const agg = new MetaAggregate(config);

      /** Run agg */
      await target.aggregate(agg).toArray();
    } catch (e) { if (e instanceof Error) Logger.catchError(e, `${label} - ${config.coll}`); };

    Logger.debug(undefined, label, `${config.coll} - Execution take ${Date.now() - start}ms to complete`);

    /** Set next run */
    if (this.#flags.continue) {
      const nextSchedule = Utils.Schedule.getNextTimeout(Config.RUNNER_PERIOD);
      this.#timeouts[`runner-${config.db}.${config.coll}`] = setTimeout(this.#executeRunner.bind(this), nextSchedule, config);
      Logger.trace(undefined, label, `${config.coll} - setTimeout @${nextSchedule}`);
    }
  };

  /**
   * @param {MetaConfig} config
   */
  async #executeQueuer(config: MetaConfig) {
    /** Timer */
    const start = Date.now();
    const label = 'Queuer';

    // eslint-disable-next-line no-restricted-syntax
    processing: try {
      /** Queue collection */
      const queue = this.#mongo.db(Source.QUEUE.db).collection(Source.QUEUE.coll);
      const filter = { 'target.db': config.db, 'target.coll': config.coll };

      /** Get _ids */
      const ids = await queue.find(filter, { projection: { _id: 1 } }).map(({ _id }) => _id).toArray();
      if (ids.length === 0) break processing;

      /** Build agg */
      const agg = new MetaQueue(config);

      /** Run agg */
      await queue.aggregate(agg).toArray();

      /** Delete _ids */
      await queue.deleteMany({ _id: { $in: ids }, ...filter });
      Logger.debug(undefined, label, `${config.coll} - Updated ${ids.length} ticket${ids.length === 1 ? '' : 's'}`);
    } catch (e) { if (e instanceof Error) Logger.catchError(e, `${label} - ${config.coll}`); };

    Logger.debug(undefined, label, `${config.coll} - Execution take ${Date.now() - start}ms to complete`);

    /** Set next run */
    if (this.#flags.continue) {
      const nextSchedule = Utils.Schedule.getNextTimeout(Config.QUEUER_PERIOD);
      this.#timeouts[`queuer-${config.db}.${config.coll}`] = setTimeout(this.#executeQueuer.bind(this), nextSchedule, config);
      Logger.trace(undefined, label, `${config.coll} - setTimeout @${nextSchedule}`);
    }
  };

  /**
   * @returns {Promise<MetaConfig[]>}
   */
  async #getConfigs(): Promise<MetaConfig[]> {
    return this.#configColl.find({}, { projection: { _id: 0 } }).map((doc) => new MetaConfig(doc as unknown as MetaConfigInput)).toArray();
  };

  /**
   *
   */
  async run() {
    const label = 'Run';

    /** Turn on flag to run continuously */
    this.#flags.continue = true;
    Logger.debug(undefined, label, `Set continue flag - #flag.continue = ${this.#flags.continue}`);

    /** Get query configs */
    const configs = await this.#getConfigs();
    this.#configStrs = configs.map((config) => config.toString()).sort();

    /** Run for each config */
    configs.map(this.#executeRunner.bind(this));
    configs.map(this.#executeQueuer.bind(this));

    /** Schedule next refresh */
    const nextSchedule = Utils.Schedule.getNextTimeout(Config.REFRESH_PERIOD);
    this.#timeouts['refresh-config'] = setTimeout(this.refresh.bind(this), nextSchedule);
    Logger.trace(undefined, label, `refresh-config - setTimeout @${nextSchedule}`);

    Logger.info(undefined, label, 'Successfully started tasks');
  };

  /**
   *
   */
  async stop() {
    const label = 'Stop';

    /** Turn off flag to keep current tasks from setting up new run */
    this.#flags.continue = false;
    Logger.debug(undefined, label, `Unset continue flag - #flag.continue = ${this.#flags.continue}`);

    /** Clear all timeouts */
    Object.values(this.#timeouts).forEach(clearTimeout);

    /** Clear tracking object */
    this.#timeouts = {};

    Logger.info(undefined, label, 'Successfully stopped tasks');
  };

  /**
   *
   */
  async refresh() {
    const label = 'Refresh Config';

    const configs = (await this.#getConfigs()).map((config) => config.toString()).sort();
    const joiner = ' ~ ';

    /** Only refresh if got new config */
    if (this.#configStrs.join(joiner) !== configs.join(joiner)) {
      /** Stop all scheduled tasks */
      await this.stop();
      Logger.debug(undefined, label, 'Stopped scheduled tasks');

      /** Run the tasks again */
      await this.run();
      Logger.info(undefined, label, 'Started tasks with new configs');
    } else {
      /** Because run() will init new schedule for restart,
       *  we need to manual set schedule for refresh if not execute run() */
      const nextSchedule = Utils.Schedule.getNextTimeout(Config.REFRESH_PERIOD);
      this.#timeouts['refresh-config'] = setTimeout(this.refresh.bind(this), nextSchedule);
      Logger.trace(undefined, label, `refresh-config - setTimeout @${nextSchedule}`);
    }
  };
};

export default MetaUpdater;
