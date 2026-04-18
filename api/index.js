const axios = require("axios");

module.exports = async (req, res) => {

  // ================= CORS HEADERS =================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  // Pre-flight request handling
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ================= URL VALIDATION =================
  let { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "TikTok link dena zaroori hai" });
  }

  url = decodeURIComponent(url);

  try {
    // Check if the link is actually a TikTok link
    if (!url.includes("tiktok.com") && !url.includes("vt.tiktok")) {
      return res.status(400).json({ error: "Yeh tool sirf TikTok links ko support karta hai." });
    }

    // ================= TIKTOK API FETCH =================
    // tikwm API video, music, aur images teeno ek hi request mein de deti hai
    const { data } = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
    
    // Agar API response theek na de (invalid link ya private video)
    if (!data || !data.data) {
      throw new Error("Video nahi mili. Shayad link private hai ya galat hai.");
    }

    // ================= FINAL RESPONSE =================
    return res.json({
      platform: "TikTok",
      title: data.data?.title || "TikTok Content",
      thumbnail: data.data?.cover || "https://via.placeholder.com/300x400?text=No+Thumbnail",
      download_url: data.data?.play || "",    // No-Watermark Video MP4
      music_url: data.data?.music || "",      // Audio MP3
      images: data.data?.images || []         // Photo Slides (Array)
    });

  } catch (err) {
    // Vercel Logs ke liye
    console.error("== TIKTOK API ERROR ==", err.message);

    // Frontend par user ko dikhane ke liye
    return res.status(500).json({
      error: "Data fetch nahi ho saka",
      details: err.message
    });
  }
};
