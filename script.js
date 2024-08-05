const toggleList = document.querySelector(".dropDownOptns");
const dropDownBtn = document.querySelector(".dropDownBtn");
const icon = document.querySelector(".fa-list");
const dropDownBtnSpan = document.querySelector(".dropDownBtn span");
const lists = document.querySelectorAll("li");
const pausePlay = document.querySelector(".fa-circle-play");
const volumeIcon = document.querySelector(".fa-volume-high");
let songs;
dropDownBtn.addEventListener("click", function () {
  icon.classList.toggle("rotate");
  toggleList.classList.toggle("toggle");
});

lists.forEach((list) => {
  list.addEventListener("click", function () {
    dropDownBtnSpan.innerText = list.innerText;
    toggleList.classList.toggle("toggle");
  });
});

let currentAudio = new Audio();

async function getSongs() {
  let a = await fetch("http://127.0.0.1:5500/Songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a");

  let songs = [];
  for (let index = 0; index < anchor.length; index++) {
    const element = anchor[index];
    if (element.href.endsWith(".m4a")) {
      songs.push(element.href.split("/Songs/")[1]);
    }
  }
  return songs;
}

function secondsToMinutesSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const minutesFormatted = ("0" + minutes).slice(-2);
  const secondsFormatted = ("0" + remainingSeconds).slice(-2);

  const formattedTime = minutesFormatted + ":" + secondsFormatted;

  return formattedTime;
}

const playAudio = (track, pause = false) => {
  currentAudio.src = `/Songs/${track}`;

  currentAudio.addEventListener("loadedmetadata",  () => {
    document.getElementById("range").max = currentAudio.duration;
    document.getElementById("range").value = 0;
    const object = { lastSongName: track, lastSongTime: 0 };
    localStorage.setItem("lastSongPlayed", JSON.stringify(object));
  });

  if (!pause) {
    currentAudio.play();
    if (currentAudio.play) {
      pausePlay.classList.remove("fa-circle-play");
      pausePlay.classList.add("fa-circle-pause");
    } else {
      pausePlay.classList.add("fa-circle-play");
      pausePlay.classList.remove("fa-circle-pause");
    }
  }

  document.querySelector(".songInfo").innerText = track;
};

async function main() {
  songs = await getSongs();
  const localData = localStorage.getItem("lastSongPlayed");

  let track = songs[0];
  try {
    const data = JSON.parse(localData);
    track = data.lastSongName;
    currentAudio.currentTime = data.lastSongTime;
  } catch {
    track = songs[0];
  }

  playAudio(track, true);

  let songUL = document.querySelector(".main-playlist ul");
  let index = 1;
  for (let song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><span class = "number">${index++}</span><img class="invert" src="dark-side-of-the-moon-290.jpg" alt=""><span class="song-name">${song}</span> </li>`;
  }

  Array.from(document.querySelectorAll(".main-playlist li")).forEach((li) => {
    li.addEventListener("click", () => {
      let songName = li.querySelector(".song-name");
      if (songName) {
        playAudio(songName.innerHTML);
      }
    });
  });
}

pausePlay.addEventListener("click", function () {
  if (currentAudio.paused) {
    currentAudio.play();
    pausePlay.classList.remove("fa-circle-play");
    pausePlay.classList.add("fa-circle-pause");
  } else {
    currentAudio.pause();
    pausePlay.classList.remove("fa-circle-pause");
    pausePlay.classList.add("fa-circle-play");
  }
});

currentAudio.addEventListener("timeupdate", () => {
  let currentTime = currentAudio.currentTime;
  const localData = localStorage.getItem("lastSongPlayed");
  let track = 0;
  if (localData) {
    track = JSON.parse(localData);
  }
  const object = { ...track, lastSongTime: currentTime };
  localStorage.setItem("lastSongPlayed", JSON.stringify(object));

  document.querySelector(".start-time").innerHTML = `${secondsToMinutesSeconds(
    currentAudio.currentTime
  )}`;
  document.querySelector(".end-time").innerHTML = `${secondsToMinutesSeconds(
    currentAudio.duration
  )}`;
  document.getElementById("range").value = currentTime;
});

document.getElementById("range").addEventListener("input", function () {
  let seekTime = this.value;
  currentAudio.currentTime = seekTime;
});

document.getElementById("speaker").addEventListener("change", (e) => {
  currentAudio.volume = e.target.value / 100;
  if (currentAudio.volume === 0) {
    volumeIcon.classList.add("fa-volume-xmark");
  } else {
    volumeIcon.classList.remove("fa-volume-xmark");
  }
});

let lastVolume = 0;
volumeIcon.addEventListener("click", function () {
  volumeIcon.classList.toggle("fa-volume-xmark");
  if (currentAudio.volume === 0) {
    currentAudio.volume = lastVolume;
    document.getElementById("speaker").value = lastVolume * 100;
  } else {
    lastVolume = currentAudio.volume;
    currentAudio.volume = 0;
    document.getElementById("speaker").value = 0;
  }
});

const backward = document.querySelector(".fa-backward-step");
backward.addEventListener("click", () => {
  let index = songs.indexOf(currentAudio.src.split('/').slice(-1)[0]);
  if((index-1) >= 0) {
  playAudio(songs[index - 1])
  }
});

const forward = document.querySelector(".fa-forward-step");
forward.addEventListener("click", () => {
  let index = songs.indexOf(currentAudio.src.split('/').slice(-1)[0]);
  if(index + 1 > length) {
  playAudio(songs[index + 1])
}
});

const repeat = document.querySelector(".fa-rotate-left")
repeat.addEventListener('click', () => {
  console.log("clicked")
  
})

main();
