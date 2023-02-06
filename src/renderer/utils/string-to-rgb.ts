import hashCode from './hash-code';
import intToRGB from './int-to-rgb';

function stringToRGB(value: string) {
  return intToRGB(hashCode(value) * value.charCodeAt(value.length - 1));
}

export default stringToRGB;
