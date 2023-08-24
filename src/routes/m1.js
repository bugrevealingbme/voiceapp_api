const { Router } = require('express');
const router = Router();

const appController = require('../controllers/app_controller');

const { validateAll } = require('../middlewares/mobile_validators');
const { getBody } = require('../middlewares/helper');

// #endregion

// #region Auth Route
router.get('/', (req, res) => res.status(200).send('OK'));
router.post('/post-tts', validateAll, getBody, appController.postTTS);
router.post('/list-voices', validateAll, getBody, appController.listVoices);
router.post('/list-generated', validateAll, getBody, appController.listGenerated);


module.exports = router;
