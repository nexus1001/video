const Peer = window.Peer;

(async function main() {
  var localVideo = document.getElementById('js-local-stream');
  const toggleCamera = document.getElementById('js-toggle-camera');
  const toggleMicrophone = document.getElementById('js-toggle-microphone');
  const cameraStatus = document.getElementById('camera-status');
  const microphoneStatus = document.getElementById('microphone-status');
  const toggleMediaStream = document.getElementById('js-toggle-mediastream');
 // const videoTrigger = document.getElementById('js-videoleave-trigger');
 // const audioTrigger = document.getElementById('js-audioleave-trigger');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const remoteVideos = document.getElementById('js-remote-streams');
  const roomId = document.getElementById('js-room-id');
  const roomMode = document.getElementById('js-room-mode');
  const localText = document.getElementById('js-local-text');
  const sendTrigger = document.getElementById('js-send-trigger');
  const toggleNameId = document.getElementById('js-toggle-nameId');
  const messages = document.getElementById('js-messages');
  const meta = document.getElementById('js-meta');
  const sdkSrc = document.querySelector('script[src*=skyway]');
  var nameId;
  var mail = document.getElementById('js-mailId-text').value;
 // var media = ;
  meta.innerText = `
    UA: ${navigator.userAgent}
    SDK: ${sdkSrc ? sdkSrc.src : 'unknown'}
  `.trim();

  const getRoomModeByHash = () => (location.hash === '#sfu' ? 'sfu' : 'mesh');

  roomMode.textContent = getRoomModeByHash();
  window.addEventListener(
    'hashchange',
    () => (roomMode.textContent = getRoomModeByHash())
  );
//getUserMedia ユーザーの許可に基づいて、システム上のカメラや画面共有機能、マイクを起動して、入力と共にビデオトラックや
//  オーディオトラックを含む MediaStream を提供します。
  var localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
   //   audio: false,
      video: {
        width: 200,
        height: 180
      }
    //  video: false,
    })
    .catch(console.error);
  // カメラオフ
  toggleCamera.addEventListener('click', () => {
  const videoTracks = localStream.getVideoTracks()[0];
  videoTracks.enabled = !videoTracks.enabled;
  cameraStatus.textContent = `カメラ${videoTracks.enabled ? 'ON' : 'OFF'}`;
});
 // 音声のミュート
toggleMicrophone.addEventListener('click', () => {
  const audioTracks = localStream.getAudioTracks()[0];
  audioTracks.enabled = !audioTracks.enabled;
  microphoneStatus.textContent = `マイク${audioTracks.enabled ? 'ON' : 'OFF'}`;
});
  // 名前入力
toggleNameId.addEventListener('click', () => {
 nameId = document.getElementById('js-nameId-text').value;
});
  // 画面共有
toggleMediaStream.addEventListener('click', () => {
  //"user strict";
  const mediaStreamConstraints = {
  audio: true,
  video: true
};

localVideo = document.querySelector("js-local-stream");

function gotLocalMediaStream(mediaStream) {
  localStream = mediaStream;
  localVideo.srcObject = mediaStream;
}

function handleLocalMediaStreamError(error) {
  console.log("navigator.getUserMedia error: ", error);
}

navigator.mediaDevices
  .getDisplayMedia(mediaStreamConstraints)
  .then(gotLocalMediaStream)
  .catch(handleLocalMediaStreamError);
});

  // Render local stream
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  // eslint-disable-next-line require-atomic-updates
  const peer = (window.peer = new Peer({
    key: 'e5440a0d-d51b-4519-a1b7-40cf0e222f4b',
    debug: 3,
  }));

  // Register join handler
  joinTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
    if (!peer.open) {
      return;
    }

    const room = peer.joinRoom(roomId.value, {
      mode: getRoomModeByHash(),
      stream: localStream,
    });

    room.once('open', () => {
      messages.textContent += '=== You joined ===\n';
    });
    room.on('peerJoin', peerId => {
      messages.textContent += `===　${peerId} joined ===\n`;
    });

    // Render remote stream for new peer join in the room
    room.on('stream', async stream => {
      const newVideo = document.createElement('video');
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      // mark peerId to find it later at peerLeave event
      newVideo.setAttribute('data-peer-id', stream.peerId);
      remoteVideos.append(newVideo);
      await newVideo.play().catch(console.error);
    });

    room.on('data',({ data, src }) => {
      // Show a message sent to the room and who sent
      messages.textContent +=`${data}\n`;
    });

    // for closing room members
    room.on('peerLeave', peerId => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id=${peerId}]`
      );
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();

      messages.textContent += `=== ${peerId} left ===\n`;
    });

    // for closing myself
    room.once('close', () => {
      sendTrigger.removeEventListener('click', onClickSend);
      messages.textContent += '== You left ===\n';
      Array.from(remoteVideos.children).forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    });

    sendTrigger.addEventListener('click', onClickSend);
    leaveTrigger.addEventListener('click', () => room.close(), { once: true });
    // メッセージの送信
    function onClickSend() {
      // Send message to all of the peers in the room via websocket
      room.send(nameId);
      room.send(localText.value);
      //messages.textContent +=localText.value;
      messages.textContent +=`${nameId}:${localText.value}\n`;
     // mail.value=`${nameId}:${localText.value}`
      localText.value ='';
    }
    
  });

  peer.on('error', console.error);
})();
