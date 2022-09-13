import CollNamespace from '../interfaces/coll-namespace';
import { MetaFieldInput, MetaField } from './meta-field';

export interface MetaConfigInput {
  gameId: number;
  target: CollNamespace;
  fields: MetaFieldInput[];
};

interface MetaConfigInterface extends CollNamespace {
  id    : number;
  fields: MetaField[];
}

export class MetaConfig implements MetaConfigInterface {
  id    : number;

  db    : string;

  coll  : string;

  fields: MetaField[];

  /**
   * @param {MetaConfigInput} source
   */
  constructor(source: MetaConfigInput) {
    this.id       = source.gameId;
    this.db       = source.target.db;
    this.coll     = source.target.coll;
    this.fields   = source.fields.map((field: MetaFieldInput) => new MetaField(field));
  };

  /**
   * @returns {string}
   */
  toString(): string {
    return `\
MetaConfig #${String(this.id)} - ${String(this.db)}.${String(this.coll)}
  ${this.fields.map((field) => field.toString()).sort().join(',\n  ')}`;
  };
};

export default MetaConfig;
