import { utils } from 'stylelint';
import { isNumber } from 'lodash';
import {
  namespace,
  generateListOfImagesURLsAndNodes,
  getImageAndLocal
} from '../../utils';

export const ruleName = namespace('prefer-data-uri');
export const messages = utils.ruleMessages(ruleName, {
  expected: imageURL => `Expected image "${imageURL}" to be as data-URI.`
});

export default function ruleDataURI(limitBytes) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: limitBytes,
      possible: [isNumber]
    });

    if (!validOptions) {
      return null;
    }

    const list = generateListOfImagesURLsAndNodes(root);

    return checkImagesSizes(list, result).then(results =>
      reportImagesWithSizeGreaterThan(results, result, limitBytes)
    );
  };
}

function checkImagesSizes(list) {
  const checkList = list.map(getImageAndSize);

  return Promise.all(checkList);
}

function getImageAndSize(listItem) {
  console.log("getImageAndSize");
  
  return getImageAndLocal(listItem)
    .then(response => {
      console.log('response', response.data.length);
      return {
        ...listItem,
        bytesSize: response.data.length
      };
    })
    .catch(() => {});
}

function reportImagesWithSizeGreaterThan(results, result, limitBytes) {
  results
    .filter(resultItem => !!resultItem)
    .forEach(({ node, url, bytesSize }) => {
      console.log('bytesSize', bytesSize);
      if (bytesSize < limitBytes) {
        utils.report({
          message: messages.expected(url),
          node,
          result,
          ruleName
        });
      }
    });
}
