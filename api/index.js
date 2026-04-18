const axios = require('axios');

module.exports = async (req, res) => {
    // 1. CORS Headers (Taake Frontend block na kare)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Data nikalna
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Video link missing' });
    }

    try {
        // 3. Cobalt API Call
        const response = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            isNoTTWatermark: true,
            vQuality: "720"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        // 4. Success Response
        return res.status(200).json(response.data);

    } catch (error) {
        // Error handling
        const errorMessage = error.response ? error.response.data : error.message;
        console.error("COBALT ERROR:", errorMessage);
        return res.status(500).json({ error: 'Cobalt API Error', details: errorMessage });
    }
};

