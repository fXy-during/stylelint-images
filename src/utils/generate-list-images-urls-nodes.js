// CSS functions that can have an URL image
// From: https://github.com/postcss/postcss-url/blob/a9d1d4307b061210b1e051d1c2e9c481ca6afbf5/index.js#L26-L29
const URL_VALUE_PATTERNS = [
  /(url\(\s*['"]?)([^"')]+)(["']?\s*\))/g,
  /(url\(\s*['"]?)([^"')]+(png|jpg|jpge))(["']?\s*\))/g,
  /(AlphaImageLoader\(\s*src=['"]?)([^"')]+)(["'])/g
];

const path = require('path');

// CSS properties that can have an URL image
// From: https://github.com/bezoerb/postcss-image-inliner/blob/8b825acebace2f1567195b49e47c0d454de4a3ae/index.js#L69
const URL_PROPERTY_PATTERN = /^(background(?:-image)?)|(content)|(cursor)/;
// Absolute URLs
// From: http://stackoverflow.com/a/19709846/4709891
const ABSOLUTE_URL = /^(?:[a-z]+:)?\/\//i;

const NETWORK_IMAGE_PATTERN = /^(https?|\/\/)/;

export default function generateListOfImagesURLsAndNodes(root) {
  let list = [];

  const filePath = root.source.input.from;

  root.walkDecls(URL_PROPERTY_PATTERN, node => {
    const newList = generateList(node, filePath);

    if (newList) {
      list = list.concat(newList);
    }
  });

  // console.log('list', list);

  return list;
}

function generateList(node, filePath) {
  return URL_VALUE_PATTERNS.filter(valuePattern =>
    valuePattern.test(node.value)
  ).map(valuePattern => generateItems(node, valuePattern, filePath))[0];
}

function generateItems(node, valuePattern, filePath) {
  const URLs = getURLs(node, valuePattern);

  const URLsAndNodes = URLs.map(url => ({ url, node }));
  let typeNode = null;
  if (NETWORK_IMAGE_PATTERN.test(URLsAndNodes[0].url)) {
    // 网络图片
    typeNode = leftAbsoluteURLs(URLsAndNodes);
  } else {
    // 本地图片
    URLsAndNodes[0] = Object.assign({}, URLsAndNodes[0], {
      type: 'local',
      url: path.resolve(filePath, '../', URLsAndNodes[0].url)
    });
    typeNode = URLsAndNodes;
  }

  return typeNode;
}

function getURLs(node, valuePattern) {
  const URLs = node.value.replace(valuePattern, '$2');
  const splitURLs = URLs.split(',').map(url => url.trim());

  return splitURLs;
}

function leftAbsoluteURLs(URLsAndNodes) {
  return URLsAndNodes.filter(item => ABSOLUTE_URL.test(item.url));
}
