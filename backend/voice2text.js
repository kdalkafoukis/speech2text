const port = process.env.PORT || 8080;
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const speech = require('@google-cloud/speech');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const client = new speech.SpeechClient();

const upload = multer({ storage: multer.memoryStorage() });

app.post('/', upload.single('audio'), (req, res) => {

  const audioBytes = req.file.buffer.toString('base64');

  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 44100,
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };

client
  .recognize(request)
  .then(data => {
    const response = data[0];
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);
    res.send(transcription);
  })
  .catch(err => {
    console.error('ERROR:', err);
    res.send(err);
  });

});

app.listen(port, () => console.log(`Server listening on port ${port}`));
