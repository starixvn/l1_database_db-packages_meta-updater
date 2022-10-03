import MetaField from '../models/meta-field';

/**
 * @param   {MetaField[]}  sources
 * @returns {Object[]}
 */
function buildTargetFilter(sources: MetaField[]): object[] {
  return sources.map((item) => Object.assign(
    { [`${item.field}`]: null },
    item.archive ? { [`__archive.${item.field}`] : null } : {},
  ));
};

/**
 * @param {string[]} sources
 * @returns {Object}
 */
function buildTargetProjection(sources: string[]): object {
  return Object.assign({}, ...sources.map((item) => ({ [item]: 1 })));
};

const Builder = Object.freeze({
  buildTargetFilter,
  buildTargetProjection,
});

export default Builder;
