/* global bodyPix */
const options = {
  multiplier: 0.75,
  stride: 32,
  quantBytes: 4,
};

const loadBodyPix = () => bodyPix.load(options);
export default loadBodyPix;
