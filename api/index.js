const axios = require('axios');

module.exports = async (req, res) => {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Video link dena zaroori hai!' });

    try {
        // ==========================================
        // 1. TIKTOK (TikWM API - 100% Working)
        // ==========================================
        if (url.includes('tiktok.com') || url.includes('vt.tiktok')) {
            const { data } = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            if (data?.data?.play) {
                return res.status(200).json({
                    title: data.data.title || "TikTok Video Ready",
                    thumbnail: data.data.cover,
                    download_url: data.data.play
                });
            }
            throw new Error('TikTok link ghalat hai ya video private hai.');
        }

        // ==========================================
        // 2. PINTEREST (Direct Scraper - Kabhi block nahi hoga)
        // ==========================================
        if (url.includes('pinterest.com') || url.includes('pin.it')) {
            // Pinterest ka page download karega
            const { data } = await axios.get(url, { 
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
            });
            
            // HTML code mein se direct .mp4 video ka link dhoondega
            const videoMatch = data.match(/"contentUrl":"([^"]+\.mp4)"/) || data.match(/<meta property="og:video" content="([^"]+)"/);
            
            if (videoMatch && videoMatch[1]) {
                return res.status(200).json({
                    title: "Pinterest HD Video",
                    thumbnail: "https://via.placeholder.com/300x400?text=Pinterest+Video",
                    download_url: videoMatch[1].replace(/\\/g, '') // Link saaf karna
                });
            }
            throw new Error('Pinterest par video nahi mili. Shayad yeh sirf ek tasveer (image) hai.');
        }

        // ==========================================
        // 3. YOUTUBE (Dual Dedicated APIs)
        // ==========================================
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            
            // API 1: Siputzx Engine
            try {
                const res1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
                if (res1.data?.data?.dl) {
                    return res.status(200).json({
                        title: res1.data.data.title || "YouTube HD",
                        thumbnail: "https://via.placeholder.com/300x200?text=YouTube",
                        download_url: res1.data.data.dl
                    });
                }
            } catch(e) { console.log("YT API 1 busy"); }

            // API 2: BK9 Engine (Agar pehla busy ho)
            try {
                const res2 = await axios.get(`https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`);
                if (res2.data?.BK9?.url) {
                    return res.status(200).json({
                        title: res2.data.BK9.title || "YouTube HD",
                        thumbnail: "https://via.placeholder.com/300x200?text=YouTube",
                        download_url: res2.data.BK9.url
                    });
                }
            } catch(e) { console.log("YT API 2 busy"); }

            throw new Error('Dono YouTube servers busy hain. Link check karein ya kuch dair baad try karein.');
        }

        // Agar koi aur link daal diya jaye
        return res.status(400).json({ error: "Yeh platform supported nahi hai. Sirf YT, TikTok aur Pinterest chalega." });

    } catch (error) {
        console.error("SYSTEM ERROR:", error.message);
        return res.status(500).json({ error: error.message });
    }
};
