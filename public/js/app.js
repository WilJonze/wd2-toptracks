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

function processVoteHistory(
  trackID,
  vote = null,
  buttons = null,
  trackParentElem = null
) {
  const history = JSON.parse(localStorage.getItem("voteHistory"));

  const voteIndex = history.findIndex((item) => {
    return Object.keys(item).indexOf(trackID.toString()) === 0;
  });

  // If index < 0, song isn't in vote history. Add it.
  if (vote !== null && voteIndex < 0) {
    const voteData = {};
    voteData[trackID] = vote;
    history.push(voteData);
  } else if (!vote && !buttons) {
    // Remove the song from vote history when de-selecting a vote
    history.splice(voteIndex, 1);
  } else if (voteIndex >= 0 && vote !== null) {
    history[voteIndex][trackID] = vote;
  }

  // This function gets called when creating the track items
  // It will automatically select the correct vote arrow
  // when loaded
  if (buttons) {
    if (voteIndex >= 0) {
      trackParentElem.setAttribute("data-pv", true);
      if (history[voteIndex][trackID] === "U") {
        buttons[0].classList.add("selected");
      } else {
        buttons[1].classList.add("selected");
      }
    }
  }

  localStorage.setItem("voteHistory", JSON.stringify(history));
}

// Will create upvote/downvote buttons within the element
// passed into the function
function createVoteButtons(element, trackData = null) {
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
  const trackID = trackData.id || element.getAttribute("data-song-id");

  let songCount = trackData.upvotes - trackData.downvotes || 0;

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

  // Event listeners for upvote/downvote buttons, that record the vote, change arrow color,
  // and disable the button that was clicked to prevent multiple votes.
  iconUpvote.addEventListener("click", (e) => {
    if (!e.target.classList.contains("selected")) {
      e.target.classList.add("selected");

      // Remove styling from downvote if it's actively set when upvoting
      if (iconDownvote.classList.contains("selected")) {
        iconDownvote.classList.remove("selected");
        songCount += 2;
        if (element.getAttribute("data-pv") === "true")
          castVote("like", trackID);
      } else {
        songCount++;
      }

      castVote("like", trackID);
      processVoteHistory(trackID, "U");
      likeCount.textContent = songCount;
    } else {
      e.target.classList.remove("selected");
      processVoteHistory(trackID);

      castVote("dislike", trackID);

      songCount--;
      likeCount.textContent = songCount;
    }
  });

  iconDownvote.addEventListener("click", (e) => {
    if (!e.target.classList.contains("selected")) {
      e.target.classList.add("selected");

      if (iconUpvote.classList.contains("selected")) {
        iconUpvote.classList.remove("selected");
        if (element.getAttribute("data-pv") === "true")
          castVote("dislike", trackID);
        songCount -= 2;
      } else {
        songCount--;
      }

      castVote("dislike", trackID);
      processVoteHistory(trackID, "D");

      likeCount.textContent = songCount;
    } else {
      e.target.classList.remove("selected");
      iconUpvote.classList.remove("selected");

      castVote("like", trackID);
      processVoteHistory(trackID);

      songCount++;
      likeCount.textContent = songCount;
    }
  });

  // Pass everything in to allow it to be selected (if it is) when the song loads in the chart
  processVoteHistory(trackID, null, [iconUpvote, iconDownvote], element);
  voteContainer.appendChild(btnUpvote);
  voteContainer.appendChild(btnDownvote);
  element.appendChild(voteContainer);
}

async function castVote(vote, songID) {
  const response = await fetch(`http://127.0.0.1:3000/vote/${vote}:${songID}`);
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

  return { songRank: rank + 1, songDetails: allTracks[rank] };
}

function createNewSongLabel() {
  const label = document.createElement("div");

  label.classList.add("new-song-label");
  label.textContent = "New Song Added!";

  return label;
}

function setChosenSong(song, data = null) {
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

  trackInfo.classList.add("song-info");
  trackInfo.appendChild(titleArtist);
  trackInfo.appendChild(album);

  trackDetails.appendChild(createNewSongLabel());
  searchWrapper.classList.remove("show");
  chosenSong.classList.remove("no-display");

  const newSongLabel = document.querySelector(".new-song-label");
  if (data === "New song added to list!") {
    newSongLabel.classList.add("fade-in");
    chosenRank.textContent = "";
  }

  // Find the rank of the selected song
  const trackRank = getTrackRank(song);
  trackRank.then((data) => {
    chosenRank.textContent =
      data.songRank < 10 ? `0${data.songRank}` : data.songRank;
    createVoteButtons(trackDetails, data.songDetails);
    const iconUpvote = trackDetails.querySelector(".arrow-up");
    const iconDownvote = trackDetails.querySelector(".arrow-down");
    processVoteHistory(
      data.songDetails.id,
      null,
      [iconUpvote, iconDownvote],
      trackDetails
    );
  });

  trackDetails.appendChild(chosenRank);
  trackDetails.appendChild(albumImg);
  trackDetails.appendChild(trackInfo);
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

  setChosenSong(songObj, data);
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
  if (wrapperElem !== "li") {
    song.setAttribute("data-song-id", trackInfo.id);
  }
  song.setAttribute(
    "data-album-img",
    trackInfo.album_img_url || trackInfo.image
  );
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
    createVoteButtons(newTrack, trackData[i]);
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

function initializeVoteHistory() {
  if (!localStorage.getItem("voteHistory")) {
    localStorage.setItem("voteHistory", JSON.stringify([]));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initializeVoteHistory();
  displayChart();
});
