import { QUEUE, USERS } from '../const/source';
import CollNamespace    from '../interfaces/coll-namespace';
import Builder          from '../utils/builder';
import MetaConfig       from './meta-config';
import MetaField        from './meta-field';
import SourceLookup     from '../const/source-lookup';

export class MetaAggregate extends Array {
  /**
   * 
   * @param {MetaConfig} config
   */
  constructor(config: MetaConfig) {
    super();

    /** Filter out fields with invalid lookup source */
    const fields = config.fields.filter(({ lookup }) => lookup in SourceLookup);

    /** Get unique sources */
    const sources = new Map(Array.from(new Set(fields.map(({ lookup }) => lookup))).map((source: USERS) => [source, SourceLookup[source]]));

    /**  */
    this.push({ $match: { $and: [
      { $or: Builder.buildTargetFilter(fields) },
      { $or: Array.from(sources.values()).map((item) => item.toFilter()) },
    ] } });

    /**  */
    this.push({ $project: Object.assign(
      { _id: 1 },
      ...Array.from(sources.values()).map((item) => item.toProjection()),
      Builder.buildTargetProjection(fields.map(({ field }) => field)),
    ) });

    /** For each unique source, add lookup & unwind stage */
    Array.from(sources.values()).forEach((item) => {
      item.toAggregateStages().forEach((stage) => {
        this.push(stage);
      });
    });

    /** Project only needed fields */
    this.push({ $project: Object.assign(
      { _id: 1 },
      ...fields.map((field: MetaField) => sources.get(field.lookup)?.toMergeProjection(field.field, field.sourceField, field.default, field.archive)).filter(Boolean),
    ) });

    this.push({ $project: {
      _id   : 0,
      target: {
        db    : config.db,
        coll  : config.coll,
      } as CollNamespace,
      data  : '$$CURRENT',
    } });

    /** Execute merge */
    this.push({ $merge: {
      into: QUEUE,
      on  : ['target.db', 'target.coll', 'data._id'],
    } });
  };
};
