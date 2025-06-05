//playlist
const likedPlaylists = {};

function displayFeaturedPlaylist() {
    if (!document.querySelector('.featured-container')) return;

    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            const playlists = data.playlists;
            const randomIndex = Math.floor(Math.random() * playlists.length);
            const featuredPlaylist = playlists[randomIndex];

            // Update 
            document.getElementById('featuredImage').src = featuredPlaylist.playlist_art;
            document.getElementById('featuredTitle').textContent = featuredPlaylist.playlist_name;
            document.getElementById('featuredAuthor').textContent = featuredPlaylist.playlist_author;

            // Update songs list
            const songsList = document.getElementById('featuredSongs');
            songsList.innerHTML = featuredPlaylist.songs.map(song => `
                <li>
                    <span class="song-title">${song.songtitle}</span>
                    <span class="song-artist">Artist: ${song.artistname}</span>
                    <span class="song-album">Album: ${song.albumname}</span>
                </li>
            `).join('');
        });
}


function loadPlaylistCards() {
    if (!document.querySelector('.playlist-cards')) return;

    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            const playlists = data.playlists;
            const cards = document.querySelector('.playlist-cards');
            cards.innerHTML = '';
            
            playlists.forEach(playlist => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <img src="${playlist.playlist_art}" alt="${playlist.playlist_name}" class="card-img">
                    <div class="card-details">
                        <h3 class="card-title">${playlist.playlist_name}</h3>
                        <p class="card-author">${playlist.playlist_author}</p>
                    </div>
                    <div class="card-likes-row">
                        <span class="like-btn" title="Like">&#10084;&#65039;</span>
                        <span class="like-count">${playlist.likes}</span>
                    </div>
                `;
                cards.appendChild(card);
            });

            //Listen
            setupCardEvents(playlists);
            setupLikeButtons(playlists);
        });
}


function setupCardEvents(playlists) {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.onclick = function(e) {
            if (e.target.classList.contains('like-btn')) return;
            openModal(playlists[index]);
        };
    });
}


function setupLikeButtons(playlists) {
    const likeBtns = document.querySelectorAll('.like-btn');
    likeBtns.forEach((btn, index) => {
        btn.onclick = function(e) {
            e.stopPropagation();
            const playlist = playlists[index];
            const likeCountSpan = btn.nextElementSibling;
            const isLiked = likedPlaylists[playlist.playlistID];
            
            if (isLiked) {
                playlist.likes--;
                likedPlaylists[playlist.playlistID] = false;
                btn.classList.remove('liked');
            } else {
                playlist.likes++;
                likedPlaylists[playlist.playlistID] = true;
                btn.classList.add('liked');
            }
            likeCountSpan.textContent = playlist.likes;
        };
    });
}


const modalOverlay = document.getElementById('playlistModal');
const closeModalBtn = document.getElementById('closeModal');
const modalDetails = document.getElementById('modalDetails');

function openModal(playlist) {
    modalDetails.innerHTML = `
        <h2>${playlist.playlist_name}</h2>
        <div class="modal-author">${playlist.playlist_author}</div>
        <img src="${playlist.playlist_art}" alt="${playlist.playlist_name}" class="modal-img">
        <button class="shuffle-btn" onclick="shufflePlaylist(${playlist.playlistID})">🔀 Shuffle</button>
        <ul id="playlist-songs-${playlist.playlistID}">
            ${playlist.songs.map(song => `
                <li class="song-item">
                    <span class="song-title">${song.songtitle}</span>
                    <span class="song-artist">Artist: ${song.artistname}</span>
                    <span class="song-album">Album: ${song.albumname}</span>
                </li>
            `).join('')}
        </ul>
    `;
    modalOverlay.classList.add('active');
}

// Close modal
if (closeModalBtn) {
    closeModalBtn.onclick = function() {
        modalOverlay.classList.remove('active');
    };
}

if (modalOverlay) {
    modalOverlay.onclick = function(event) {
        if (event.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    };
}

// Shuffle 
function shufflePlaylist(playlistID) {
    const songsList = document.getElementById(`playlist-songs-${playlistID}`);
    if (!songsList) return;

    const songItems = Array.from(songsList.getElementsByClassName('song-item'));
    for (let i = songItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        songsList.appendChild(songItems[j]);
    }
}

// main page reload 
document.addEventListener('DOMContentLoaded', () => {
    displayFeaturedPlaylist();
    loadPlaylistCards();
});