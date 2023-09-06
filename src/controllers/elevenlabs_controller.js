
const { controllerErrorHOF, generateRandomFileName } = require('../helpers/utils');
const axios = require('axios');
const { Voice, VoiceIds, Generated } = require('../lib/database');

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const crypto = require('crypto');
const Filter = require('bad-words');

const getVoices = controllerErrorHOF(async (req, res) => {
  const url = 'https://api.elevenlabs.io/v1/voices';

  const response = await axios.get(url, {
    headers: {
      'xi-api-key': '6c5ded95e36d7c3b1926c1bf0f20bf97',
      'accept': 'application/json',
      'content-type': 'application/json',
    },
  });

  if (response.status === 200) {
    const result = response.data;
    return res.status(200).send(result);

  }

  return res.status(401).send({
    message: 'error from my code',
  });
});

const evenTTS = controllerErrorHOF(async (req, res) => {
  const { text, selectedId } = req.body;

  if (!selectedId || !text) {
    return res.status(400).send({
      message: 'not_empty',
    });
  }

  if (text && text.length > 300) {
    return res.status(400).send({
      message: 'max_character',
    });
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${selectedId}`;

  const headers = {
    "Accept": "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": "6c5ded95e36d7c3b1926c1bf0f20bf97"
  };

  const data = {
    "text": text.trim(),
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.72
    }
  };

  const outputPath = 'downloaded';
  const randomFileName = generateRandomFileName(20);
  const downloadedFilePath = `${outputPath}/${randomFileName}.mp3`;

  try {
    const response = await axios.post(url, data, { headers, responseType: 'stream' });
    const writer = fs.createWriteStream(downloadedFilePath);
    response.data.pipe(writer);

    // Compress the MP3 file using ffmpeg
    const compressedFilePath = `${outputPath}/${randomFileName}ccc.mp3`;
    const ffmpegCommand = `ffmpeg -i ${downloadedFilePath} -ab 128k ${compressedFilePath}`;
    await exec(ffmpegCommand);
    if (fs.existsSync(compressedFilePath)) {
      fs.unlinkSync(downloadedFilePath);
    } else {
      fs.renameSync(compressedFilePath, downloadedFilePath);
    }

    const resUrl = `https://apiva.metareverse.net/${compressedFilePath}`;

    const result = {
      'progress': 1,
      'stage': "complete",
      'url': resUrl,
    }

    return res.status(200).send(result);
  } catch (error) {
    console.error('Error: ', error);
    return res.status(401).send({ message: 'error' });
  }
});


module.exports = { getVoices, evenTTS };
