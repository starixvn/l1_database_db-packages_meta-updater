/**
 * @typedef   {Object}  MetaLookup
 * @property  {string}  from
 * @property  {string}  localField
 * @property  {string}  foreignField
 * @property  {string}  as
 */

import { isString } from "@ldb/db-common/utils/string";

export class MetaLookup {
  #filter;

  #projection;

  /**
   * @param   {Object} source
   * @param   {string} source.from
   * @param   {string} source.localField
   * @param   {string} source.foreignField
   * @param   {string} source.as
   * @param   {*}      [source.filter]
   * @param   {*}      [source.project]
   */
  constructor(source) {
    if (!source) throw TypeError(`$source must be specified`);
    if (!isString(source.from)) throw TypeError(`$source.from must be a string`);
    if (!isString(source.localField)) throw TypeError(`$source.localField must be a string`);
    if (!isString(source.foreignField)) throw TypeError(`$source.foreignField must be a string`);
    if (!isString(source.as)) throw TypeError(`$source.as must be a string`);

    this.from         = source.from;
    this.localField   = source.localField;
    this.foreignField = source.foreignField;
    this.as           = source.as;
    this.#filter      = source.filter;
    this.#projection  = source.project ?? 1;
  };

  /**
   * @returns {Object}
   */
  toLookupStage() {
    return ({ $lookup: this.valueOf() });
  }

  /**
   * @param   {boolean} preserve
   * @returns {Object}
   */
  toUnwindStage(preserve = true) {
    return ({ $unwind: {
      path: `$${this.as}`,
      preserveNullAndEmptyArrays: Boolean(preserve),
    } });
  };

  /**
   * @param   {boolean} preserve
   * @returns {Array}
   */
  toAggregateStages(preserve) {
    return [
      this.toLookupStage(),
      this.toUnwindStage(preserve),
    ];
  };

  /**
   * @returns {Object}
   */
  toFilter() {
    return this.#filter;
  };

  /**
   * @returns {Object}
   */
  toProjection() {
    return ({
      [this.localField]: this.#projection,
    });
  };

  /**
   * @param {string} field
   * @returns {Object}
   */
  toMergeProjection(field, source, defaultValue) {
    return ({
      [`__archive.${field}`]: { $cond: [
        { $eq: [{ $ifNull: [`$${field}`, null] }, null] },
        { $ifNull: [`$${this.as}.${source ?? field}`, defaultValue ?? null] },
        '$$REMOVE',
      ] },
    });
  }

  /**
   * @returns {Object}
   */
  valueOf() {
    return ({
      from          : this.from,
      localField    : this.localField,
      foreignField  : this.foreignField,
      as            : this.as,
    });
  };
};

export default MetaLookup;
