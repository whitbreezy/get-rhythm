const apiKey = 'OUR_MUSIXMATCH_API_KEY';

function search() {
    const query = $('#searchInput').val();
    if (!query) return;

    // Fetch tracks
    $.ajax({
        type: 'GET',
        data: {
            apikey: apiKey,
            q_artist: query,
            page_size: 3,
            page: 1,
            s_release_date: 'desc'
        },
        url: 'https://api.musixmatch.com/ws/1.1/artist.albums.get',
        dataType: 'jsonp',
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json'
    }).done(function(data) {
        displayAlbums(data.message.body.album_list, query);
    }).fail(function() {
        $('#result').html('Error occurred while fetching data');
    });
}

function displayAlbums(albums, artist) {
    let html = '<ul>';
    albums.forEach(album => {
        html += `<li class="album" data-album-id="${album.album.album_id}">${album.album.album_name}</li>`;
    });
    html += '</ul>';
    $('#albums').html(html);

    // Add click event listener to each album
    $('.album').click(function() {
        const albumId = $(this).data('album-id');
        fetchTracks(albumId, artist);
    });
}

function fetchTracks(albumId, artist) {
    $.ajax({
        type: 'GET',
        data: {
            apikey: apiKey,
            album_id: albumId,
        },
        url: 'https://api.musixmatch.com/ws/1.1/album.tracks.get',
        dataType: 'jsonp',
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json'
    }).done(function(data) {
        displayTracks(data.message.body.track_list, artist);
    }).fail(function() {
        $('#result').html('Error occurred while fetching tracks');
    });
}

function displayTracks(tracks, artist) {
    let html = '<ul>';
    tracks.forEach(track => {
        html += `<li class="track" data-track-id="${track.track.track_id}">${track.track.track_name}</li>`;
    });
    html += '</ul>';
    $('#result').html(html);

    // Add click event listener to each track
    $('.track').click(function() {
        const trackId = $(this).data('track-id');
        // You can fetch more track details here using the trackId and artist name
        alert(`Clicked on track ID: ${trackId}`);
    });
}