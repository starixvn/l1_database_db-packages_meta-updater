/**
 * @typedef   {Object}      MetaField
 * @property  {string}      lookup
 * @property  {string}      field
 * @property  {string}      sourceField
 * @property  {*}           default
 */

import { isString } from "@ldb/db-common/utils/string";

export class MetaField {
  /**
   * @param {Object}  input
   * @param {string}  input.lookup
   * @param {string}  input.field
   * @param {string}  input.sourceField
   * @param {*}       input.default
   */
  constructor(input) {
    if (!input) throw TypeError(`$input must be specified`);
    if (!isString(input.lookup)) throw TypeError(`$input.lookup must be a string`);
    if (!isString(input.field)) throw TypeError(`$input.field must be a string`);
    if (!isString(input.sourceField)) throw TypeError(`$input.sourceField must be a string`);

    this.lookup       = input.lookup;
    this.field        = input.field;
    this.sourceField  = input.sourceField;
    this.default      = input.default ?? null;
  };

  /**
   * @returns {string}
   */
  toString() {
    return `MetaField @[${this.lookup}] (${this.field} => ${this.sourceField} || ${JSON.stringify(this.default)})`;
  };
};

export default MetaField;
