 function onClickSend() {
  // ..
  const kyouyu = document.getElementById("kyouyu")
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const call = peer.call('remote-peerId', stream);

  // ...
}());
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
