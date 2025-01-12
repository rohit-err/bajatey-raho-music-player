//script.js


let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let As = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < As.length; index++) {
        const element = As[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    if (songs.length === 0) {
        songUL.innerHTML = "<li>No songs found in this album.</li>"; // Add fallback message
    } else {
        for (const song of songs) {
            songUL.innerHTML += `<li> 
         <img class="invert" src="img/music.svg" alt="">
         <div class="info">
         <div class="song-title">${song.replaceAll("%20", " ")}</div>  <!-- Add a class for song title -->
         <div>Harry</div>
         </div>
         <div class="playnow">
         <span>Play Now</span>
         <img class="invert" src="img/play.svg" alt="">
         </div>
         </li>`;

        }
    }

    // Add click listeners after rendering
    Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            playMusic(e.getElementsByTagName("div")[0].firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

    document.querySelectorAll(".songList li").forEach((li) => li.classList.remove("playing"));

    // Find the correct li based on the song title inside the .song-title div
    const currentSongLi = Array.from(document.querySelectorAll(".songList li")).find((li) => {
        const songTitle = li.querySelector(".song-title").innerText.trim();  // Get the song title text
        return songTitle === track.replaceAll("%20", " "); // Compare the titles
    });

    // Add the "playing" class to the current song li
    if (currentSongLi) currentSongLi.classList.add("playing");
};



async function displayAlbums(params) {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {

            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}
async function main() {
    await getSongs("songs/cs")
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums()


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"

        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    document.querySelector(".seekbar").addEventListener("mousemove", (e) => {
        const seekbar = e.target.getBoundingClientRect();
        const tooltip = document.querySelector(".seek-tooltip");

        if (!tooltip) {
            console.error("Tooltip element not found!");
            return;
        }

        const hoverTime = (e.offsetX / seekbar.width) * currentSong.duration;

        // Show hover time as a tooltip
        tooltip.style.left = `${e.offsetX}px`;
        tooltip.innerHTML = secondsToMinutesSeconds(hoverTime);
        tooltip.style.visibility = "visible";
    });

    document.querySelector(".seekbar").addEventListener("mouseleave", () => {
        const tooltip = document.querySelector(".seek-tooltip");
        if (tooltip) {
            tooltip.style.visibility = "hidden";
        }
    });


    document.querySelector(".vengeance").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".CLOSE").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        console.log("previous clicked")
        console.log(currentSong.src)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        console.log("next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case " ":
                e.preventDefault();
                play.click();
                break;
            case "ArrowRight":
                next.click();
                break;
            case "ArrowLeft":
                previous.click();
                break;
            case "ArrowUp":
                currentSong.volume = Math.min(currentSong.volume + 0.1, 1);
                break;
            case "ArrowDown":
                currentSong.volume = Math.max(currentSong.volume - 0.1, 0);
                break;
        }
    });


}
main()
