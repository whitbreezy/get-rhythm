// This is the API key used to authenticate requests. It's exposed here for development purposes.
// In production, this should be moved to a secure and confidential location to prevent unauthorized access.
const apiKey = '281e00c1f28c2b07c3c2d19fe6a6e49d';

// This function is responsible for initiating a search when called.
// It grabs the user's query, constructs a URL with it, and makes a request to the server.
function search() {
    // Retrieves the user's query from an input element with ID 'searchInput'.
    const query = $('#searchInput').val();
    
    console.log('Search query:', query);  // Logs the user's query to the console.

    // If the user hasn't entered a query, the function exits early to prevent an empty search.
    if (!query) return;

    // Constructs a URL for the search endpoint, injecting the API key and user's query into the URL.
    const url = `http://localhost:3000/search?apikey=${apiKey}&q_artist=${query}&page_size=3&page=1&s_release_date=desc`;

    // Makes a request to the search endpoint and handles the response or any occurring errors.
    fetch(url)
        .then(response => {
            // If the response is not ok (e.g., the server responded with an error), an error is thrown.
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            // If the response is ok, it is parsed as JSON.
            return response.json();
        })
        // Calls 'displayAlbums' function to display the search results, if the request was successful.
        .then(data => {
            console.log(data);
            return displayAlbums(data.message.body.track_list, query);
        })
        // Catches any errors that occurred during the fetch operation and displays an error message to the user.
        .catch(error => {
            console.error(error);
            $('#result').html('Error occurred while fetching data');
        });
}

// This function displays a list of albums that matches the user's search query.
function displayAlbums(tracks, artist) {
    console.log(artist);  // Logs the artist's name to the console.
    console.log(tracks);  // Logs the tracks to the console.
    
    // Creates an HTML string to display a list of albums.
    let html = '<ul>';
    tracks.forEach(track => {
        // Adds each album to the HTML string with a click event listener.
        html += `<li class="album" data-album-id="${track.track.album_id}">${track.track.album_name}</li>`;
    });
    html += '</ul>';
    
    // Injects the HTML string into an element with ID 'albums' to display the list of albums to the user.
    $('#albums').html(html);

    // Adds a click event listener to each album to call the 'fetchTracks' function when an album is clicked.
    $('.album').click(function() {
        const albumId = $(this).data('album-id');  // Retrieves the album ID from the clicked element's data attribute.
        fetchTracks(albumId, artist);  // Calls 'fetchTracks' with the album ID and artist's name.
    });
}

// This function fetches the tracks of a specific album when called.
function fetchTracks(albumId, artist) {
    // Constructs a URL for the album tracks endpoint, injecting the API key and album ID into the URL.
    const url = `http://localhost:3000/album_tracks?apikey=${apiKey}&album_id=${albumId}`;

    // Makes a request to the album tracks endpoint and handles the response or any occurring errors.
    fetch(url)
        .then(response => {
            // If the response is not ok, an error is thrown.
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            // If the response is ok, it is parsed as JSON.
            return response.json();
        })
        // Calls 'displayTracks' function to display the album's tracks, if the request was successful.
        .then(data => displayTracks(data.message.body.track_list, artist))
        // Catches any errors that occurred during the fetch operation and displays an error message to the user.
        .catch(error => {
            console.error(error);
            $('#result').html('Error occurred while fetching tracks');
        });
}

// This function displays a list of tracks from a specific album.
function displayTracks(tracks, artist) {
    // Creates an HTML string to display a list of tracks.
    let html = '<ul>';
    tracks.forEach(track => {
        // Adds each track to the HTML string with a click event listener.
        html += `<li class="track" data-track-id="${track.track.track_id}">${track.track.track_name}</li>`;
    });
    html += '</ul>';
    
    // Injects the HTML string into an element with ID 'result' to display the list of tracks to the user.
    $('#result').html(html);

    // Adds a click event listener to each track to show an alert with the track ID when a track is clicked.
    $('.track').click(function() {
        const trackId = $(this).data('track-id');  // Retrieves the track ID from the clicked element's data attribute.
        alert(`Clicked on track ID: ${trackId}`);  // Shows an alert with the track ID.
    });
}
