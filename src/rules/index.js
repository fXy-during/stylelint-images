import broken from './broken';
import preferDataURI from './prefer-data-uri';

const preferImageMax = limitBytes => {
  return preferDataURI(limitBytes, 'max');
};
const preferImageMin = limitBytes => {
  return preferDataURI(limitBytes, 'min');
};

export default {
  broken,
  'prefer-data-uri-min': preferImageMin,
  'prefer-data-uri-max': preferImageMax
};
