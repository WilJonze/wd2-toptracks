// ================= API ==============
// const client_id = process.env.CLIENT_ID;
// const client_secret = process.env.CLIENT_SECRET;
// let token = '';

// let authOptions = {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
//     'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
//   },
//   body: 'grant_type=client_credentials'
// };

// fetch('https://accounts.spotify.com/api/token', authOptions)
//   .then(function(response) {
//     return response.json();
//   })
//   .then(function(data) {
//     token = data.access_token;
//   });
// ================= SEARCH BAR ==============

let searchable = [];

const searchInput = document.getElementById("search");
const searchWrapper = document.querySelector(".wrapper");
const resultsWrapper = document.querySelector(".results");
const resultsList = document.querySelector(".results ul");

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
  } else {
    renderResults([]);
  }
});

async function setChosenSong(song) {
  const chosenSong = document.querySelector(".chosensong");
  const response = await fetch("http://127.0.0.1:3000/all-songs");
  const allTracks = await response.json();
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
  const songRank =
    allTracks.findIndex((track) => {
      return track.track === song.trackName && track.album === song.album;
    }) + 1;

  searchWrapper.classList.remove("show");
  chosenSong.classList.remove("no-display");
  chosenRank.textContent = songRank < 10 ? `0${songRank}` : songRank;

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

  setChosenSong(songObj);
}

function createTrackItem(trackInfo) {
  const song = document.createElement("li");
  const albumImg = document.createElement("img");
  const albumName = document.createElement("p");
  const songAndArtist = document.createElement("p");
  const songInfo = document.createElement("div");

  albumImg.src = trackInfo.image;
  albumImg.alt = trackInfo.name;
  songInfo.classList.add("song-info");
  songAndArtist.textContent = `${trackInfo.name} - ${trackInfo.artist}`;
  albumName.textContent = trackInfo.album;

  // Add data to song info div
  songInfo.appendChild(songAndArtist);
  songInfo.appendChild(albumName);

  // Add all info to song li
  song.appendChild(albumImg);
  song.appendChild(songInfo);

  // Add data attributes to li to pull via JS
  song.setAttribute("data-album-img", trackInfo.image);
  song.setAttribute("data-album-title", trackInfo.album);
  song.setAttribute("data-track-name", trackInfo.name);
  song.setAttribute("data-artist", trackInfo.artist);

  song.addEventListener("click", selectSong);

  // Add song li to search results list
  return song;
}

async function displayChart() {
  const response = await fetch("http://127.0.0.1:3000/all-songs");
  const trackData = await response.json();

  console.log(trackData);
}

function renderResults(results) {
  if (!results.length) {
    return searchWrapper.classList.remove("show");
  }

  // Clear current list before rendering new one
  resultsList.innerHTML = "";

  // let content = results
  //   .map((item) => {
  //     return `<li onclick="selectSong()">
  //           <img src="${item.image}" alt="${item.name}" />
  //           <div class="song-info">
  //               <p>${item.name} - ${item.artist}</p>
  //               <p>${item.album}</p>
  //           </div>
  //       </li>`;
  //   })
  //   .join("");

  results.forEach((item) => {
    resultsList.appendChild(createTrackItem(item));
  });

  searchWrapper.classList.add("show");
  // resultsWrapper.innerHTML = `<ul>${content}</ul>`;
}

//==========================================================//
// searchInput.addEventListener('keyup', (e) => {
//   let results = [];
//   let input = searchInput.value;
//   if (input.length >= 3) {
//       fetch(`https://api.spotify.com/v1/search?q=${input}&type=track&limit=10`, {
//           headers: {
//             'Authorization': 'Bearer ' + token
//           }
//         })
//         .then(function(response) {
//           return response.json();
//         })
//         .then(function(data) {
//           results = data.tracks.items.map((item) => {
//               return {
//                   name: item.name,
//                   artist: item.artists.map((artist) => artist.name),
//                   album: item.album.name,
//                   image: item.album.images[0].url

//               }
//           });
//           renderResults(results);
//         })
//   } else {
//       renderResults(results);
//   }
// });

// ========== Old way of calling API ==========
// const client_id = process.env.CLIENT_ID;
// const client_secret = process.env.CLIENT_SECRET;
// let token = '';

// let authOptions = {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
//     'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
//   },
//   body: 'grant_type=client_credentials'
// };

// fetch('https://accounts.spotify.com/api/token', authOptions)
//   .then(function(response) {
//     return response.json();
//   })
//   .then(function(data) {
//     token = data.access_token;
//   });

displayChart();
