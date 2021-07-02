/* global bodyPix */

import OT from '@opentok/client';
import './styles.css';
import config from './config';
import session from './session';
import loadBodyPix from './load-bodypix';
import { createVideoElementForStream } from './video-element';

let blurEnabled = true;
const toggleButton = document.getElementById('toggleButton');
toggleButton.addEventListener('click', () => {
  blurEnabled = !blurEnabled;
  toggleButton.innerHTML = blurEnabled ? 'Disable blur' : 'Enable blur';
});

Promise.all([loadBodyPix(), OT.getUserMedia()]).then(([net, mediaStream]) => {
  const videoElement = createVideoElementForStream(mediaStream);
  const visibleCanvas = document.createElement('canvas');
  const hiddenCanvas = document.createElement('canvas');
  const croppedHiddenCanvas = document.createElement('canvas');
  const setCanvasSize = () => {
    visibleCanvas.width = videoElement.videoWidth;
    visibleCanvas.height = videoElement.videoHeight;
    hiddenCanvas.width = videoElement.videoWidth;
    hiddenCanvas.height = videoElement.videoHeight;
    croppedHiddenCanvas.width = videoElement.videoWidth;
    croppedHiddenCanvas.height = videoElement.videoHeight;
  };

  const setVideoSize = () => {
    videoElement.height = hiddenCanvas.height;
    videoElement.width = hiddenCanvas.width;
  };

  videoElement.addEventListener('loadedmetadata', () =>
    setTimeout(() => {
      setCanvasSize();

      const drawFrame = () => {
        hiddenCanvas
          .getContext('2d')
          .drawImage(
            videoElement,
            0,
            0,
            hiddenCanvas.width,
            hiddenCanvas.height
          );
        if (!blurEnabled) {
          // TODO work around correct and efficient way to do this i.e. stop calling animation frame
          croppedHiddenCanvas.getContext('2d').drawImage(hiddenCanvas, 0, 0);
          requestAnimationFrame(drawFrame);
          return;
        }

        setVideoSize();
        net.segmentPerson(videoElement).then((segmentation) => {
          const backgroundBlurAmount = 6;
          const edgeBlurAmount = 3;
          const flipHorizontal = false;
          bodyPix.drawBokehEffect(
            visibleCanvas,
            hiddenCanvas,
            segmentation,
            backgroundBlurAmount,
            edgeBlurAmount,
            flipHorizontal
          );
          // weird hack. The BodyPix lib leaves some transparent pixels around the edge which go black when streamed into publisher
          // Using an intermediary canvas gets rid of it.
          croppedHiddenCanvas.getContext('2d').drawImage(visibleCanvas, 0, 0);
        });
        requestAnimationFrame(drawFrame);
      };

      requestAnimationFrame(drawFrame);
    }, 300)
  );

  const publisherOptions = {
    // Pass in the canvas stream video track as our custom videoSource
    videoSource: croppedHiddenCanvas.captureStream(30).getVideoTracks()[0],
    // Pass in the audio track from our underlying mediaStream as the audioSource
    audioSource: mediaStream.getAudioTracks()[0],
    width: '100%',
    height: '100%',
    insertMode: 'append',
  };
  const publisher = OT.initPublisher(
    'publisherContainer',
    publisherOptions,
    (err) => {
      console.log(err);
    }
  );
  session.on('streamCreated', ({ stream }) => {
    session.subscribe(stream, 'subscriberContainer', {
      insertMode: 'append',
      width: '100%',
      height: '100%',
    });
  });
  session.connect(config.token, (err) => {
    if (err) {
      console.log(err);
    }
    session.publish(publisher);
  });
});
