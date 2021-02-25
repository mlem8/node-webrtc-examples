'use strict';

const { PassThrough } = require('stream');
const { RTCAudioSink } = require('wrtc').nonstandard;
const Speaker = require('speaker');

const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 48000,
  device: 'hw:1,0',
});
// 'hw:0,0' = HDMIxxx
// 'hw:1,0' = 3.5mm

function beforeOffer(peerConnection) {
  const audioTransceiver = peerConnection.addTransceiver('audio');
  const audioSink = new RTCAudioSink(audioTransceiver.receiver.track);
  const audioStream = new PassThrough();

  const onAudioData = ({ samples: { buffer } }) => {
    audioStream.push(Buffer.from(buffer));
  };
  audioSink.addEventListener('data', onAudioData);
  audioStream.pipe(speaker);

  audioStream.on('end', () => {
    audioSink.removeEventListener('data', onAudioData);
  });

  const { close } = peerConnection;
  peerConnection.close = function() {
    audioSink.stop();
    return close.apply(this, arguments);
  }
}

module.exports = { beforeOffer };
