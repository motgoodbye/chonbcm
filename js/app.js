// The song data is available globally from songs.js

// Favorite songs management class
class FavoriteSongs {
    constructor() {
        this.favorites = new Set(this.loadFavorites());
        this.updateFavoritesDisplay();
    }

    loadFavorites() {
        const saved = localStorage.getItem('favoriteSongs');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('favoriteSongs', JSON.stringify([...this.favorites]));
        this.updateFavoritesDisplay();
    }

    toggleFavorite(songId) {
        if (this.favorites.has(songId)) {
            this.favorites.delete(songId);
        } else {
            this.favorites.add(songId);
        }
        this.saveFavorites();
        this.updateHeartButton(songId);
    }

    removeFavorite(songId) {
        this.favorites.delete(songId);
        this.saveFavorites();
        this.updateHeartButton(songId);
    }

    updateHeartButton(songId) {
        const buttons = document.querySelectorAll(`.heart-btn[data-id="${songId}"]`);
        const isFav = this.favorites.has(songId);
        buttons.forEach(button => {
            button.classList.toggle('active', isFav);
            button.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i>`;
            button.title = isFav ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích';
        });
    }

    updateFavoritesDisplay() {
        const favoritesContainer = document.getElementById('favorites-list');
        const favCount = document.querySelector('.favorites-count');
        favCount.textContent = this.favorites.size;

        if (this.favorites.size === 0) {
            favoritesContainer.innerHTML = `
                <div class="no-favorites">
                    <i class="far fa-heart"></i>
                    Chưa có Bài Ca Mới yêu thích nào. 
                    Nhấn vào biểu tượng trái tim để thêm Bài Ca Mới vào danh sách yêu thích.
                </div>
            `;
            return;
        }

        const favoritesList = [...this.favorites].map(id => {
            const song = songs.find(s => s.id === id);
            if (!song) return '';
            return `
                <div class="favorite-item">
                    <div class="favorite-info">
                        <span class="song-number">#${song.id}</span>
                        <a href="${song.link}" target="_blank">${song.title}</a>
                        <span class="song-duration">${song.duration}</span>
                    </div>
                    <button class="remove-btn" 
                        onclick="favoriteSongs.removeFavorite('${song.id}')" 
                        title="Xóa khỏi danh sách yêu thích">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        favoritesContainer.innerHTML = favoritesList;
    }

    isFavorite(songId) {
        return this.favorites.has(songId);
    }
}

// Initialize favorites
let favoriteSongs;
document.addEventListener('DOMContentLoaded', () => {
    favoriteSongs = new FavoriteSongs();
    window.favoriteSongs = favoriteSongs; // Make it globally accessible for button clicks

    // User guide collapsible
    const collapsibleGuide = document.querySelector('.collapsible-guide');
    const guideContent = document.querySelector('.guide-content');
    
    if(collapsibleGuide && guideContent) {
        collapsibleGuide.addEventListener('click', function() {
            guideContent.classList.toggle('active');
        });
    }
    
});


// Utility functions
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Array of appx song IDs
const appxSongIds = ['PL1', 'PL2', 'PL3', 'PL4', 'PL5'];

function getMultipleRandomItems(arr, count) {
    // Create weighted array with different weights for different song types
    const weightedArr = arr.reduce((acc, item) => {
        acc.push(item); // Add the item once (all songs appear at least once)
        
        // Check if it's an appx song (7x chance)
        if (appxSongIds.includes(item.id)) {
            // Add appx items 6 more times (7 times total)
            for (let i = 0; i < 6; i++) {
                acc.push(item);
            }
        }
        // Check if it's a favorite song (3x chance)
        else if (favoriteSongs.isFavorite(item.id)) {
            // Add favorite items 2 more times (3 times total)
            for (let i = 0; i < 2; i++) {
                acc.push(item);
            }
        }
        return acc;
    }, []);

    // Shuffle and select items
    const shuffled = weightedArr.sort(() => 0.5 - Math.random());
    const selected = [];
    const selectedIds = new Set();

    // Select unique items
    for (let item of shuffled) {
        if (selected.length >= count) break;
        if (!selectedIds.has(item.id)) {
            selected.push(item);
            selectedIds.add(item.id);
        }
    }

    return selected;
}

function secondsToTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Display functions
function displaySongs(selectedSongs, message = "") {
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    
    const totalSeconds = selectedSongs.reduce((acc, song) => acc + song.seconds, 0);
    document.getElementById('total-time').textContent = `${secondsToTime(totalSeconds)}`;

    const resultHtml = selectedSongs.map(song => `
        <div class="selected-song">
            <div>
                <span class="song-number">#${song.id}</span>
                <a href="${song.link}" target="_blank">${song.title}</a>
                <span class="song-duration">${song.duration}</span>
            </div>
            <button class="heart-btn ${favoriteSongs.isFavorite(song.id) ? 'active' : ''}" 
                onclick="favoriteSongs.toggleFavorite('${song.id}')"
                data-id="${song.id}"
                title="${favoriteSongs.isFavorite(song.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}">
                <i class="${favoriteSongs.isFavorite(song.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
        </div>
    `).join('');

    document.getElementById('results-list').innerHTML = resultHtml;
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function displayFullSongList() {
    const fullListBtn = document.getElementById('show-full-list-btn');
    const fullListContainer = document.getElementById('full-song-list-container');
    
    fullListBtn.addEventListener('click', function() {
        if (fullListContainer.style.display === 'none' || !fullListContainer.style.display) {
            fullListContainer.style.display = 'block';
            fullListBtn.innerHTML = '<i class="fas fa-times"></i> Ẩn danh sách đầy đủ';
            
            const songsHtml = songs.map(song => `
                <div class="song-item">
                    <div>
                        <span class="song-number">#${song.id}</span>
                        <a href="${song.link}" target="_blank">${song.title}</a>
                        <span class="song-duration">${song.duration}</span>
                    </div>
                    <button class="heart-btn ${favoriteSongs.isFavorite(song.id) ? 'active' : ''}" 
                        onclick="favoriteSongs.toggleFavorite('${song.id}')"
                        data-id="${song.id}"
                        title="${favoriteSongs.isFavorite(song.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}">
                        <i class="${favoriteSongs.isFavorite(song.id) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            `).join('');
            
            document.getElementById('full-song-list').innerHTML = songsHtml;
        } else {
            fullListContainer.style.display = 'none';
            fullListBtn.innerHTML = '<i class="fas fa-th-list"></i> Xem danh sách đầy đủ';
        }
    });
}

// Selection functions
function generateRandomSelection(minSeconds, maxSeconds) {
    // Try to find combinations of songs that have a total time in the target range
    let attempts = 100; // Maximum number of attempts to find a valid combination
    let validSelection = null;
    
    while (attempts > 0 && validSelection === null) {
        const count = Math.floor(Math.random() * 2) + 3; // Random between 3-4 songs
        const randomSongs = getMultipleRandomItems(songs, count);
        const totalSeconds = randomSongs.reduce((acc, song) => acc + song.seconds, 0);
        
        if (totalSeconds >= minSeconds && totalSeconds <= maxSeconds) {
            validSelection = randomSongs;
            break;
        }
        
        attempts--;
    }
    
    if (validSelection === null) {
        alert('Không tìm thấy tổ hợp BCM nào có tổng thời gian từ ' + 
              Math.floor(minSeconds / 60) + ':' + (minSeconds % 60).toString().padStart(2, '0') + 
              ' đến ' + 
              Math.floor(maxSeconds / 60) + ':' + (maxSeconds % 60).toString().padStart(2, '0'));
        return;
    }
    
    displaySongs(validSelection);
}

function generateTopicSongs(topic) {
    const topicSongs = songs.filter(song => song.topic === topic);
    if (topicSongs.length === 0) {
        alert('Không có BCM nào thuộc chủ đề này!');
        return;
    }
    
    const randomCount = Math.floor(Math.random() * 2) + 3; // Random between 3-4
    const selectedSongs = getMultipleRandomItems(topicSongs, randomCount);
    displaySongs(selectedSongs);
}

function generateShortSongs() {
    // Songs under 1:45 (105 seconds)
    const shortSongs = songs.filter(song => song.seconds < 105);
    if (shortSongs.length === 0) {
        alert('Không có BCM nào dưới 1:45!');
        return;
    }
    
    const randomCount = Math.floor(Math.random() * 2) + 3; // Random between 3-4
    const selectedSongs = getMultipleRandomItems(shortSongs, randomCount);
    displaySongs(selectedSongs);
}

function generateTwoMinuteSongs() {
    // Songs between 1:45-2:14 (105-134 seconds)
    const twoMinuteSongs = songs.filter(song => 
        song.seconds >= 105 && song.seconds <= 134
    );
    if (twoMinuteSongs.length === 0) {
        alert('Không có BCM nào khoảng 2 phút!');
        return;
    }
    
    const randomCount = Math.floor(Math.random() * 2) + 3; // Random between 3-4
    const selectedSongs = getMultipleRandomItems(twoMinuteSongs, randomCount);
    displaySongs(selectedSongs);
}

function generateTimeRangeSongs(minSeconds, maxSeconds) {
    const filteredSongs = songs.filter(song => 
        song.seconds >= minSeconds && song.seconds <= maxSeconds
    );
    
    if (filteredSongs.length === 0) {
        alert('Không có BCM nào thỏa mãn thời gian này!');
        return;
    }
    
    const randomCount = Math.floor(Math.random() * 2) + 3; // Random between 3-4
    const selectedSongs = getMultipleRandomItems(filteredSongs, randomCount);
    displaySongs(selectedSongs);
}

// Scroll-to-top functionality
function toggleScrollButton() {
    const scrollButton = document.getElementById('scroll-to-top');
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollButton.style.display = 'flex';
    } else {
        scrollButton.style.display = 'none';
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Tab navigation functionality
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.selection-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding panel
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-panel`).classList.add('active');
        });
    });
}

// Close full song list
function initCloseFullList() {
    const closeBtn = document.getElementById('close-full-list');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('full-song-list-container').style.display = 'none';
            document.getElementById('show-full-list-btn').textContent = 'Xem danh sách đầy đủ';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize favorites
    favoriteSongs = new FavoriteSongs();
    window.favoriteSongs = favoriteSongs; // Make it globally accessible for button clicks
    
    // Initialize scroll-to-top functionality
    window.addEventListener('scroll', toggleScrollButton);
    document.getElementById('scroll-to-top').addEventListener('click', scrollToTop);
    
    // Initialize the full song list display
    displayFullSongList();
    
    // Initialize tab navigation
    initTabNavigation();
    
    // Initialize close button for full song list
    initCloseFullList();
});

// Make functions globally accessible for HTML buttons
// When not using modules, we can either use window.X or just declare them globally
generateRandomSelection = generateRandomSelection;
generateTopicSongs = generateTopicSongs;
generateShortSongs = generateShortSongs;
generateTwoMinuteSongs = generateTwoMinuteSongs;
