async function info () {
  console.log(new Date(), 'I', ...arguments);
};

async function warn () {
  console.log(new Date(), 'W', ...arguments);
};

async function err () {
  console.log(new Date(), 'E', ...arguments);
};

const Log = Object.freeze({ info, warn, err });

export default Log;
