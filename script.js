const apiKey = '281e00c1f28c2b07c3c2d19fe6a6e49d';

function search() {
    const query = $('#searchInput').val();
    console.log()
    if (!query) return;

    const url = `http://localhost:3000/search?apikey=${apiKey}&q_artist=${query}&page_size=3&page=1&s_release_date=desc`;

    fetch(url)
        .then(response => response.json())
    
        .then(data => {
            console.log(data)
            return displayAlbums(data.message.body.album_list, query)
        })
       
        .catch(() => $('#result').html('Error occurred while fetching data'));
}

function displayAlbums(albums, artist) {
    console.log(artist)
    console.log(albums)
    let html = '<ul>';
    albums.forEach(album => {
        html += `<li class="album" data-album-id="${album.album.album_id}">${album.album.album_name}</li>`;
    });
    html += '</ul>';
    $('#albums').html(html);

    $('.album').click(function() {
        const albumId = $(this).data('album-id');
        fetchTracks(albumId, artist);
    });
}

function fetchTracks(albumId, artist) {
    const url = `http://localhost:3000/album_tracks?apikey=${apiKey}&album_id=${albumId}`;

    fetch(url)
        .then(response => response.json())
        .then(data => displayTracks(data.message.body.track_list, artist))
        .catch(() => $('#result').html('Error occurred while fetching tracks'));
}

function displayTracks(tracks, artist) {
    let html = '<ul>';
    tracks.forEach(track => {
        html += `<li class="track" data-track-id="${track.track.track_id}">${track.track.track_name}</li>`;
    });
    html += '</ul>';
    $('#result').html(html);

    $('.track').click(function() {
        const trackId = $(this).data('track-id');
        alert(`Clicked on track ID: ${trackId}`);
    });
}
