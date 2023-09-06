
const { controllerErrorHOF, generateRandomFileName } = require('../helpers/utils');
const axios = require('axios');
const { Voice, VoiceIds, Generated } = require('../lib/database');

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Filter = require('bad-words');

const postTTS = controllerErrorHOF(async (req, res) => {
  const { text, selectedId } = req.body;

  //checks
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

  //check database
  const checkBefore = await Generated.findOne({ attributes: ['url'], where: { text: text.trim(), voice_id: selectedId }, raw: true });
  if (checkBefore) {
    const result = { ...checkBefore, already: true, url: 'https://apiva.metareverse.net/' + checkBefore.url };
    return res.status(200).send(result);
  }

  //get real id
  let voiceManifest;
  if (selectedId) {
    const vids = await VoiceIds.findOne({ where: { voice_id: selectedId }, raw: true });

    if (!vids) {
      return res.status(400).send({
        message: 'wrong_process',
      });
    }

    voiceManifest = vids.manifest;
  }

  //go api
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceManifest}`;
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

    await Generated.create({
      voice_id: selectedId,
      text: text.trim(),
      url: compressedFilePath,
    });

    return res.status(200).send(result);
  } catch (error) {
    console.error('Error: ', error);
    return res.status(401).send({ message: 'error' });
  }
});

const listVoices = controllerErrorHOF(async (req, res) => {
  const getresult = await Voice.findAll({
    include: [
      {
        model: VoiceIds,
        attributes: ['manifest'],
      },
    ],
  });

  const result = getresult.map(item => {
    const { id, name, img, category, gender } = item;
    const manifest = item.voice_ids ? item.voice_ids.map(v => v.manifest)[0] : '';

    return {
      id,
      name,
      img,
      category,
      gender,
      manifest,
    };
  });

  return res.status(200).send({ result });
});

const listGenerated = controllerErrorHOF(async (req, res) => {
  const filter = new Filter();

  const hasProfanity = (text) => {
    return filter.isProfane(text);
  };


  const updatedResult = await Generated.findAll({
    include: [
      {
        model: Voice,
      },
    ],
    order: [['id', 'DESC']],
    limit: 50,
    raw: true,
  });

  const result = updatedResult.filter(c => {
    const words = c.text.split(' ');
    return words.length > 7;
  }).map(c => {
    const isOffensive = hasProfanity(c.text);

    // If the text is not offensive, proceed to add it to the result
    if (!isOffensive) {
      return {
        ...c,
        url: `https://apiva.metareverse.net/${c.url}`,
        voice: {
          "id": c['voice.id'],
          "name": c['voice.name'],
          "img": c['voice.img'],
          "category": c['voice.category'],
          "gender": c['voice.gender'],
        }
      };
    }

    // If the text is offensive, skip it
    return null;
  }).filter(Boolean); // Filter out null values


  return res.status(200).send({ result });
});


module.exports = { postTTS, listVoices, listGenerated };
