
const Video = document.createElement("video");
const videoGrid = document.querySelector('#video-grid');

Video.muted = true;

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

navigator.mediaDevices.getUserMedia({
    video: true, 
    audio: true
}).then((stream) => {
    addVideoStream(Video, stream);

})

