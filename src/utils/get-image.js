import axios from 'axios';
import fs from 'fs';

const cacheImageResults = new Map();

export default function getImage(url) {
  if (cacheImageResults.has(url)) {
    return preservePromiseMethods(cacheImageResults.get(url));
  }

  return axios
    .get(url, { responseType: 'arraybuffer' })
    .then(response => {
      cacheImageResults.set(url, response);
      return response;
    })
    .catch(error => {
      cacheImageResults.set(url, error);
      return error;
    })
    .then(preservePromiseMethods);
}

export function getImageAndLocal({ url, type }) {
  if (cacheImageResults.has(url)) {
    return preservePromiseMethods(cacheImageResults.get(url));
  }

  if (type === 'local') {
    return new Promise((res, rej) => {
      fs.stat(url, function(error, stats) {
        if (error) {
          // throw error;
          return rej(error);
        } else {
          //文件大小
          const result = { data: { length: stats.size } };
          cacheImageResults.set(url, result);
          return res(result);
        }
      });
    })
      .catch(error => {
        cacheImageResults.set(url, error);
        return error;
      })
      .then(preservePromiseMethods);
  } else {
    return axios
      .get(url, { responseType: 'arraybuffer' })
      .then(response => {
        cacheImageResults.set(url, response);
        return response;
      })
      .catch(error => {
        cacheImageResults.set(url, error);
        return error;
      })
      .then(preservePromiseMethods);
  }
}

function preservePromiseMethods(result) {
  if (result instanceof Error) {
    return Promise.reject(result);
  }

  return Promise.resolve(result);
}
