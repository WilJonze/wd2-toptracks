
// ================= SEARCH BAR ==============

let searchable = [];

const searchInput = document.getElementById("search");
const searchWrapper = document.querySelector(".wrapper");
const resultsWrapper = document.querySelector(".results");
const resultsList = document.querySelector(".results ul");
const chosenSong = document.querySelector(".chosensong");

searchInput.addEventListener("keyup", async (e) => {
  let input = searchInput.value;
  if (input.length >= 3) {
    const response = await fetch(`/api/toptracks?query=${input}`);
    const data = await response.json();
    const results = data.tracks.items.map((item) => ({
      name: item.name,
      artist: item.artists.map((artist) => artist.name),
      album: item.album.name,
      image: item.album.images[0].url,
    }));
    renderResults(results);
    chosenSong.classList.add("no-display");
  } else {
    renderResults([]);
  }
});

// Will create upvote/downvote buttons within the element
// passed into the function
function createVoteButtons(element) {
  const voteContainer = document.createElement("div");
  voteContainer.setAttribute("id", "vote-container");

  const btnUpvote = document.createElement("button");
  const btnDownvote = document.createElement("button");
  const likeCount = document.createElement("span");
  const voteColumn = document.createElement("div");
  const upvoteDiv = document.createElement("div");
  const downvoteDiv = document.createElement("div");
  const iconUpvote = document.createElement("i");
  const iconDownvote = document.createElement("i");
  
  let songCount = 0;

  btnUpvote.classList.add("btn-upvote");
  iconUpvote.classList.add("fa", "fa-solid", "fa-arrow-up", "arrow-up");
  upvoteDiv.style.display = "block";

  likeCount.classList.add("like-count");
  likeCount.setAttribute("id", "count-element");
  likeCount.textContent = songCount;

  

  btnDownvote.classList.add("btn-downvote");
  iconDownvote.classList.add("fa", "fa-solid", "fa-arrow-down", "arrow-down");
  downvoteDiv.style.display = "block";

  upvoteDiv.appendChild(iconUpvote);
  downvoteDiv.appendChild(iconDownvote);
  voteColumn.appendChild(upvoteDiv);
  voteColumn.appendChild(likeCount);
  voteColumn.appendChild(downvoteDiv);
  voteContainer.appendChild(voteColumn);

  let hasVoted = false;

  // Event listeners for upvote/downvote buttons, that record the vote, change arrow color, 
  // and disable the button that was clicked to prevent multiple votes. 
  iconUpvote.addEventListener("click", (e) => {
    if (btnDownvote.disabled) {
      btnUpvote.disabled = false;
      return;
    }

    if (!hasVoted) {
    e.target.disabled = true;
    btnDownvote.disabled = true;
    e.target.style.color = "#268bff";
    
    castVote(
      "like",
      e.target.parentElement.parentElement.parentElement.parentElement.getAttribute(
        "data-song-id"
      )
    );
    songCount++;
    likeCount.textContent = songCount;
    console.log(songCount)
    hasVoted = false;
      } else {
       e.target.disabled = false;
       btnDownvote.disabled = false;
       e.target.style.color = "";

       castVote(
          "undo-like",
          e.target.parentElement.parentElement.parentElement.parentElement.getAttribute(
            "data-song-id"
          )
       );

       songCount--;
        likeCount.textContent = songCount;
        console.log(songCount)
        hasVoted = false;
        
       }
});

iconDownvote.addEventListener("click", (e) => {
  if (btnUpvote.disabled) {
    btnDownvote.disabled = false;
    return;
  }

  if (!hasVoted) {
  e.target.disabled = true;
  btnUpvote.disabled = true;
  e.target.style.color = "red";

  castVote(
    "dislike",
    e.target.parentElement.parentElement.parentElement.parentElement.getAttribute(
      "data-song-id"
    )
  );
  songCount--;
  likeCount.textContent = songCount;
  hasVoted = true;
  console.log(songCount)
  } else {
    e.target.disabled = false;
    btnUpvote.disabled = false;
    e.target.style.color = "";

    castVote(
      "undo-dislike",
      e.target.parentElement.parentElement.parentElement.parentElement.getAttribute(
        "data-song-id"
      )
    );

    songCount++;
    likeCount.textContent = songCount;
    hasVoted = false;
    console.log(songCount)
  }
});

  voteContainer.appendChild(btnUpvote);
  voteContainer.appendChild(btnDownvote);
  element.appendChild(voteContainer);
}

async function castVote(vote, songID) {
  const response = await fetch(`http://127.0.0.1:3000/vote/${vote}:${songID}`);
  const data = await response.json();
}

async function getTrackRank(trackInfo) {
  const response = await fetch("http://127.0.0.1:3000/all-songs");
  const allTracks = await response.json();

  const rank = allTracks.findIndex((currentTrack) => {
    return (
      currentTrack.track === trackInfo.trackName &&
      currentTrack.album === trackInfo.album
    );
  });

  // Added these fields to allow up/downvote buttons to work in
  // selected song field as well as in track chart
  const chosenSongField = document.querySelector("#chosenSongDetails");
  chosenSongField.setAttribute("data-song-id", allTracks[rank].id);

  return rank + 1;
}

function setChosenSong(song) {
  const trackDetails = document.querySelector("#chosenSongDetails");
  searchInput.value = "";
  trackDetails.innerHTML = "";

  const chosenRank = document.createElement("h2");
  chosenRank.classList.add("ranking-numbers", "chosen-song-numbers");

  const albumImg = document.createElement("img");
  albumImg.src = song.albumImg;
  albumImg.classList.add("album-img");

  const trackInfo = document.createElement("div");
  const titleArtist = document.createElement("p");
  const album = document.createElement("p");

  titleArtist.textContent = `${song.trackName} — ${song.artist}`;
  album.textContent = song.album;

  trackInfo.appendChild(titleArtist);
  trackInfo.appendChild(album);

  // Find the rank of the selected song
  const trackRank = getTrackRank(song);
  trackRank.then((data) => {
    chosenRank.textContent = data < 10 ? `0${data}` : data;
  });
  searchWrapper.classList.remove("show");
  chosenSong.classList.remove("no-display");

  trackDetails.appendChild(chosenRank);
  trackDetails.appendChild(albumImg);
  trackDetails.appendChild(trackInfo);
  createVoteButtons(trackDetails);
}

async function selectSong() {
  songObj = {
    albumImg: this.getAttribute("data-album-img"),
    album: this.getAttribute("data-album-title"),
    trackName: this.getAttribute("data-track-name"),
    artist: this.getAttribute("data-artist"),
  };
  const request = new Request("/song", {
    method: "POST",
    body: JSON.stringify(songObj),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await fetch(request);
  const data = await response.json().catch((err) => err);

  //The above code will throw an error when a new song is
  // added to the list. Error doesn't crash or break anything
  // but it's an error regardless. Need to fix that
  // Quieted with catch.

  setChosenSong(songObj);
}

// TODO: This function is super long. Needs refactoring
function createTrackItem(trackInfo, wrapperElem = "li", addedClasses = []) {
  const song = document.createElement(wrapperElem);
  const albumImg = document.createElement("img");
  const albumName = document.createElement("p");
  const songAndArtist = document.createElement("p");
  const songInfo = document.createElement("div");

  let trackName = "";

  if (trackInfo.hasOwnProperty("album_img_url")) {
    albumImg.src = trackInfo.album_img_url;
  } else {
    albumImg.src = trackInfo.image;
  }

  if (trackInfo.hasOwnProperty("name")) {
    trackName = trackInfo.name;
  } else {
    trackName = trackInfo.track;
  }
  albumImg.alt = trackName;
  songInfo.classList.add("song-info");
  songAndArtist.textContent = `${trackName} - ${trackInfo.artist}`;
  albumName.textContent = trackInfo.album;

  // Add data to song info div
  songInfo.appendChild(songAndArtist);
  songInfo.appendChild(albumName);

  // Add all info to wrapperElem
  song.appendChild(albumImg);
  song.appendChild(songInfo);

  // Add data attributes to wrapperElem to pull via JS
  song.setAttribute("data-song-id", trackInfo.id);
  song.setAttribute("data-album-img", trackInfo.image);
  song.setAttribute("data-album-title", trackInfo.album);
  song.setAttribute("data-track-name", trackName);
  song.setAttribute("data-artist", trackInfo.artist);

  // Only adding this event listener to the li elements
  // for the moment since they will be search results
  if (wrapperElem === "li") {
    song.addEventListener("click", selectSong);
  }

  // Add classes that were passed in to wrapper element
  for (c of addedClasses) {
    song.classList.add(c);
  }

  return song;
}

async function displayChart() {
  const response = await fetch("http://127.0.0.1:3000/all-songs");
  const trackData = await response.json();
  const chart = document.querySelector(".ranking-chart");
  const chartClasses = ["ranking-module", "fade-in"];

  let delay = 1;

  for (let i = 0; i < trackData.length; i++) {
    const newTrack = createTrackItem(trackData[i], "div", chartClasses);
    const rank = document.createElement("h2");
    rank.classList.add("ranking-numbers");
    newTrack.style = `animation-delay: ${delay}s`;
    delay += 0.1;

    // trackData is sorted array returned by all-songs route
    // add 1 to item index to get song rank
    if (i + 1 < 10) {
      rank.textContent = "0" + (i + 1);
    } else {
      rank.textContent = i + 1;
    }
    newTrack.prepend(rank); // Might be able to mix this into createTrackItem
    createVoteButtons(newTrack);
    chart.appendChild(newTrack);
  }
}

function renderResults(results) {
  if (!results.length) {
    return searchWrapper.classList.remove("show");
  }

  // Clear current list before rendering new one
  resultsList.innerHTML = "";


  results.forEach((item) => {
    resultsList.appendChild(createTrackItem(item));
  });

  searchWrapper.classList.add("show");
 
}

displayChart();
