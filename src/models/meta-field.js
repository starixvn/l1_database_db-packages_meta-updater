/**
 * @typedef   {Object}      MetaField
 * @property  {string}      lookup
 * @property  {string}      field
 * @property  {string}      sourceField
 * @property  {*}           default
 */
export default class MetaField {
  /**
   * 
   * @param {Object}  config 
   * @param {string}  config.lookup 
   * @param {string}  config.field  
   * @param {string}  config.sourceField 
   * @param {*}       config.default 
   */
  constructor (config) {
    this.lookup       = config.lookup;
    this.field        = config.field;
    this.sourceField  = config.sourceField;
    this.default      = config.default ?? null;

    if ([this.lookup, this.field, this.sourceField].some(util.isNullOrUndefined))
      throw TypeError('Failed to initialize new instace');
  }
};
