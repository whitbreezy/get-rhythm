// APIController IIFE that returns methods for interacting with the Spotify API
const APIController = (function() {
    // Private constants for Spotify client ID and secret
    const clientId = '84f3e2e5cb504211979da2a5b87205e2';
    const clientSecret = '415fca1e1b9c41bf9513a3d905619ee1';

    // Private method to get an access token from Spotify
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    // Private method to search for albums using a query string and access token
    const _searchAlbums = async (token, query) => {
        const url = `https://api.spotify.com/v1/search?q=${query}&type=album`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await response.json();
        console.log('Albums Data:', data);
        return data.albums.items;
    }

     // Private method to fetch tracks from a specific album using the album ID and access token
     const _fetchTracks = async (token, albumId) => {
        const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + token}
        });

        const data = await response.json();
        console.log('Tracks Data:', data);
        return data.items;
    }

    // Private method to get hot tracks from a specific playlistId using the access token
    const _hotTracks = async (token) => {
        playlistId = '6UeSakyzhiEt4NB3UAd6NQ'
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        const response = await fetch(url, {
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + token}
    });

    const data = await response.json();
        console.log('Hot Tracks Data:', data);
        return data.items;
}

const _getYouTubeVideo = async (query) => {
    const apiKey = 'AIzaSyCDmS026FXybFaXx3IxiZdJQRJaYVYie6I';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items[0];  // Assuming you want the first video found
};

    // Public methods that expose the private methods above. This way you can use API client side
    return {
        getToken() {
            return _getToken();
        },
        searchAlbums(token, query) {
            return _searchAlbums(token, query);
        },
        fetchTracks(token, albumId) {
            return _fetchTracks(token, albumId);
        },
        getHotTracks(token){
            return _hotTracks(token);
        },
        getYouTubeVideo(query) {
            return _getYouTubeVideo(query);
        }
    };
})();

// UIController IIFE that returns methods for updating the UI
const UIController = (function() {
    // Private variable to track the number of albums currently displayed
    let displayedAlbumsCount = 0;
    // Public method to display albums in the UI
    return {
        displayAlbums(albums, showMore = false) {
            let html = showMore ? '' : '<ul class = "album-container">';
            const sliceFrom = showMore ? displayedAlbumsCount : 0;
            const sliceTo = showMore ? sliceFrom + 10 : sliceFrom + 5; //Checks if showMore is true or false
            html += `<h4>Albums</h4>`
            albums.slice(sliceFrom, sliceTo).forEach(album => {
                const imageIndex = 2; //This selects which image to pull from data (0 is biggest 2 is smallest)
                const imageUrl = album.images[imageIndex] ? album.images[imageIndex].url : ''; 
                html += `<li class="album" data-album-id="${album.id}" data-spotify-url="${album.external_urls.spotify}">`;
                html += `<img src="${imageUrl}" alt="${album.name}" class="album-image">`;
                html += `${album.name}</li>`;
            });

            html += showMore ? '' : '</ul>';
            
            if (showMore) {
                $('#albums ul').append(html);
                displayedAlbumsCount += albums.slice(sliceFrom, sliceTo).length;
            } else {
                $('#albums').html(html);
                displayedAlbumsCount = albums.slice(sliceFrom, sliceTo).length;
            }

            $('#showMoreButton').show();
        },

        // Public method to display tracks in the UI
        displayTracks(tracks) {
            let html = '<ul>';
            tracks.forEach(track => {
                const spotifyUrl = track.external_urls ? track.external_urls.spotify : '#';
                html += `<li class="track" data-track-id="${track.id}" data-spotify-url="${spotifyUrl}">${track.name}</li>`;
            });
            html += '</ul>';
            $('#result').html(html);
        },


        // Public method to display hot tracks in the UI
        displayHotTracks(tracks) {
            console.log(tracks);
            let html = '<ul class="track-container">';
            tracks.slice(0, 5).forEach(track => {
                const spotifyUrl = track.track.external_urls ? track.track.external_urls.spotify : '#';
                const imageUrl = track.track.album.images[2] ? track.track.album.images[2].url : '';
                html += `<li class="hot-track" data-track-id="${track.track.id}" data-spotify-url="${spotifyUrl}">`;
                html += `<img src="${imageUrl}" alt="${track.track.name}" class="album-image">`;
                html += `${track.track.name}</li>`;
            });
            html += '</ul>';
            $('#hotTracks').html(html);
        }
        
        
}
})();


// APPController IIFE that returns methods for app initialization and user interactions
const APPController = (function(UICtrl, APICtrl) {
    // DOM elements for user interaction
    const DOMInputs = {
        searchButton: $('#searchButton'),
        searchInput: $('#searchInput'),
        showMoreButton: $('#showMoreButton'),
        searchInput: $('#searchInput'),
        albumsDiv: $('#albums'),
        result: $('#result')
    }

    // Private method to update the list of recent searches
    const updateRecentSearches = (query) => {
        let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    
        // Remove the current query from the array if it already exists
        searches = searches.filter(search => search.toLowerCase() !== query.toLowerCase());
    
        // Add the current query to the beginning of the array
        searches.unshift(query);
    
        // Keep only the 3 most recent searches
        searches = searches.slice(0, 5);
    
        // Update the recent searches in local storage
        localStorage.setItem('recentSearches', JSON.stringify(searches));
    };
    

    // Private method to display recent searches in the UI
    const displayRecentSearches = () => {
        const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        let html = '<ul>';
        searches.forEach(search => {
            html += `<li class="recent-search-item">${search}</li>`;
        });
        html += '</ul>';
        $('#recent-searches').html(html).show();
    };

    const attachHotTracksClickEvents = () => {
        $('.hot-track').click(async function() {
            const trackElement = $(this); 
            const trackName = trackElement.text();
    
            if (trackElement.find('.youtube-link').length > 0) {
                console.log('YouTube link already appended.');
                return;
            }
    
            const video = await APICtrl.getYouTubeVideo(trackName);
    
            if (video) {
                const videoId = video.id.videoId;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                console.log('YouTube Video URL:', videoUrl); 
                
                const videoLinkHtml = `<a href="${videoUrl}" target="_blank" class="youtube-link">Watch on YouTube</a>`;
                trackElement.append(videoLinkHtml);
            } else {
                console.log('No YouTube video found for this track.');
            }
        });
    };

    const attachTrackClickEvents = () => {
        $('.track').click(async function() {
            // This is where you can modify what happens on a single click
            const trackElement = $(this); 
            const trackName = trackElement.text();

            if (trackElement.find('.youtube-link').length > 0) {
                console.log('YouTube link already appended.')
                return;
            }

            const video = await APICtrl.getYouTubeVideo(trackName);

            if (video) {
                const videoId = video.id.videoId;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                console.log('YouTube Video URL:', videoUrl); 
                
                const videoLinkHtml = `<a href="${videoUrl}" target="_blank" class="youtube-link">Watch on YouTube</a>`;
            trackElement.append(videoLinkHtml);
        } else {
            console.log('No YouTube video found for this track.');
        }
    });
    };
    
    // Event listener for when a recent search item is clicked
    $('body').on('click', '.recent-search-item', async function() {
        // Re-executes the search when a recent search item is clicked
        const query = $(this).text();
        DOMInputs.searchInput.val(query);
        DOMInputs.searchButton.click();
    });

     // Event listeners for search and show more buttons, search input focus, etc.
    DOMInputs.showMoreButton.click(async function() {
        const query = DOMInputs.searchInput.val();
        if (!query) return;

        try {
            const token = await APICtrl.getToken();
            const albums = await APICtrl.searchAlbums(token, query);
            if (albums.length > 0) {
                UICtrl.displayAlbums(albums, true); // Added 'true' to signify it's a "Show More" request
            } else {
                DOMInputs.result.html('No more albums found');
            }
        } catch (error) {
            console.error(error);
            DOMInputs.result.html('Error occurred while fetching more albums');
        }
    });

    DOMInputs.searchButton.click(async function() {
        const query = DOMInputs.searchInput.val();
        if (!query) return;

        updateRecentSearches(query);
        displayRecentSearches();

        try {
            const token = await APICtrl.getToken();
            const albums = await APICtrl.searchAlbums(token, query);
            if (albums.length > 0) {
                UICtrl.displayAlbums(albums);
                attachAlbumClickEvents(token);
            } else {
                DOMInputs.result.html('No albums found');
            }
        } catch (error) {
            console.error(error);
            DOMInputs.result.html('Error occurred while fetching data');
        }
    });

    DOMInputs.searchInput.focus(function() {
        displayRecentSearches();
    });

    const attachAlbumClickEvents = (token) => {
        $('.album').click(async function() {
            const albumId = $(this).data('album-id');
            try {
                const tracks = await APICtrl.fetchTracks(token, albumId);
                UICtrl.displayTracks(tracks);
                attachTrackClickEvents();
                attachTrackDoubleClickEvents();
                attachTrackDoubleClickEvents();
            } catch (error) {
                console.error(error);
                DOMInputs.result.html('Error occurred while fetching tracks');
            }
        }).dblclick(function() {
            window.location.href = $(this).data('spotify-url');
        });
    };

    const attachTrackDoubleClickEvents = () => {
        $('.track').dblclick(function() {
            window.location.href = $(this).data('spotify-url');
        });
    };

    // Public methods for app initialization
    return {
        init() {
            console.log('App is starting');
            this.loadHotTracks();
            displayRecentSearches();
            $('#showMoreButton').hide();
        },
        
        // Public method to load hot tracks at app start
        async loadHotTracks() {
                try {
                    const token = await APICtrl.getToken();
                    const hotTracks = await APICtrl.getHotTracks(token);
                    if (hotTracks && hotTracks.length > 0) {
                        UICtrl.displayHotTracks(hotTracks);
                        this.attachHotTracksDoubleClickEvents();
                        attachHotTracksClickEvents();
                    } else {
                        console.error('No hot tracks found');
                    }
                } catch (error) {
                    console.error('Error occurred while fetching hot tracks', error);
                }
            },

        // Public method to attach event listeners to hot tracks for navigation to Spotify
        attachHotTracksDoubleClickEvents() {
                $('.hot-track').dblclick(function() {
                    const spotifyUrl = $(this).data('spotify-url');
                    if (spotifyUrl !== '#') {
                        window.location.href = spotifyUrl;
                    }
                }); 
            }
        }
})(UIController, APIController);
// Initialize the app when the script loads
APPController.init();
