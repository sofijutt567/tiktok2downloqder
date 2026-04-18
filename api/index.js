const axios = require('axios');

module.exports = async (req, res) => {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
        // 3. TikWM API Call
        const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);

        // 4. Response check karna
        if (response.data && response.data.data && response.data.data.play) {
            return res.status(200).json({
                title: response.data.data.title || "TikTok Video",
                download_url: response.data.data.play,
                thumbnail: response.data.data.cover
            });
        } else {
            throw new Error('Video mil nahi saki, link check karein.');
        }

    } catch (error) {
        console.error("API ERROR:", error.message);
        return res.status(500).json({ error: 'API Error', details: error.message });
    }
};
