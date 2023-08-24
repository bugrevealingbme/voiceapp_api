
const { controllerErrorHOF } = require('../helpers/utils');
const axios = require('axios');
const { Voice, VoiceIds, Generated } = require('../lib/database');

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const crypto = require('crypto');

const postTTS = controllerErrorHOF(async (req, res) => {
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

  const checkBefore = await Generated.findOne({ attributes: ['url'], where: { text: text.trim(), voice_id: selectedId }, raw: true });

  if (checkBefore) {

    const result = { ...checkBefore, already: true, url: 'https://apiva.metareverse.net/' + checkBefore.url };
    return res.status(200).send(result);
  }

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

  const url = 'https://play.ht/api/v2/tts';
  const requestBody = {
    quality: 'medium',
    output_format: 'mp3',
    speed: 1,
    sample_rate: 24000,
    voice: voiceManifest,
    text: text.trim(),
  };

  const response = await axios.post(url, requestBody, {
    headers: {
      'AUTHORIZATION': 'Bearer fd924f8acba64cd8a7c874b88706b9e8',
      'X-USER-ID': 'WTvk1E2yUzRMCJJEDhbBYrYdVNI3',
      'accept': 'text/event-stream',
      'content-type': 'application/json',
    },
  });

  if (response.status === 200) {
    const lines = response.data.split('\n');

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const newline = line.replace('data:', '');

        try {
          const result = JSON.parse(newline);


          if (result.progress === 1) {
            if (process.env.NODE_ENV === 'development') {
              //
            } else {
              const filePath = await downloadAndCompressMp3(result.url, 'downloaded');

              await Generated.create({
                voice_id: selectedId,
                text: text.trim(),
                url: filePath,
              });
            }

            return res.status(200).send(result);
          }


        } catch (error) {
          console.log(response.data);
        }
      }
    }
  } else {
    log(`Error: ${response.data}`);

    return res.status(401).send({
      message: 'error from api',
    });
  }

  return res.status(401).send({
    message: 'error from my code',
  });
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
  const updatedResult = await Generated.findAll({
    include: [
      {
        model: Voice,
      },
    ],
    order: [['id', 'DESC']],
    limit: 30,
    raw: true,
  });

  const result = updatedResult.map(c => {
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
  });

  return res.status(200).send({ result });
});

function generateRandomFileName(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

async function downloadAndCompressMp3(url, outputPath) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const randomFileName = generateRandomFileName(20);
    const downloadedFilePath = `${outputPath}/${randomFileName}.mp3`;
    fs.writeFileSync(downloadedFilePath, response.data);

    // Compress the MP3 file using ffmpeg
    const compressedFilePath = `${outputPath}/${randomFileName}ccc.mp3`;
    const ffmpegCommand = `ffmpeg -i ${downloadedFilePath} -ab 128k ${compressedFilePath}`;
    await exec(ffmpegCommand);

    // Rename or delete the original file based on availability
    if (fs.existsSync(compressedFilePath)) {
      // Delete the original downloaded file
      fs.unlinkSync(downloadedFilePath);
    } else {
      // Rename the compressed file to the original filename
      fs.renameSync(compressedFilePath, downloadedFilePath);
    }

    return compressedFilePath;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

module.exports = { postTTS, listVoices, listGenerated };
