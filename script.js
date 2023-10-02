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
                const spotifyUrl = track.external_urls ? track.external_urls.spotify : '#';
                html += `<li class="track" data-track-id="${track.id}" data-spotify-url="${spotifyUrl}">${track.name}</li>`;
            });
            html += '</ul>';
            $('#result').html(html);
        },


        displayHotTracks(tracks) {
            console.log(tracks);
            let html = '<ul>';
            tracks.slice(0, 5).forEach(track => {
                const spotifyUrl = track.track.external_urls ? track.track.external_urls.spotify : '#';
                const imageUrl = track.track.album.images[2] ? track.track.album.images[2].url : '';
                html += `<li class="hot-track" data-track-id="${track.track.id}" data-spotify-url="${spotifyUrl}">`;
                html += `<img src="${imageUrl}" alt="${track.track.name}" class="album-image">`;
                html += `${track.track.name}</li>`;
            });
            html += '</ul>';
            $('#app').html(html);
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
            this.loadHotTracks();
        },
        
            async loadHotTracks() {
                try {
                    const token = await APICtrl.getToken();
                    const hotTracks = await APICtrl.getHotTracks(token);
                    if (hotTracks && hotTracks.length > 0) {
                        UICtrl.displayHotTracks(hotTracks);
                        this.attachHotTracksDoubleClickEvents();
                    } else {
                        console.error('No hot tracks found');
                    }
                } catch (error) {
                    console.error('Error occurred while fetching hot tracks', error);
                }
            },
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

APPController.init();
