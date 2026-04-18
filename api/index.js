const axios = require('axios');

module.exports = async (req, res) => {
    // 1. CORS Headers (Security & Connection)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Link Get Karein
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Video link dena zaroori hai!' });
    }

    try {
        // ==========================================
        // ROUTE 1: TIKTOK (TikWM API use karega)
        // ==========================================
        if (url.includes('tiktok.com')) {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            if (response.data && response.data.data && response.data.data.play) {
                return res.status(200).json({
                    title: response.data.data.title || "TikTok HD Video",
                    thumbnail: response.data.data.cover,
                    download_url: response.data.data.play
                });
            } else {
                throw new Error('TikTok video private hai ya link ghalat hai.');
            }
        } 
        
        // ==========================================
        // ROUTE 2: YOUTUBE & PINTEREST (Cobalt v8 API)
        // ==========================================
        else {
            // Cobalt v8 ab POST request aur strict headers maangta hai
            const response = await axios.post('https://api.cobalt.tools/', {
                url: url
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Origin': 'https://cobalt.tools',
                    'Referer': 'https://cobalt.tools/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (response.data && response.data.url) {
                return res.status(200).json({
                    title: "HD Video Ready",
                    thumbnail: "https://via.placeholder.com/300x200?text=Video+Ready", // Cobalt kabhi thumb nahi deta
                    download_url: response.data.url
                });
            } else {
                throw new Error('Video server se fetch nahi ho saki.');
            }
        }

    } catch (error) {
        // Error details pakarne ke liye
        const errorMessage = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
        console.error("API ERROR:", errorMessage);
        return res.status(500).json({ error: 'Download failed', details: errorMessage });
    }
};
