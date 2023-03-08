

// ================= API ============== 
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
let token = '';

let authOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
  },
  body: 'grant_type=client_credentials'
};

fetch('https://accounts.spotify.com/api/token', authOptions)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    token = data.access_token;
  });
// ================= SEARCH BAR ============== 

let searchable = [];

const searchInput = document.getElementById('search')
const searchWrapper = document.querySelector('.wrapper')
const resultsWrapper = document.querySelector('.results')

searchInput.addEventListener('keyup', async (e) => {
  let input = searchInput.value;
  if (input.length >= 3) {
    const response = await fetch(`/api/toptracks?q=${input}`);
    const data = await response.json();
    const results = data.items.map((item) => ({
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

function renderResults(results) {
    if (!results.length) {
        return searchWrapper.classList.remove('show');
    }

    let content = results.map((item) => {
        return `<li>
            <img src="${item.image}" alt="${item.name}" />
            <div> 
                <p>${item.name} - ${item.artist}</p>
                <p>${item.album}</p>
            </div>
        </li>`
    }).join('')

    searchWrapper.classList.add('show')
    resultsWrapper.innerHTML = `<ul>${content}</ul>`;
}

//==========================================================//
searchInput.addEventListener('keyup', (e) => {
  let results = [];
  let input = searchInput.value;
  if (input.length >= 3) {
      fetch(`https://api.spotify.com/v1/search?q=${input}&type=track&limit=10`, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          results = data.tracks.items.map((item) => {
              return {
                  name: item.name, 
                  artist: item.artists.map((artist) => artist.name),
                  album: item.album.name,
                  image: item.album.images[0].url

              }
          });
          renderResults(results);
        })
  } else {
      renderResults(results);
  }   
});




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