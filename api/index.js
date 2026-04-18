const axios = require('axios');

module.exports = async (req, res) => {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Video link dena zaroori hai!' });

    // Link ko clean karna
    url = decodeURIComponent(url);

    try {
        // ==========================================
        // 1. TIKTOK (Working 100%)
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
        }

        // ==========================================
        // 2. YOUTUBE (Universal Original Links)
        // ==========================================
        else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            
            // API 1: BK9 Engine
            try {
                const r1 = await axios.get(`https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`);
                if (r1.data?.BK9?.url) return res.status(200).json({ title: r1.data.BK9.title || "YouTube HD", thumbnail: "https://via.placeholder.com/300x200?text=YouTube", download_url: r1.data.BK9.url });
            } catch(e) {}

            // API 2: Siputzx Engine
            try {
                const r2 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
                if (r2.data?.data?.dl) return res.status(200).json({ title: r2.data.data.title || "YouTube HD", thumbnail: "https://via.placeholder.com/300x200?text=YouTube", download_url: r2.data.data.dl });
            } catch(e) {}

            // API 3: Ryzendesu Engine
            try {
                const r3 = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}`);
                if (r3.data?.url) return res.status(200).json({ title: "YouTube HD", thumbnail: "https://via.placeholder.com/300x200?text=YouTube", download_url: r3.data.url });
            } catch(e) {}

            throw new Error('YouTube ki video fetch nahi ho saki. Private link ho sakta hai.');
        }

        // ==========================================
        // 3. PINTEREST (Original & Short Links)
        // ==========================================
        else if (url.includes('pinterest.com') || url.includes('pin.it')) {
            
            // API 1: BK9 Engine
            try {
                const r1 = await axios.get(`https://bk9.fun/download/pinterest?url=${encodeURIComponent(url)}`);
                if (r1.data?.BK9?.url) return res.status(200).json({ title: "Pinterest HD", thumbnail: "https://via.placeholder.com/300x400?text=Pinterest", download_url: r1.data.BK9.url });
            } catch(e) {}

            // API 2: Ryzendesu Engine
            try {
                const r2 = await axios.get(`https://api.ryzendesu.vip/api/downloader/pinterest?url=${encodeURIComponent(url)}`);
                if (r2.data?.url) return res.status(200).json({ title: "Pinterest HD", thumbnail: "https://via.placeholder.com/300x400?text=Pinterest", download_url: r2.data.url });
            } catch(e) {}

            throw new Error('Pinterest par video nahi mili. Shayad sirf image hai.');
        }

        // ==========================================
        // 4. INVALID LINK
        // ==========================================
        else {
            return res.status(400).json({ error: "Yeh platform supported nahi hai." });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
