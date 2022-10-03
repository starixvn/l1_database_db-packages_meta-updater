import LookupStage from '../interfaces/lookup-stage';

export interface MetaLookupInput extends LookupStage {
  filter?     : object;
  project?    : number | string | object;
};

export class MetaLookup implements MetaLookupInput {
  from: string;

  localField: string;

  foreignField: string;

  as: string;

  #filter?: object;

  #projection: number | string | object;

  /**
  * @param   {MetaLookupInput} source
  */
  constructor(source: MetaLookupInput) {
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
  toLookupStage(): object {
    return ({ $lookup: this.valueOf() });
  }

  /**
  * @param   {boolean} preserve
  * @returns {Object}
  */
  toUnwindStage(preserve: boolean = true): object {
    return ({ $unwind: {
      path: `$${this.as}`,
      preserveNullAndEmptyArrays: Boolean(preserve),
    } });
  };

  /**
  * @param   {boolean} [preserve]
  * @returns {Array}
  */
  toAggregateStages(preserve?: boolean): Array<object> {
    return [
      this.toLookupStage(),
      this.toUnwindStage(preserve),
    ];
  };

  /**
  * @returns {Object}
  */
  toFilter(): object | undefined {
    return this.#filter;
  };

  /**
  * @returns {Object}
  */
  toProjection(): object {
    return ({
      [this.localField]: this.#projection,
    });
  };

  /**
  * @param {string}         field
  * @param {string}         [source]
  * @param {string|object}  [defaultValue]
  * @param {boolean}        [archive]
  * @returns {Object}
  */
  toMergeProjection(field: string, source?: string, defaultValue?: number | string | object, archive?: boolean): object {
    const setField = archive ? `__archive.${field}` : field;
    return ({
      [setField]: { $cond: [
        { $eq: [{ $ifNull: [`$${field}`, null] }, null] },
        { $ifNull: [`$${this.as}.${source ?? field}`, defaultValue ?? null] },
        '$$REMOVE',
      ] },
    });
  };

  /**
  * @returns {LookupStage}
  */
  valueOf(): LookupStage {
    return ({
      from          : this.from,
      localField    : this.localField,
      foreignField  : this.foreignField,
      as            : this.as,
    });
  };
};

export default MetaLookup;
