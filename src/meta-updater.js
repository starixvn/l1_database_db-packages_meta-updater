/**
 * @typedef {Object} MetaUpdater
 */

import { Collection, MongoClient } from "mongodb";
import { MetaAggregate, MetaConfig, MetaQueue } from "./models";
import { Source } from "./const";
import { Log, Schedule } from "./utils";
import Config from "./config";

export default class MetaUpdater {
  /**
   * @type {MongoClient}
   * @private
   */
  #mongo;
  get _mongo () {
    return this.#mongo;
  };

  /**
   * @type {Collection}
   * @private
   */
  #configColl;

  /**
   * @type {string[]}
   * @private
   */
  #configStrs;

  /**
   * @type {Object}
   * @private
   */
  #timeouts = {};
  get timeouts () {
    return this.#timeouts;
  };

  /**
   * @type {Object}
   * @private
   */
  #flags = {};

  /**
   * 
   * @param {Collection} configColl 
   */
  constructor (configColl) {
    if (!(configColl instanceof Collection)) throw Error('$config is not a Mongo Collection');
  
    this.#mongo  = configColl.s.db.s.client;
    this.#configColl = configColl;

    const connStr = this.#mongo.s.url.replace(/^mongodb:\/\/(.*):(.*)@/g, 'mongodb://$1:<REDACTED>@');
    Log.info(`[Meta Updater]`, `Initialized on ${this.#configColl.namespace} @[${connStr}]`);
  };

  /**
   * 
   * @param {MetaConfig} config 
   */
  async #executeRunner (config) {
    try {
      /** Target collection */
      const target = this.#mongo.db(config.db).collection(config.coll);

      /** Build agg */
      const agg = new MetaAggregate(config);

      /** Run agg */
      await target.aggregate(agg).toArray();
    }
    catch (e) { Log.err(`[Runner-${config.db}.${config.coll}]`, e.name, '-', e.message) };

    /** Set next run */
    if (this.#flags.continue) {
      const nextSchedule = Schedule.getNextTimeout(Config.RUNNER_PERIOD);
      this.#timeouts[`runner-${config.db}.${config.coll}`] = setTimeout(this.#executeRunner.bind(this), nextSchedule, config);
    }
  };

  /**
   * 
   * @param {MetaConfig} config 
   */
   async #executeQueuer (config) {
    processing: try {
      /** Queue collection */
      const queue = this.#mongo.db(Source.QUEUE.db).collection(Source.QUEUE.coll);
      const filter = { 'target.db': config.db, 'target.coll': config.coll };

      /** Get _ids */
      const _ids = await queue.find(filter, {projection: {_id: 1}}).map(({_id})=> _id).toArray();
      if (_ids.length === 0) break processing;

      /** Build agg */
      const agg = new MetaQueue(config);

      /** Run agg */
      await queue.aggregate(agg).toArray();

      /** Delete _ids */
      await queue.deleteMany(Object.assign({_id: {$in: _ids}}, filter));
      Log.info(`[${config.db}.${config.coll}]`, `Updated ${_ids.length} ticket${_ids.length === 1 ? '' : 's'}`);
    }
    catch (e) { Log.err(`[Queuer-${config.db}.${config.coll}]`, e.name, '-', e.message) };

    /** Set next run */
    if (this.#flags.continue) {
      const nextSchedule = Schedule.getNextTimeout(Config.QUEUER_PERIOD);
      this.#timeouts[`queuer-${config.db}.${config.coll}`] = setTimeout(this.#executeQueuer.bind(this), nextSchedule, config);
    }
  };

  /**
   * 
   * @returns {Promise<MetaConfig[]>}
   */
  async #getConfigs () {
    return this.#configColl.find({}, {projection: {_id: 0}}).map(doc => new MetaConfig(doc)).toArray();
  };

  /**
   * 
   */
  async run () {
    /** Turn on flag to run continuously */
    this.#flags.continue = true;

    /** Get query configs */
    const configs = await this.#getConfigs();
    this.#configStrs = configs.map(config => config.toString()).sort();

    /** Run for each config */
    [ ...configs.map(this.#executeRunner.bind(this)),
      ...configs.map(this.#executeQueuer.bind(this)),
    ];

    /** Schedule next refresh */
    const nextSchedule = Schedule.getNextTimeout(Config.REFRESH_PERIOD);
    this.#timeouts[`refresh-config`] = setTimeout(this.refresh.bind(this), nextSchedule);
  };

  /**
   * 
   */
  async stop () {
    /** Turn off flag to keep current tasks from setting up new run */
    this.#flags.continue = false;

    /** Clear all timeouts */
    Object.values(this.#timeouts).forEach(clearTimeout);

    /** Clear tracking object */
    this.#timeouts = {};
  };

  /**
   * 
   */
  async refresh () {
    const label = `[Refresh config]`;

    const configs = (await this.#getConfigs()).map(config => config.toString()).sort();
    const joiner = ' ~ ';

    /** Only refresh if got new config */
    if (this.#configStrs.join(joiner) !== configs.join(joiner)) {
      /** Stop all scheduled tasks */
      await this.stop();
      Log.info(label, `Stopped scheduled tasks`);

      /** Run the tasks again */
      await this.run();
      Log.info(label, `Started tasks with new configs`);
    } else {
      /** Because run() will init new schedule for restart,
       *  we need to manual set schedule for refresh if not execute run() */
      const nextSchedule = Schedule.getNextTimeout(Config.REFRESH_PERIOD);
      this.#timeouts[`refresh-config`] = setTimeout(this.refresh.bind(this), nextSchedule);
    }
  };
};
