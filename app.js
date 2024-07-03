const videoDOM = document.getElementById('my-custom-video-play');
const seekbarDOM = document.getElementsByClassName('seekbar');
const seekbarTimersDOM = document.querySelector('.seekbar.timer');
const seekbarVolumeDOM = document.querySelector('.seekbar.sound');
const playpauseDOM = document.getElementsByClassName('play-pause')[0];
const soundmuteDOM = document.getElementsByClassName('sound-mute')[0];
const remainDOM = document.getElementById('remain');
const fullScreenDOM = document.getElementsByClassName('full-screen')[0];
const previewThumbnailDOM = document.getElementById('preview-thumbnail');
const videoPlaylistDOM = document.querySelectorAll('#video-playlist li');
 
// Property
const isMuted = videoDOM.hasAttribute("muted");
const isAutoplay = videoDOM.hasAttribute("autoplay");
var videoInterval;
 
// init
setInitialVideoOptions();
 
// set handlers
Array.from(seekbarDOM).forEach((element) => {
    element.addEventListener("click", seekbarDOMHandlerClicked);
    element.addEventListener("mousemove", seekbarDOMHandlerClicked);
    element.addEventListener("mousemove", seekbarDOMHandlerShowThumbnail);
});
 
Array.from(videoPlaylistDOM).forEach((element) => {
    element.addEventListener("click", videoPlaylistDOMHandlerClicked);
});
 
 
 
videoInterval = setInterval(VideoOnUpdateTime, 100)
 
playpauseDOM.addEventListener('click', playpauseDOMHandlerClicked);
fullScreenDOM.addEventListener('click', fullScreenDOMHandlerClicked);
window.addEventListener("dblclick", windowHandlerExitFullScreen);
window.addEventListener("keyup", windowHandlerShortcut);
window.addEventListener("mousemove", seekbarDOMHandlerShowThumbnail);
 
 
// handlers
function seekbarDOMHandlerClicked(event) {
 
    if (event.type != 'click' && event.buttons == 0) return false;
 
    const thisElement = this;
    const isSoundSeekbar = thisElement.classList.contains("sound");
    const isTimerSeekbar = thisElement.classList.contains("timer");
 
    if (isMuted && isSoundSeekbar) return false;
 
    const progressElement = thisElement.querySelector("#progress");
    const finallWidth = moveRangeSlider(thisElement , event)
 
    if (finallWidth < 0 || 100 < finallWidth) return;
    progressElement.style.width = finallWidth + "%";
    if (isTimerSeekbar) {
        videoDOM.currentTime = getNumberByPercent(finallWidth, videoDOM.duration);
        videoDOM.play()
    } else if (isSoundSeekbar) {
        if (thisElement.querySelector('#progress').clientWidth == 0) soundmuteDOM.classList.add("mute")
        else soundmuteDOM.classList.remove("mute")
        videoDOM.volume = finallWidth / 100;
    }
}
 
function videoPlaylistDOMHandlerClicked(){
    const thisElement = this;
    clearInterval(videoInterval);
    videoDOM.pause();
    const videoSrc = thisElement.dataset.src;
    videoDOM.src = videoSrc;
    videoDOM.load();
     
    videoDOM.onloadeddata = function(){
        setInitialVideoOptions();
        videoInterval = setInterval(VideoOnUpdateTime, 100)
        videoDOM.play()
    }
    makePlaylistElementActive(videoPlaylistDOM);
}
 
function seekbarDOMHandlerShowThumbnail(event){
    if(typeof event.target.hasAttribute == "undefined") return false;
 
    var videoFrame = getNumberByPercent(Math.round(moveRangeSlider(seekbarTimersDOM , event)), videoDOM.duration)
 
    if(!event.target.hasAttribute('data-preview') || (videoFrame < 0 || 100 < videoFrame)){
        previewThumbnailDOM.style.display = "none";
        return false;
    }
 
    videoFrame = Math.round(Math.abs(videoFrame)) == 0 ? 1 : Math.round(Math.abs(videoFrame));
    var videoName = videoDOM.getAttribute('src');
    videoName = videoName.substring(videoName.lastIndexOf('/'));
    videoName = videoName.replace(/\/|\.mp4/gi , "");
    const frameFileTemplate = `static/video/thumbnails/${videoName} (${videoFrame}).png`;
     
    previewThumbnailDOM.querySelector('img').src = frameFileTemplate;
     
     
    const previewThumbnailXY = {
        x : previewThumbnailDOM.clientWidth,
        y : previewThumbnailDOM.clientHeight,
    }
 
    previewThumbnailDOM.style.left = event.screenX - previewThumbnailXY.x - 60 + "px";
    previewThumbnailDOM.style.top = event.screenY - previewThumbnailXY.y - 200 + "px";
    previewThumbnailDOM.style.display = "block";
 
     
     
}
 
function videoDOMHandlerProgress() {
    const videoBufferedLastTimeRange = (videoDOM.buffered.length - 1);
    if (videoBufferedLastTimeRange < 0) return 0;
 
    const timeBuffered = videoDOM.buffered.end(videoBufferedLastTimeRange);
    return timeBuffered;
}
 
function VideoOnUpdateTime() {
    updateVideoPausePlayState();
    const bufferedTimeAll = videoDOM.duration;
    const bufferedTime = videoDOMHandlerProgress();
    seekbarTimersDOM.querySelector('#loaded').style.width = getPercentByNumber(bufferedTime, bufferedTimeAll) + "%";
    seekbarTimersDOM.querySelector('#progress').style.width = getPercentByNumber(videoDOM.currentTime, bufferedTimeAll) + "%";
    remainDOM.textContent = `- ${toMinutes(Math.round(videoDOM.duration - videoDOM.currentTime))}`;
}
 
function playpauseDOMHandlerClicked() {
    const thisElement = playpauseDOM;
    if (thisElement.classList.contains("pause")) {
        thisElement.classList.remove("pause");
        videoDOM.pause();
    } else {
        thisElement.classList.add("pause");
        videoDOM.play();
    }
}
 
function fullScreenDOMHandlerClicked() {
    if (videoDOM.requestFullscreen)
        videoDOM.requestFullscreen();
}
 
function windowHandlerExitFullScreen() {
    if (screen.height == window.innerHeight)
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
}
 
function windowHandlerShortcut(event){
    if(event.code == "Space"){
        playpauseDOMHandlerClicked();
    }
 
    if(event.code == "KeyF"){
        fullScreenDOMHandlerClicked();
    }
}
 
// helpers
function getPercentByNumber(piece, total) {
    const percent = piece / total * 100;
    return percent;
}
 
function getNumberByPercent(percent, total) {
    const number = percent * total / 100;
    return number;
}
 
function setInitialVideoOptions() {
    videoDOM.currentTime = 0;
    if (isAutoplay && isMuted) {
        playpauseDOM.classList.add("pause");
    }
 
    if (isMuted) {
        soundmuteDOM.classList.add("mute");
        seekbarVolumeDOM.classList.add("disabled");
    } else {
        videoDOM.volume = 0.5;
        document.querySelector('.sound #progress').style.width = '50%';
    }
 
    makePlaylistElementActive(videoPlaylistDOM);
}
 
function toMinutes(seconds) {
    let tmpSeconds = seconds;
    let minuteCounter = 0;
    let finallTime = "";
    while (true) {
        if (tmpSeconds < 60) {
            tmpSeconds = tmpSeconds.toString().padStart(2, '0');
            minuteCounter = minuteCounter.toString().padStart(2, '0');
            finallTime = `${minuteCounter}:${tmpSeconds}`;
        }
        tmpSeconds -= 60;
        minuteCounter++;
        if (tmpSeconds <= 0) break;
    }
 
    return finallTime;
}
 
function moveRangeSlider(element , event){
    const coordinate = element.getBoundingClientRect();
    const width = coordinate.width;
    const offset = {
        x: Math.round(coordinate.left),
        y: Math.round(coordinate.top),
    }
    const finallWidth = getPercentByNumber(Math.round(event.clientX - offset.x), width);
    return finallWidth;
}
 
function makePlaylistElementActive(elements){
    Array.from(elements).forEach((element)=>{
        element.classList.remove("active");
        if(decodeURI(videoDOM.src).search(element.dataset.src) != -1){
            element.classList.add("active");
        }
    });
}
 
function updateVideoPausePlayState(){
    if(videoDOM.paused){
        playpauseDOM.classList.remove("pause");
    }else{
        playpauseDOM.classList.add("pause");
    }
}
