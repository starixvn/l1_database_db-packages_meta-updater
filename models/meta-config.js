/**
 * @typedef   {Object}  CollNamespace
 * @property  {string}  db
 * @property  {string}  coll
 */

/**
 * @typedef   {Object}  MetaConfig
 * @property  {number}  id
 * @property  {string}  db
 * @property  {string}  coll
 * @property  {Array}   fields
 */

import { isNumber } from "@ldb/db-common/utils/number";
import { isString } from "@ldb/db-common/utils/string";
import MetaField from "./meta-field";

export class MetaConfig {
  /**
   *
   * @param {Object}        input
   * @param {number}        input.gameId
   * @param {CollNamespace} input.target
   * @param {Array}         input.fields
   */
  constructor(input) {
    if (!input) throw TypeError(`$input must be specified`);
    if (!isNumber(input.gameId)) throw TypeError(`$input.gameId must be a number`);
    if (!input.target) throw TypeError(`$input.target must be specified`);
    if (!isString(input.target.db)) throw TypeError(`$input.target.db must be a string`);
    if (!isString(input.target.coll)) throw TypeError(`$input.target.coll must be a string`);
    if (!(input.fields instanceof Array)) throw TypeError(`$input.fields must be an array`);

    this.id       = input.gameId;
    this.db       = input.target.db;
    this.coll     = input.target.coll;
    this.fields   = input.fields.map((field) => new MetaField(field));
  };

  toString() {
    return `\
MetaConfig #${String(this.id)} - ${String(this.db)}.${String(this.coll)}
  ${this.fields.map((field) => field.toString()).sort().join(',\n  ')}`;
  };
};

export default MetaConfig;
