import MetaConfig from './meta-config';

export class MetaQueue extends Array {
  constructor(config: MetaConfig) {
    super();

    /** Get pending merge objects */
    this.push({ $match: { 'target.db': config.db, 'target.coll': config.coll } });
    this.push({ $project: { _id: 0, data: 1 } });
    this.push({ $replaceWith: '$data' });

    /** Execute merge */
    this.push({ $merge: {
      into: { db: config.db, coll: config.coll },
      on  : [ '_id' ],
    } });
  };
};

export default MetaQueue;
