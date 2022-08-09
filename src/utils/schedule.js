
/**
 * 
 * @param {number} period 
 * @returns number
 */
function getNextEpoch (period) {
  return (Math.floor(Date.now() / period) + 1) * period;
};

function getNextTimeout (period) {
  return getNextEpoch(period) - Date.now();
}

const Schedule = Object.freeze({
  getNextEpoch,
  getNextTimeout,
});

export default Schedule;
