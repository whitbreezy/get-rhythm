// Function to initiate a search when the search button is clicked
async function search() {
    const query = $('#searchInput').val();  // Get the user's query from the input field

    if (!query) return;  // If the query is empty, return immediately

    const url = `http://localhost:3000/search?q=${query}`;  // Construct the URL to the server's search endpoint

    // Make a request to the server and handle the response
    try {
        const response = await axios.get(url);  // Make a GET request to the server
        console.log('Albums search response:',response.data) // Log the entire data from the search API

        // If albums data is received, display it, otherwise show a message that no albums were found
        if (response.data.albums.items.length > 0) {
            displayAlbums(response.data.albums.items, query); 
        } else {
            $('#result').html('No albums found');
        }
    } catch (error) {
        console.error(error);  // Log any error that occurs
        $('#result').html('Error occurred while fetching data');
    }
}

// Function to display the list of albums on the webpage
function displayAlbums(albums, artist) {
    let html = '<ul>';

    // Iterate through each album and create an HTML element for it
    albums.forEach(album => {
        // Include the album image (assuming images[0].url contains the URL of the image)
        const imageUrl = album.images && album.images[0] ? album.images[0].url : ''; // Ensure there's an image URL before trying to access it
        html += `<li class="album" data-album-id="${album.id}">`;
        html += `<img src="${imageUrl}" alt="${album.name}" class="album-image">`; // Add an img element for the album image
        html += `${album.name}</li>`;
    });
    html += '</ul>';
    
    $('#albums').html(html);  // Insert the albums list into the #albums div

    // Add a click event listener to each album to fetch its tracks when clicked
    $('.album').click(function() {
        const albumId = $(this).data('album-id');  // Get the album ID from the clicked element
        fetchTracks(albumId, artist);  // Fetch the tracks of the clicked album
    });
}

// Function to fetch the tracks of a specific album
async function fetchTracks(albumId, artist) {
    const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;  // Construct the URL to fetch tracks

    // Make a request to fetch the tracks and handle the response
    try {
        const response = await axios.get(url);
        console.log('Tracks fetch response:', response.data); // Log the entire data from the tracks API

        if (response.data.items.length > 0) {  
            displayTracks(response.data.items, artist);  // Display the tracks if any are received
        } else {
            $('#result').html('No tracks found');
        }
    } catch (error) {
        console.error(error);  // Log any error that occurs
        $('#result').html('Error occurred while fetching tracks');
    }
}

// Function to display the tracks of an album on the webpage
function displayTracks(tracks, artist) {
    let html = '<ul>';

    // Iterate through each track and create an HTML element for it
    tracks.forEach(track => {
        html += `<li class="track" data-track-id="${track.id}">${track.name}</li>`;
    });
    html += '</ul>';
    
    $('#result').html(html);  // Insert the tracks list into the #result div

    // Add a click event listener to each track to do something when a track is clicked
    $('.track').click(function() {
        const trackId = $(this).data('track-id');  // Get the track ID from the clicked element
        alert(`Clicked on track ID: ${trackId}`);  // Alert the track ID
    });
}
