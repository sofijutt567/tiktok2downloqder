const axios = require('axios');

module.exports = async (req, res) => {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Video link dena zaroori hai!' });

    try {
        // ==========================================
        // ROUTE 1: TIKTOK (TikWM se)
        // ==========================================
        if (url.includes('tiktok.com')) {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            if (response.data && response.data.data && response.data.data.play) {
                return res.status(200).json({
                    title: response.data.data.title || "TikTok HD Video",
                    thumbnail: response.data.data.cover,
                    download_url: response.data.data.play
                });
            }
        } 
        
        // ==========================================
        // ROUTE 2: YOUTUBE & PINTEREST (Auto-Switcher)
        // ==========================================
        // Vercel block hone par hum in 4 backup servers ka use karenge
        const cobaltServers = [
            'https://cobalt.qiaosi.dev/',
            'https://api.cobalt.ac/',
            'https://cobalt.tux.pizza/',
            'https://api.cobalt.tools/' // Main server aakhri option
        ];

        let finalDownloadData = null;

        // Loop chalayen: Ek fail hoga to agla try karega
        for (let server_url of cobaltServers) {
            try {
                const response = await axios.post(server_url, { url: url }, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    timeout: 7000 // Har server ko 7 second dega
                });
                
                if (response.data && response.data.url) {
                    finalDownloadData = {
                        title: "YouTube/Pinterest HD Video",
                        thumbnail: "https://via.placeholder.com/300x200?text=Video+Ready",
                        download_url: response.data.url
                    };
                    break; // Jaise hi link mil jaye, loop band kar do!
                }
            } catch (err) {
                console.log(`Server failed: ${server_url}`);
                continue; // Agar yeh block hai, to chhod kar agle par jao
            }
        }

        // Agar kisi ek server se bhi link mil gaya
        if (finalDownloadData) {
            return res.status(200).json(finalDownloadData);
        } else {
            return res.status(500).json({ error: 'Sabhi servers temporarily busy hain. Kuch dair baad try karein.' });
        }

    } catch (error) {
        return res.status(500).json({ error: 'System Error', details: error.message });
    }
};
