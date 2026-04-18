const axios = require('axios');

export default async function handler(req, res) {
    // 1. Handle CORS Preflight Requests (Frontend se connect hone ke liye zaroori hai)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Frontend se platform aur url get karein
    const { platform, url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Video ka link dena zaroori hai!' });
    }

    try {
        // 3. Cobalt API Call (High performance, supports YT, TT, Pinterest)
        const response = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            isNoTTWatermark: true, // IMPORTANT: TikTok watermark remove karne ke liye
            vQuality: "720",       // High quality video output
            isAudioOnly: false
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Cobalt requires an arbitrary User-Agent sometimes to prevent bot blocks
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
            }
        });

        // 4. Check if API successfully returned the video link
        if (response.data && response.data.url) {
            return res.status(200).json({
                title: platform ? `${platform.toUpperCase()} Video` : 'Download Ready',
                thumbnail: "https://via.placeholder.com/300x200?text=Video+Ready", // Cobalt kabhi kabhi thumbnail nahi deta, to fallback laga diya hai
                download_url: response.data.url
            });
        } else {
            throw new Error('Platform supported nahi hai ya video private hai.');
        }

    } catch (error) {
        console.error("Backend Error:", error.message);
        
        // Agar Cobalt fail ho jaye, to proper error message bhejein
        return res.status(500).json({ 
            error: 'Server se connect nahi ho saka. Video private ho sakti hai ya link ghalat hai.' 
        });
    }
}
