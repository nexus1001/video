document.getElementById("kyouyu").onclick = function() {
   const stream = navigator.mediaDevices.getDisplayMedia({ video: true });
   const call = peer.call('e5440a0d-d51b-4519-a1b7-40cf0e222f4b', stream);

  // ...
}; 

(async function() {
  // ..

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  const call = peer.call('remote-peerId', stream);

  // 音声のみミュート
  stream.getAudioTracks().forEach(track => track.enabled = false);

  // ...
}());
