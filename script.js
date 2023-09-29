const APIController = (function() {

    const clientId = '84f3e2e5cb504211979da2a5b87205e2';
    const clientSecret = '415fca1e1b9c41bf9513a3d905619ee1';

    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
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
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await response.json();
        return data.albums.items;
    }

    const _fetchTracks = async (token, albumId) => {
        const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token }
        });
        
        const data = await response.json();
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
    return {
        displayAlbums(albums) {
            let html = '<ul>';
            albums.forEach(album => {
                const imageUrl = album.images[0] ? album.images[0].url : ''; 
                html += `<li class="album" data-album-id="${album.id}">`;
                html += `<img src="${imageUrl}" alt="${album.name}" class="album-image">`;
                html += `${album.name}</li>`;
            });
            html += '</ul>';
            $('#albums').html(html); // Adjust the #albums to your actual ID
        },

        displayTracks(tracks) {
            let html = '<ul>';
            tracks.forEach(track => {
                html += `<li class="track" data-track-id="${track.id}">${track.name}</li>`;
            });
            html += '</ul>';
            $('#result').html(html); // Adjust the #result to your actual ID where you want to display tracks
        }
    }
})();

const APPController = (function(UICtrl, APICtrl) {

    const DOMInputs = {
        searchButton: $('#searchButton'),
        searchInput: $('#searchInput'),
        albumsDiv: $('#albums'),
        result: $('#result')
    }

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
            } catch (error) {
                console.error(error);
                DOMInputs.result.html('Error occurred while fetching tracks');
            }
        });
    };

    return {
        init() {
            console.log('App is starting');
        }
    }
})(UIController, APIController);

APPController.init();
