import { USERS } from '../const/source';

export interface MetaFieldInput {
  lookup      : USERS;
  field       : string;
  sourceField : string;
  default    ?: number | string | object;
  archive    ?: boolean;
};

export class MetaField implements MetaFieldInput {
  lookup      : USERS;

  field       : string;

  sourceField : string;

  default    ?: number | string | object;

  archive    ?: boolean;

  /**
   * @param {MetaFieldInput} source
   */
  constructor(source: MetaFieldInput) {
    this.lookup       = source.lookup;
    this.field        = source.field;
    this.sourceField  = source.sourceField;
    this.default      = source.default;
    this.archive      = source.archive ?? true;
  };

  /**
   * @returns {string}
   */
  toString(): string {
    return `MetaField @[${this.lookup}] (${this.field} => ${this.sourceField} || ${JSON.stringify(this.default)})`;
  };
};

export default MetaField;
