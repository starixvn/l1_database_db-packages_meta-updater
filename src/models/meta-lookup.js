/**
 * @typedef   {Object}  MetaLookup
 * @param     {Object}  source
 * @property  {string}  from
 * @property  {string}  localField
 * @property  {string}  foreignField
 * @property  {string}  as
 */

export default class MetaLookup {
  #filter;
  #projection;

  /**
   * 
   * @param   {Object} source 
   */
  constructor (source) {
    this.from         = source.from;
    this.localField   = source.localField;
    this.foreignField = source.foreignField;
    this.as           = source.as;
    this.#filter      = source.filter;
    this.#projection  = source.project ?? 1;

    if ([this.from, this.localField, this.foreignField, this.as].some(util.isNullOrUndefined))
      throw TypeError('Failed to initialize new instace');
  };

  /**
   * 
   * @returns {Object}
   */
  toLookupStage () {
    return ({$lookup: this.valueOf()});
  }

  /**
   * 
   * @param   {boolean} preserve 
   * @returns {Object}
   */
  toUnwindStage (preserve = true) {
    return ({$unwind: {
      path: `$${this.as}`,
      preserveNullAndEmptyArrays: Boolean(preserve),
    }});
  };

  /**
   * 
   * @param   {boolean} preserve 
   * @returns {Array}
   */
  toAggregateStages (preserve) {
    return [
      this.toLookupStage(),
      this.toUnwindStage(preserve),
    ];
  };

  /**
   * 
   * @returns {Object}
   */
  toFilter () {
    return this.#filter;
  };

  /**
   * 
   * @returns {Object}
   */
  toProjection () {
    return ({
      [this.localField]: this.#projection,
    })
  };

  /**
   * 
   * @param {string} field 
   * @returns {Object}
   */
  toMergeProjection (field, source, defaultValue) {
    return ({
      [`__archive.${field}`]: {$cond: [
        {$eq: [{$ifNull: [`$${field}`, null]}, null]},
        {$ifNull: [`$${this.as}.${source ?? field}`, defaultValue ?? null]},
        '$$REMOVE'
      ]},
    });
  }

  /**
   * 
   * @returns {Object}
   */
  valueOf () {
    return ({
      from          : this.from,
      localField    : this.localField,
      foreignField  : this.foreignField,
      as            : this.as,
    });
  };
};
