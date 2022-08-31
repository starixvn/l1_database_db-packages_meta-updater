/**
 * @param {string[]} sources
 */
function assertSources(sources) {
  if (!(sources instanceof Array)) { throw TypeError(`$source is not an array`); }
  if (!(sources.every((item) => (typeof item === "string")))) throw TypeError(`$source must be an array of strings`);
};

/**
 *
 * @param   {string[]}  sources
 * @returns {Object[]}
 */
function buildTargetFilter(sources) {
  assertSources(sources);

  return sources.map((item) => ({
    [`${item}`]           : null,
    [`__archive.${item}`] : null,
  }));
};

/**
 *
 * @param {string[]} sources
 * @returns {Object}
 */
function buildTargetProjection(sources) {
  assertSources(sources);

  return Object.assign({}, ...sources.map((item) => ({ [item]: 1 })));
};

const Builder = Object.freeze({
  buildTargetFilter,
  buildTargetProjection,
});

export default Builder;
