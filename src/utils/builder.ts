/**
 * @param   {string[]}  sources
 * @returns {Object[]}
 */
function buildTargetFilter(sources: string[]): object[] {
  return sources.map((item) => ({
    [`${item}`]           : null,
    [`__archive.${item}`] : null,
  }));
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
