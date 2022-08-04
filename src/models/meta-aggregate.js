import Source from "../const/source";
import SourceLookup from "../const/source-lookup";
import Builder from "../utils/builder";
import MetaConfig from "./meta-config";

/**
 * @typedef   {Array}  MetaAggregate
 */
export default class MetaAggregate extends Array {
  /**
   * 
   * @param {MetaConfig} config 
   */
  constructor (config) {
    super();

    /** Filter out fields with invalid lookup source */
    const fields = config.fields.filter(({lookup}) => lookup in SourceLookup);

    /** Get unique sources */
    const sources = new Map(Array.from(new Set(fields.map(({lookup}) => lookup))).map(source => [source, SourceLookup[source]]));

    /**  */
    this.push({$match: {$and: [
      {$or: Builder.buildTargetFilter(fields.map(({field}) => field))},
      {$or: Array.from(sources.values()).map(item => item.toFilter())},
    ]}});

    /**  */
    this.push({$project: Object.assign(
      {_id: 1},
      ...Array.from(sources.values()).map(item => item.toProjection()),
      Builder.buildTargetProjection(fields.map(({field}) => field)),
    )});

    /** For each unique source, add lookup & unwind stage */
    Array.from(sources.values()).forEach(item => {
      item.toAggregateStages().forEach(stage => {
        this.push(stage);
      });
    });

    /** Project only needed fields */
    this.push({$project: Object.assign(
      {_id: 1},
      ...fields.map(field => sources.get(field.lookup).toMergeProjection(field.field, field.sourceField, field.default)),
    )});

    this.push({$project: {
      target: {
        db    : config.db,
        coll  : config.coll,
      },
      data  : `$$CURRENT`,
    }});

    /** Execute merge */
    this.push({$merge: {
      into: Source.QUEUE,
      on  : [ "target.db", "target.coll", "data._id" ],
    }});
  }
}
