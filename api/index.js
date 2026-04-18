const axios = require('axios');
const ytdl = require('ytdl-core'); // Ytdl-core library add kar di

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Video link dena zaroori hai!' });

    url = decodeURIComponent(url);

    try {
        // ==========================================
        // 1. TIKTOK (TikWM API)
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
        // 2. YOUTUBE (YTDL-CORE DIRECT ENGINE)
        // ==========================================
        else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            
            // Link check karega ke valid YT link hai ya nahi
            if (!ytdl.validateURL(url)) {
                throw new Error('Yeh YouTube ka valid link nahi hai.');
            }

            try {
                // Video ki information aur formats nikalega
                const info = await ytdl.getInfo(url);
                
                // Best quality video with audio filter karega
                let format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
                
                // Agar audio+video mix na mile, to sirf video highest quality uthayega
                if (!format) {
                    format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
                }

                return res.status(200).json({
                    title: info.videoDetails.title || "YouTube HD Video",
                    thumbnail: info.videoDetails.thumbnails[0]?.url || "https://via.placeholder.com/300x200?text=YouTube",
                    download_url: format.url
                });

            } catch (err) {
                console.error("YTDL Error:", err);
                throw new Error('Ytdl-core Error: ' + err.message);
            }
        }

        // ==========================================
        // 3. PINTEREST
        // ==========================================
        else if (url.includes('pinterest.com') || url.includes('pin.it')) {
            try {
                const r1 = await axios.get(`https://api.ryzendesu.vip/api/downloader/pinterest?url=${encodeURIComponent(url)}`);
                if (r1.data?.url) return res.status(200).json({ title: "Pinterest HD Video", thumbnail: "https://via.placeholder.com/300x400?text=Pinterest", download_url: r1.data.url });
            } catch(e) {}

            try {
                const r2 = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`);
                let dl = r2.data?.data?.url || r2.data?.data;
                if (Array.isArray(r2.data?.data)) dl = r2.data.data[0];
                if (typeof dl === 'string' && dl.startsWith('http')) return res.status(200).json({ title: "Pinterest HD Video", thumbnail: "https://via.placeholder.com/300x400?text=Pinterest", download_url: dl });
            } catch(e) {}

            throw new Error('Pinterest APIs abhi busy hain ya link sirf image ka hai.');
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
