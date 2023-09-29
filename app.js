const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const getAccessToken = async () => {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from('84f3e2e5cb504211979da2a5b87205e2:415fca1e1b9c41bf9513a3d905619ee1').toString('base64')
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error in getting access token:', error.response ? error.response.data : error.message);
        throw error;
    }
};

app.get('/search', async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const { q } = req.query;
        const url = `https://api.spotify.com/v1/search?type=album&q=${q}`;

        const albumsResponse = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json(albumsResponse.data);
    } catch (error) {
        console.error('Error in /search:', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
