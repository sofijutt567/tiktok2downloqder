const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Video link dena zaroori hai!' });

    try {
        // ==========================================
        // 1. TIKTOK (100% Working)
        // ==========================================
        if (url.includes('tiktok.com') || url.includes('vt.tiktok')) {
            const { data } = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            if (data?.data?.play) {
                return res.status(200).json({
                    title: data.data.title || "TikTok HD Video",
                    thumbnail: data.data.cover,
                    download_url: data.data.play
                });
            }
            throw new Error('TikTok link ghalat hai ya video private hai.');
        }

        // ==========================================
        // 2. YOUTUBE (Ghalti Theek Kar Di - Ab Asal YT Links Chalenge)
        // ==========================================
        else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            
            // API 1: Ryzendesu Engine (Best for Vercel)
            try {
                const res1 = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}`);
                if (res1.data?.url) {
                    return res.status(200).json({
                        title: "YouTube HD Video",
                        thumbnail: "https://via.placeholder.com/300x200?text=YouTube",
                        download_url: res1.data.url
                    });
                }
            } catch(e) { console.log("YT API 1 failed"); }

            // API 2: BK9 Engine
            try {
                const res2 = await axios.get(`https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`);
                if (res2.data?.BK9?.url) {
                    return res.status(200).json({
                        title: res2.data.BK9.title || "YouTube HD Video",
                        thumbnail: "https://via.placeholder.com/300x200?text=YouTube",
                        download_url: res2.data.BK9.url
                    });
                }
            } catch(e) { console.log("YT API 2 failed"); }

            throw new Error('Dono YouTube servers busy hain. Kuch dair baad try karein.');
        }

        // ==========================================
        // 3. PINTEREST (Ab pin.it aur pinterest.com dono chalenge)
        // ==========================================
        else if (url.includes('pinterest.com') || url.includes('pin.it')) {
            
            // API 1: Ryzendesu Engine
            try {
                const res1 = await axios.get(`https://api.ryzendesu.vip/api/downloader/pinterest?url=${encodeURIComponent(url)}`);
                if (res1.data?.url) {
                    return res.status(200).json({
                        title: "Pinterest HD Video",
                        thumbnail: "https://via.placeholder.com/300x400?text=Pinterest",
                        download_url: res1.data.url
                    });
                }
            } catch(e) { console.log("Pin API 1 failed"); }

            // API 2: BK9 Engine
            try {
                const res2 = await axios.get(`https://bk9.fun/download/pinterest?url=${encodeURIComponent(url)}`);
                if (res2.data?.BK9?.url) {
                    return res.status(200).json({
                        title: "Pinterest HD Video",
                        thumbnail: "https://via.placeholder.com/300x400?text=Pinterest",
                        download_url: res2.data.BK9.url
                    });
                }
            } catch(e) { console.log("Pin API 2 failed"); }

            throw new Error('Pinterest API se video fetch nahi ho saki. Shayad link image ka hai.');
        }

        // ==========================================
        // 4. INVALID LINK
        // ==========================================
        else {
            return res.status(400).json({ error: "Platform supported nahi hai. Sirf YT, TikTok aur Pinterest chalega." });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
