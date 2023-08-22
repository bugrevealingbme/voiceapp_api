const fetch = require('node-fetch');

const { BUNNY_ACCESS_TOKEN } = process.env;

const uploadImage = (storageOptions, data) => {
  const _storage = storageOptions.storage || 'tirinstorage';
  const _path = storageOptions.path || 'test';
  const _fileName = storageOptions.fileName || 'test.png';

  const url = `https://storage.bunnycdn.com/${_storage}/${_path}/${_fileName}`;

  const options = {
    method: 'PUT',
    headers: {
      AccessKey: BUNNY_ACCESS_TOKEN,
      'content-type': 'application/octet-stream',
    },
    body: data,
  };

  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        console.log(json);

        resolve();
      })
      .catch((err) => {
        console.error(`Upload Error: ${err}`);

        reject();
      });
  });
};

module.exports = { uploadImage };
