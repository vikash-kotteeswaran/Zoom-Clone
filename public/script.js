const socket = io('/');
const Video = document.createElement("video");
Video.id = 'User';
const videoGrid = document.querySelector('#video-grid');

Video.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true, 
    audio: true
}).then((stream) => {
    
    addVideoStream(Video, stream);

    // WHY!!!!!! : https://stackoverflow.com/questions/66937384/peer-oncalll-is-never-being-called
    
    window.peer = new Peer(undefined, {
        path: '/peerjs',
        host: '/',
        port: '3000'
    })

    peer.on('open', (userId) => {
        socket.emit('join-room', roomId, userId);
    })

    connectMediaToNewUser(stream);

    AnswerCallForFromUser(stream);

    
})



const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);

}

const connectMediaToNewUser = (stream) => {
    socket.on('new-user-connected', (otherUserId) => {
        const call = peer.call(otherUserId, stream);
        const AnswererVideo = document.createElement("video");
        AnswererVideo.id = 'otherUser:' + otherUserId;
        AnswererVideo.muted = true;
        call.on('stream', (AnswererStream) => {
            addVideoStream(AnswererVideo, AnswererStream)
        })
        
    })
}

const AnswerCallForFromUser = (stream) => {
    peer.on('call', call => {
        call.answer(stream);
        const CallerVideo = document.createElement("video");
        CallerVideo.id = 'otherUser:' + call.peer;
        CallerVideo.muted = true;
        call.on('stream', (CallerStream) => {
            addVideoStream(CallerVideo, CallerStream)
        })

    })
}




