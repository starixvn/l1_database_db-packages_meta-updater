import MetaConfig from "./meta-config";

/**
 * @typedef   {Array}  MetaQueue
 */
export default class MetaQueue extends Array {
  /**
   * 
   * @param {MetaConfig} config 
   */
  constructor (config) {
    super();

    /** Get pending merge objects */
    this.push({$match: {'target.db': config.db, 'target.coll': config.coll}});
    this.push({$project: {_id: 0, data: 1}});
    this.push({$replaceWith: '$data'});

    /** Execute merge */
    this.push({$merge: {
      into: { db: config.db, coll: config.coll },
      on  : [ "_id" ],
    }});
  }
}
