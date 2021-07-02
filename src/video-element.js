export const createVideoElementForStream = (mediaStream) => {
  const videoElement = document.createElement('video');
  videoElement.srcObject = mediaStream;
  videoElement.setAttribute('playsinline', '');
  videoElement.muted = true;
  setTimeout(() => {
    videoElement.play();
  });
  return videoElement;
};
