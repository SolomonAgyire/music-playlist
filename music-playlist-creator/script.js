const likedPlaylists = {};

let playlists = [];

function initializePlaylists() {
    const storedPlaylists = localStorage.getItem('playlists');
    if (storedPlaylists) {
        playlists = JSON.parse(storedPlaylists);
        loadPlaylistCards();
    } else {
        // If no stored playlists
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                playlists = data.playlists;
                
                localStorage.setItem('playlists', JSON.stringify(playlists));
                loadPlaylistCards();
            })
            .catch(error => {
                console.error('Error loading playlists:', error);
                //error
                playlists = [];
                loadPlaylistCards();
            });
    }
}

function displayFeaturedPlaylist() {
    if (!document.querySelector('.featured-container')) return;

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const playlists = data.playlists;
            const randomIndex = Math.floor(Math.random() * playlists.length);
            const featuredPlaylist = playlists[randomIndex];

        
            document.getElementById('featuredImage').src = featuredPlaylist.playlist_art;
            document.getElementById('featuredTitle').textContent = featuredPlaylist.playlist_name;
            document.getElementById('featuredAuthor').textContent = featuredPlaylist.playlist_author;

        
            const songsList = document.getElementById('featuredSongs');
            songsList.innerHTML = featuredPlaylist.songs.map(song => `
                <li>
                    <div class="song-title-row">
                    <span class="song-title">${song.songtitle}</span>
                        <span class="song-duration">${song.duration}</span>
                    </div>
                    <div class="song-artist">Artist: ${song.artistname}</div>
                    <div class="song-album">Album: ${song.albumname}</div>
                </li>
            `).join('');
        });
}


function loadPlaylistCards() {
            const cards = document.querySelector('.playlist-cards');
    if (!cards) return;

            cards.innerHTML = '';
    
    if (playlists.length === 0) {
        cards.innerHTML = '<p class="no-playlists">No playlist yet, create one!</p>';
        return;
    }
            
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
                <span class="like-btn" title="Like">♡</span>
                        <span class="like-count">${playlist.likes}</span>
            </div>
            <div class="card-actions">
                <button class="edit-btn" title="Edit Playlist">✎</button>
                <button class="delete-btn" title="Delete Playlist">×</button>
                    </div>
                `;
                cards.appendChild(card);
            });

            CardEvents(playlists);
            LikeButtons(playlists);
    EditButtons(playlists);
    DeleteButtons(playlists);
}


function CardEvents(playlists) {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.onclick = function(e) {
            if (e.target.classList.contains('like-btn') || e.target.classList.contains('like-count')) {
                return;
            }
            openModal(playlists[index]);
        };
    });
}


function LikeButtons(playlists) {
    const likeBtns = document.querySelectorAll('.like-btn');
    likeBtns.forEach((btn, index) => {
        btn.onclick = function(e) {
            e.preventDefault();
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

function EditButtons(playlists) {
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach((btn, index) => {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const playlist = playlists[index];
            openEditModal(playlist);
        };
    });
}

function DeleteButtons(playlists) {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach((btn, index) => {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const playlist = playlists[index];
            if (confirm(`Are you sure you want to delete "${playlist.playlist_name}"?`)) {
                deletePlaylist(playlist.playlistID);
            }
        };
    });
}


function createPlaylistFormModal(isEdit = false, playlistToEdit = null) {
    const existingModal = document.getElementById('playlistFormModal');
    if (existingModal) existingModal.remove();

    // Modal HTML 
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'playlistFormModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" id="closeFormModal">&times;</span>
            <h2>${isEdit ? 'Edit Playlist' : 'Create New Playlist'}</h2>
            <form id="playlistForm">
                <div class="form-group">
                    <label for="playlistName">Playlist Name:</label>
                    <input type="text" id="playlistName" name="playlistName" required>
                </div>
                <div class="form-group">
                    <label for="playlistAuthor">Playlist Author:</label>
                    <input type="text" id="playlistAuthor" name="playlistAuthor" required>
                </div>
                <div class="songs-container">
                    <h3>Songs</h3>
                    <div id="songsList"></div>
                    <button type="button" id="addSongBtn" class="add-song-btn">Add Song</button>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">${isEdit ? 'Save Changes' : 'Create Playlist'}</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Show modal
    setTimeout(() => modal.classList.add('active'), 10);

    // Close modal logic
    const closeFormBtn = modal.querySelector('#closeFormModal');
    closeFormBtn.onclick = function() {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    };

    const songsList = modal.querySelector('#songsList');
    function addSongEntry(song = { songtitle: '', artistname: '', duration: '' }) {
        const songEntry = document.createElement('div');
        songEntry.className = 'song-entry';
        songEntry.innerHTML = `
            <input type="text" placeholder="Song Title" value="${song.songtitle}" required>
            <input type="text" placeholder="Artist Name" value="${song.artistname}" required>
            <input type="text" placeholder="Duration" value="${song.duration}" required>
            <button type="button" class="remove-song-btn">×</button>
        `;
        songEntry.querySelector('.remove-song-btn').onclick = function() {
            songEntry.remove();
        };
        songsList.appendChild(songEntry);
    }
    modal.querySelector('#addSongBtn').onclick = function(e) {
        e.preventDefault();
        addSongEntry();
    };


    if (isEdit && playlistToEdit) {
        modal.querySelector('#playlistName').value = playlistToEdit.playlist_name;
        modal.querySelector('#playlistAuthor').value = playlistToEdit.playlist_author;
        songsList.innerHTML = '';
        playlistToEdit.songs.forEach(song => addSongEntry(song));
    } else {
        // empty song
        addSongEntry();
    }

    // Form 
    modal.querySelector('#playlistForm').onsubmit = function(e) {
        e.preventDefault();
        const playlistData = {
            playlistID: isEdit && playlistToEdit ? playlistToEdit.playlistID : Date.now().toString(),
            playlist_name: modal.querySelector('#playlistName').value,
            playlist_author: modal.querySelector('#playlistAuthor').value,
            playlist_art: "assets/img/image.png",
            likes: isEdit && playlistToEdit ? playlistToEdit.likes : 0,
            songs: []
        };
        const songEntries = songsList.getElementsByClassName('song-entry');
        for (let entry of songEntries) {
            const inputs = entry.getElementsByTagName('input');
            playlistData.songs.push({
                songtitle: inputs[0].value,
                artistname: inputs[1].value,
                duration: inputs[2].value,
                albumname: "Custom Playlist"
            });
        }
        if (isEdit && playlistToEdit) {
            const index = playlists.findIndex(p => p.playlistID === playlistToEdit.playlistID);
            if (index !== -1) playlists[index] = playlistData;
        } else {
            playlists.push(playlistData);
        }
        savePlaylists();
        modal.classList.remove('active');
        modal.remove();
    };
}

// playlist btn
document.addEventListener('DOMContentLoaded', function() {
    initializePlaylists();
    SearchAndSort();
    const createPlaylistBtn = document.getElementById('createPlaylistBtn');
    if (createPlaylistBtn) {
        createPlaylistBtn.onclick = function() {
            createPlaylistFormModal(false);
        };
    }
});


function openEditModal(playlist) {
    createPlaylistFormModal(true, playlist);
}

function deletePlaylist(playlistId) {
    if (confirm('Are you sure you want to delete this playlist?')) {
        playlists = playlists.filter(p => p.playlistID !== playlistId);
        savePlaylists();
    }
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
                    <div class="song-title-row">
                    <span class="song-title">${song.songtitle}</span>
                        <span class="song-duration">${song.duration}</span>
                    </div>
                    <div class="song-artist">Artist: ${song.artistname}</div>
                    <div class="song-album">Album: ${song.albumname}</div>
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
    modalOverlay.onclick = function(e) {
        if (event.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    };
}

// Shuffle 
function shufflePlaylist(playlistID) {
    const songsList = document.getElementById(`playlist-songs-${playlistID}`);
    if (!songsList) return;

    // Get all song items as an array
    const songItems = Array.from(songsList.getElementsByClassName('song-item'));
    // Fisher-Yates shuffle
    for (let i = songItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [songItems[i], songItems[j]] = [songItems[j], songItems[i]];
    }
    // Remove all children
    while (songsList.firstChild) {
        songsList.removeChild(songsList.firstChild);
    }
    // Re-append in shuffled order
    songItems.forEach(item => songsList.appendChild(item));
}

// main page reload 
document.addEventListener('DOMContentLoaded', () => {
    displayFeaturedPlaylist();
    loadPlaylistCards();
});

function savePlaylists() {
    localStorage.setItem('playlists', JSON.stringify(playlists));
    loadPlaylistCards();
}

// Add search and sort functionality
function SearchAndSort() {
    const playlistCards = document.querySelector('.playlist-cards');
    if (!playlistCards) return;

    // Create search and sort container
    const searchSortContainer = document.createElement('div');
    searchSortContainer.className = 'search-sort-container';
    searchSortContainer.innerHTML = `
        <div class="search-container">
            <div class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>
            <input type="text" class="search-input" placeholder="Search playlists..." style="display: none;">
        </div>
        <select class="sort-select">
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="likes-desc">Most Liked</option>
            <option value="likes-asc">Least Liked</option>
        </select>
    `;

    // Insert before playlist cards
    playlistCards.parentNode.insertBefore(searchSortContainer, playlistCards);

    //  search functionality
    const searchIcon = searchSortContainer.querySelector('.search-icon');
    const searchInput = searchSortContainer.querySelector('.search-input');

    searchIcon.addEventListener('click', () => {
        searchInput.style.display = searchInput.style.display === 'none' ? 'block' : 'none';
        if (searchInput.style.display === 'block') {
            searchInput.focus();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterAndSortPlaylists(searchTerm, searchSortContainer.querySelector('.sort-select').value);
    });

    //  sort functionality
    const sortSelect = searchSortContainer.querySelector('.sort-select');
    sortSelect.addEventListener('change', () => {
        filterAndSortPlaylists(searchInput.value.toLowerCase(), sortSelect.value);
    });
}

function filterAndSortPlaylists(searchTerm, sortOption) {
    let filteredPlaylists = [...playlists];

    // Filter playlists
    if (searchTerm) {
        filteredPlaylists = filteredPlaylists.filter(playlist => 
            playlist.playlist_name.toLowerCase().includes(searchTerm) ||
            playlist.playlist_author.toLowerCase().includes(searchTerm)
        );
    }

    // Sort playlists
    switch (sortOption) {
        case 'name-asc':
            filteredPlaylists.sort((a, b) => a.playlist_name.localeCompare(b.playlist_name));
            break;
        case 'name-desc':
            filteredPlaylists.sort((a, b) => b.playlist_name.localeCompare(a.playlist_name));
            break;
        case 'likes-desc':
            filteredPlaylists.sort((a, b) => b.likes - a.likes);
            break;
        case 'likes-asc':
            filteredPlaylists.sort((a, b) => a.likes - b.likes);
            break;
    }

    // Update display
    const cards = document.querySelector('.playlist-cards');
    cards.innerHTML = '';
    
    if (filteredPlaylists.length === 0) {
        cards.innerHTML = '<p class="no-playlists">No playlists found matching your search.</p>';
        return;
    }

    filteredPlaylists.forEach(playlist => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${playlist.playlist_art}" alt="${playlist.playlist_name}" class="card-img">
            <div class="card-details">
                <h3 class="card-title">${playlist.playlist_name}</h3>
                <p class="card-author">${playlist.playlist_author}</p>
            </div>
            <div class="card-likes-row">
                <span class="like-btn" title="Like">♡</span>
                <span class="like-count">${playlist.likes}</span>
            </div>
            <div class="card-actions">
                <button class="edit-btn" title="Edit Playlist">✎</button>
                <button class="delete-btn" title="Delete Playlist">×</button>
            </div>
        `;
        cards.appendChild(card);
    });

    // Re- event listeners for the filtered cards
    CardEvents(filteredPlaylists);
    LikeButtons(filteredPlaylists);
    EditButtons(filteredPlaylists);
    DeleteButtons(filteredPlaylists);
}