/**
 * @typedef   {Object}      MetaConfig
 * @property  {number}      id
 * @property  {string}      db
 * @property  {string}      coll
 * @property  {Array}       fields
 */
import MetaField from "./meta-field";

export default class MetaConfig {
  /**
   * 
   * @param {Object} config 
   * @param {number} config.gameId 
   * @param {string} config.target.db 
   * @param {string} config.target.coll 
   * @param {Array}  config.fields 
   */
  constructor (config) {
    this.id       = config.gameId;
    this.db       = config.target.db;
    this.coll     = config.target.coll;
    this.fields   = config.fields.map(field => new MetaField(field));

    if ([this.db, this.coll].some(util.isNullOrUndefined))
      throw TypeError('Failed to initialize new instace');
  }
};
