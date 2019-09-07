import { utils } from 'stylelint';
import { isNumber } from 'lodash';
import {
  namespace,
  generateListOfImagesURLsAndNodes,
  getImageAndLocal
} from '../../utils';

// export const ruleName = namespace('prefer-data-uri-max');

let ruleName = '';

export const messagesMin = utils.ruleMessages(
  namespace('prefer-data-uri-min'),
  {
    expected: imageURL => `Expected image "${imageURL}" to be as data-URI.`
  }
);

export const messagesMax = utils.ruleMessages(
  namespace('prefer-data-uri-max'),
  {
    expected: imageURL =>
      `Unexpected image "${imageURL}" size, too large to upload.`
  }
);


export default function ruleDataURI(limitBytes, type) {
  ruleName = namespace('prefer-data-uri-' + type);
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
      reportImagesWithSizeGreaterThan(results, result, limitBytes, type)
    );
  };
}

function checkImagesSizes(list) {
  const checkList = list.map(getImageAndSize);

  return Promise.all(checkList);
}

function getImageAndSize(listItem) {
  return getImageAndLocal(listItem)
    .then(response => {
      return {
        ...listItem,
        bytesSize: response.data.length
      };
    })
    .catch(() => {});
}

function reportImagesWithSizeGreaterThan(results, result, limitBytes, type) {
  results
    .filter(resultItem => !!resultItem)
    .forEach(({ node, url, bytesSize }) => {
      let reportObj = {};
      if (type == 'max') {
        if (bytesSize > limitBytes) {
          reportObj = {
            message: messagesMax.expected(url)
          };
        }
      } else if (type == 'min') {
        if (bytesSize < limitBytes) {
          reportObj = {
            message: messagesMin.expected(url)
          };
        }
      }
      reportObj.message &&
        utils.report(Object.assign({}, reportObj, { node, result, ruleName }));
    });
}
