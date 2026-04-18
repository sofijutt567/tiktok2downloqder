const axios = require('axios');

module.exports = async (req, res) => {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Video link dena zaroori hai!' });

    // Link ko clean karna taake koi hidden characters na hon
    url = decodeURIComponent(url);

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
        // 2. YOUTUBE (Fixed URL Logic + Cobalt Server Farm)
        // ==========================================
        else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            
            // 4 Alag servers try karega, Vercel block hua to agle par jayega
            const cobaltServers = [
                'https://cobalt.tux.pizza/',
                'https://api.cobalt.tools/',
                'https://cobalt.cachyos.org/',
                'https://co.wuk.sh/'
            ];

            for (let server of cobaltServers) {
                try {
                    const response = await axios.post(server, { url: url }, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                        },
                        timeout: 6000 // Har server ko 6 seconds dega
                    });

                    if (response.data && response.data.url) {
                        return res.status(200).json({
                            title: "YouTube HD Video",
                            thumbnail: "https://via.placeholder.com/300x200?text=YouTube",
                            download_url: response.data.url
                        });
                    }
                } catch (e) {
                    console.log(`YT Server Fail: ${server}`);
                    continue; // Agar fail hua to agle server par jao
                }
            }

            // Backup API
            try {
                const res2 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
                if (res2.data?.data?.dl) {
                    return res.status(200).json({
                        title: "YouTube HD Video",
                        thumbnail: "https://via.placeholder.com/300x200?text=YouTube",
                        download_url: res2.data.data.dl
                    });
                }
            } catch(e) {}

            throw new Error('Dono YouTube servers busy hain. Kuch dair baad try karein.');
        }

        // ==========================================
        // 3. PINTEREST (Cobalt Auto-Router + Backup)
        // ==========================================
        else if (url.includes('pinterest.com') || url.includes('pin.it')) {
            
            const cobaltServers = [
                'https://cobalt.tux.pizza/',
                'https://api.cobalt.tools/',
                'https://cobalt.cachyos.org/'
            ];

            for (let server of cobaltServers) {
                try {
                    const response = await axios.post(server, { url: url }, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                        },
                        timeout: 6000
                    });

                    if (response.data && response.data.url) {
                        return res.status(200).json({
                            title: "Pinterest HD Video",
                            thumbnail: "https://via.placeholder.com/300x400?text=Pinterest",
                            download_url: response.data.url
                        });
                    }
                } catch (e) {
                    continue; 
                }
            }

            // Backup API
            try {
                const res1 = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`);
                let dl_url = res1.data?.data?.url || res1.data?.data;
                if (Array.isArray(res1.data?.data)) dl_url = res1.data.data[0];
                if (typeof dl_url === 'string' && dl_url.startsWith('http')) {
                    return res.status(200).json({
                        title: "Pinterest HD Video",
                        thumbnail: "https://via.placeholder.com/300x400?text=Pinterest",
                        download_url: dl_url
                    });
                }
            } catch(e) {}

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
