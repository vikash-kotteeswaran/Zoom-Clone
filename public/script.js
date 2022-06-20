const socket = io('/');
const Video = document.createElement("video");
Video.id = 'User';
const videoGrid = document.querySelector('#video-grid');
let videoStream = true;
let audioStream = true;

Video.muted = true;

document.getElementsByClassName("main-right")[0].style.display = "none";
document.getElementsByClassName("main-left")[0].style.flexGrow = "1";

navigator.mediaDevices.getUserMedia({
    video: videoStream,
    audio: audioStream
}).then((stream) => {

    window.Stream = stream
    
    addVideoStream(Video, Stream);

    // WHY is peer declared inside getUserMedia?!!!!! : https://stackoverflow.com/questions/66937384/peer-oncalll-is-never-being-called
    window.peer = new Peer(undefined, {
        path: '/peerjs',
        host: '/',
        port: '3000'
    })

    peer.on('open', (userId) => {
        socket.emit('join-room', roomId, userId);
        
    })

    socket.on('clear-grid', (userId) => {
        document.getElementById(userId).remove();
    })


    connectMediaToNewUser(Stream);

    AnswerCallForFromUser(Stream);

    
})


const muteVideo = () => {
    if(audioStream == true){
        Stream.getTracks()[0].enabled = false;
        document.getElementsByClassName("fas fa-microphone")[0].className = "fas fa-microphone-slash";
    } else{
        Stream.getTracks()[0].enabled = true;
        document.getElementsByClassName("fas fa-microphone-slash")[0].className = "fas fa-microphone";
    }
    audioStream = !audioStream
}

const stopVideo = () => {
    if(videoStream == true){
        Stream.getTracks()[1].enabled = false;
        document.getElementsByClassName("fas fa-video")[0].className = "fas fa-video-slash";
    } else{
        Stream.getTracks()[1].enabled = true;
        document.getElementsByClassName("fas fa-video-slash")[0].className = "fas fa-video";
    }
    videoStream = !videoStream
}

const chatRoom = () => {
    const mainRightStyle = document.getElementsByClassName("main-right")[0].style;

    if(mainRightStyle.display == "none"){
        mainRightStyle.display = "flex";
    } else{
        mainRightStyle.display = "none";
        document.getElementsByClassName("main-left")[0].style.flexGrow = "1";
    }
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;

    video.addEventListener('loadedmetadata', () => {
        video.play()
        
    })
    videoGrid.append(video);

}

const connectMediaToNewUser = (stream) => {
    socket.on('new-user-connected', (otherUserId) => {
        const call = peer.call(otherUserId, stream);
        const AnswererVideo = document.createElement("video");
        AnswererVideo.id = otherUserId;
        // AnswererVideo.muted = true;
        call.on('stream', (AnswererStream) => {
            addVideoStream(AnswererVideo, AnswererStream)
        })
        
    })
}

const AnswerCallForFromUser = (stream) => {
    peer.on('call', call => {
        call.answer(stream);
        const CallerVideo = document.createElement("video");
        CallerVideo.id = call.peer;
        // CallerVideo.muted = true;
        call.on('stream', (CallerStream) => {
            addVideoStream(CallerVideo, CallerStream)
        })

    })
}


let message = $('.text-message');

$('html').keydown(key => {
    if(key.which == 13 && message.val().length != 0){
        console.log(message.val())
        socket.emit('message', message.val());
        message.val('');
    }
})


socket.on('createMessage', (textMessage, userId) => {
    $('.chats').append(
        `<li style='list-style:none; padding: 2% 0%'>
        <div class="message" style='border-radius:5px; background-color: rgba(94, 94, 94, 0.4); padding: 0% 3%; width:fit-content; max-width: 250px; word-wrap: break-word;'>
        <span style='font-weight: bold;'>user ${userId.slice(0, 4)}</span><br>
        <span style="max-width: 200px;">${textMessage}</span>
        </div>
        </li>`
    )
})



