import MetaUpdater from "./meta-updater";
import Source from "./const/source";

/**
 * @property  {Object}  CONFIG
 * @property  {string}  CONFIG.db
 * @property  {string}  CONFIG.coll
 */
const MetaUpdaterConst = Object.freeze({
  CONFIG: Source.CONFIG,
});

export {
  MetaUpdaterConst,
  MetaUpdater,
};
