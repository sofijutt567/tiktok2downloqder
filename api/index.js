const axios = require("axios");

module.exports = async (req, res) => {

  // ================= CORS HEADERS =================
  // Yeh frontend ko is API se baat karne ki ijazat deta hai
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ================= GET URL =================
  let { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "TikTok video link dena zaroori hai" });
  }

  url = decodeURIComponent(url);

  try {
    // ================= VALIDATION =================
    if (!url.includes("tiktok.com") && !url.includes("vt.tiktok")) {
      return res.status(400).json({ error: "Yeh API sirf TikTok links ko support karti hai." });
    }

    // ================= FETCH DATA =================
    const { data } = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
    
    if (!data || !data.data) {
      throw new Error("Video fetch nahi ho saki. Link private ya invalid ho sakta hai.");
    }

    // ================= FINAL RESPONSE =================
    // API yahan se saray formats frontend ko bhej de gi
    return res.json({
      platform: "TikTok",
      title: data.data?.title || "TikTok Content",
      thumbnail: data.data?.cover || "https://via.placeholder.com/300x400?text=No+Thumbnail",
      
      // Video Formats
      hd_download_url: data.data?.hdplay || "", // Full HD (No Watermark)
      download_url: data.data?.play || "",      // Normal/SD (No Watermark)
      wm_download_url: data.data?.wmplay || "", // Watermarked Version
      
      // Audio & Images
      music_url: data.data?.music || "",        // Audio MP3
      images: data.data?.images || []           // Photo Slides Array
    });

  } catch (err) {
    // Error Logging (Vercel ke dashboard mein dekhne ke liye)
    console.error("== TIKTOK API ERROR ==", err.message);

    return res.status(500).json({
      error: "Server Error: Data fetch nahi ho saka",
      details: err.message
    });
  }
};
