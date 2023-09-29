const APIController = (function() {
    const clientId = '84f3e2e5cb504211979da2a5b87205e2';
    const clientSecret = '415fca1e1b9c41bf9513a3d905619ee1';

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

    return {
        getToken() {
            return _getToken();
        },
        searchAlbums(token, query) {
            return _searchAlbums(token, query);
        },
        fetchTracks(token, albumId) {
            return _fetchTracks(token, albumId);
        }
    }
})();

const UIController = (function() {
    let displayedAlbumsCount = 0;
    return {
        displayAlbums(albums, showMore = false) {
            let html = showMore ? '' : '<ul>';
            const sliceFrom = showMore ? displayedAlbumsCount : 0;
            const sliceTo = showMore ? sliceFrom + 10 : sliceFrom + 5; //Checks if showMore is true or false
            
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
        },

        displayTracks(tracks) {
            let html = '<ul>';
            tracks.forEach(track => {
                html += `<li class="track" data-track-id="${track.id}" data-spotify-url="${track.external_urls.spotify}">${track.name}</li>`;
            });
            html += '</ul>';
            $('#result').html(html);
        }
    }
})();

const APPController = (function(UICtrl, APICtrl) {
    const DOMInputs = {
        searchButton: $('#searchButton'),
        showMoreButton: $('#showMoreButton'),
        searchInput: $('#searchInput'),
        albumsDiv: $('#albums'),
        result: $('#result')
    }

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

    const attachAlbumClickEvents = (token) => {
        $('.album').click(async function() {
            const albumId = $(this).data('album-id');
            try {
                const tracks = await APICtrl.fetchTracks(token, albumId);
                UICtrl.displayTracks(tracks);
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

    return {
        init() {
            console.log('App is starting');
        }
    }
})(UIController, APIController);

APPController.init();
