// get local stream
navigator.mediaDevices
  .getUserMedia(constraints)
    .then(stream => {
      localStream = stream
    })
    .catch(error => {
      // error handling
    })
const updateVideoEnabled = (enabled) => {
  if (localStream) {
    localStream.getVideoTracks()[0].enabled = enabled
  }
}
const updateAudioEnabled = (enabled) => {
  if (localStream) {
    localStream.getAudioTracks()[0].enabled = enabled
  }
}