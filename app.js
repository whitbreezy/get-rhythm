const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/search', async (req, res) => {
    try {
        const params = {
            ...req.query,
            apikey: '281e00c1f28c2b07c3c2d19fe6a6e49d' // Use your Musixmatch API key
        };

        // Forward the request to the Musixmatch API
        const response = await axios.get('https://api.musixmatch.com/ws/1.1/track.search', { params });
        
        // Send the response back to the client
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while fetching data');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
