const socket = io('/');
const Video = document.createElement("video");
Video.muted = true;
Video.id = 'User';
const videoGrid = document.querySelector('#video-grid');
let nUsers = 1;

document.getElementsByClassName("main-right")[0].style.display = "none";
document.getElementsByClassName("main-left")[0].style.flexGrow = "1";

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {

    window.Stream = stream
    
    addVideoStream(Video, Stream);

    // WHY is peer declared inside getUserMedia?!!!!! : https://stackoverflow.com/questions/66937384/peer-oncalll-is-never-being-called
    window.peer = new Peer(undefined, {
        path: '/peerjs',
        host: '/',
        port: '443'
    })

    peer.on('open', (userId) => {
        window.UserId = userId;
        socket.emit('join-room', roomId, userId);
    })

    socket.on('clear-grid', (userId) => {
        document.getElementById(userId).remove();
        nUsers -= 1;
        changeVideoSize()
    })


    connectMediaToNewUser(Stream);

    AnswerCallForFromUser(Stream);
    
})


const muteVideo = () => {
    const audioStream = Stream.getTracks()[0].enabled;
    if(audioStream){
        Stream.getTracks()[0].enabled = false;
        document.getElementsByClassName("mute-button")[0].innerHTML = `<i class="unmute fas fa-microphone-slash"></i> 
                                                                       <span class="unmute-span">Unmute</span>`;
    } else{
        Stream.getTracks()[0].enabled = true;
        document.getElementsByClassName("mute-button")[0].innerHTML = `<i class="mute fas fa-microphone"></i> 
                                                                       <span class="mute-span">Mute</span>`;
    }
}

const stopVideo = () => {
    const videoStream = Stream.getTracks()[1].enabled;
    if(videoStream){
        Stream.getTracks()[1].enabled = false;
        document.getElementsByClassName("stop-button")[0].innerHTML = `<i class="play-video fas fa-video-slash"></i>
                                                                        <span class="play-video-span">Play video</span>`;
    } else{
        Stream.getTracks()[1].enabled = true;
        document.getElementsByClassName("stop-button")[0].innerHTML = `<i class="stop-video fas fa-video"></i>
                                                                        <span class="stop-video-span">Stop video</span>`;
    }
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
        nUsers += 1;
        const call = peer.call(otherUserId, stream);
        const AnswererVideo = document.createElement("video");
        AnswererVideo.id = otherUserId;
        // AnswererVideo.muted = true;
        call.on('stream', (AnswererStream) => {
            addVideoStream(AnswererVideo, AnswererStream)
        })
        changeVideoSize()
    })
}

const AnswerCallForFromUser = (stream) => {
    peer.on('call', call => {
        nUsers += 1;
        call.answer(stream);
        const CallerVideo = document.createElement("video");
        CallerVideo.id = call.peer;
        // CallerVideo.muted = true;
        changeVideoSize()
        call.on('stream', (CallerStream) => {
            addVideoStream(CallerVideo, CallerStream)
        })
        changeVideoSize()
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
    let DivRight = "";
    let SpanRight = "";

    if(userId == UserId){
        DivRight = "margin-left: auto; margin-right: 0;";
        SpanRight = "float: right;"
    }
    $('.chats').append(
        `<li style='list-style:none; padding: 2% 3%;'>
        <div class="message" style="${DivRight}">
        <span style='font-weight: bold;${SpanRight}'>user ${userId.slice(0, 4)}</span><br>
        <span style="max-width: 200px;">${textMessage}</span>
        </div>
        </li>`
    )
    scrollBottom()
})


const scrollBottom = () => {
    let chatDiv = $('.chat-area');
    chatDiv.scrollTop(chatDiv.prop('scrollHeight'));
}

const VideoGridDiv = (n) =>{
    if(n == 3){
        return 2;
    }
    const sqrN = Math.sqrt(n);
    if(sqrN%1 != 0){
        return Math.floor(sqrN);
    } else{
        return sqrN;
    }
}

const changeVideoSize = () => {
    const rows = VideoGridDiv(nUsers);
    console.log(nUsers, rows, Math.round(90/rows), Math.round(90/Math.ceil(nUsers/rows)));
    document.documentElement.style.setProperty('--h1', `${Math.round(90/rows)}%`);
    document.documentElement.style.setProperty('--w1', `${Math.round(90/Math.ceil(nUsers/rows))}%`);
}


