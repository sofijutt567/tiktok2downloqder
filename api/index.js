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
        // 1. TIKTOK (TikWM API)
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
        // 2. YOUTUBE (Dual APIs)
        // ==========================================
        else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            
            // API 1: Siputzx
            try {
                const res1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
                if (res1.data?.data?.dl) {
                    return res.status(200).json({
                        title: res1.data.data.title || "YouTube HD Video",
                        thumbnail: "https://via.placeholder.com/300x200?text=YouTube",
                        download_url: res1.data.data.dl
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
        // 3. PINTEREST (Dual APIs)
        // ==========================================
        else if (url.includes('pinterest.com') || url.includes('pin.it')) {
            
            // API 1: Ryzendesu
            try {
                const res1 = await axios.get(`https://api.ryzendesu.vip/api/downloader/pinterest?url=${encodeURIComponent(url)}`);
                if (res1.data && res1.data.url) {
                    return res.status(200).json({
                        title: "Pinterest HD Video",
                        thumbnail: "https://via.placeholder.com/300x400?text=Pinterest",
                        download_url: res1.data.url
                    });
                }
            } catch(e) { console.log("Pin API 1 failed"); }

            // API 2: Siputzx
            try {
                const res2 = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`);
                let dl_url = res2.data?.data?.url || res2.data?.data;
                if (Array.isArray(res2.data?.data)) dl_url = res2.data.data[0];
                
                if (typeof dl_url === 'string' && dl_url.startsWith('http')) {
                    return res.status(200).json({
                        title: "Pinterest HD Video",
                        thumbnail: "https://via.placeholder.com/300x400?text=Pinterest",
                        download_url: dl_url
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
        console.error("SYSTEM ERROR:", error.message);
        return res.status(500).json({ error: error.message });
    }
};
