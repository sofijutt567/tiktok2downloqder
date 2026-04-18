const axios = require("axios"); 
const ytdl = require("ytdl-core");

module.exports = async (req, res) => {

  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Video link dena zaroori hai" });
  }

  url = decodeURIComponent(url);

  try {

    // ================= YOUTUBE =================
    // FIX: Sahi YouTube aur Shorts links ki pehchan
    if (url.includes("youtube.com") || url.includes("youtu.be")) {

      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: "Invalid YouTube link" });
      }

      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: "18" });

      return res.json({
        platform: "YouTube",
        title: info.videoDetails?.title || "YouTube Video",
        thumbnail: info.videoDetails?.thumbnails?.[0]?.url || "",
        download_url: format?.url
      });
    }

    // ================= TIKTOK =================
    if (url.includes("tiktok.com") || url.includes("vt.tiktok")) {

      const { data } = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
      
      if (!data?.data?.play) {
        throw new Error("TikTok API se video link nahi mila");
      }

      return res.json({
        platform: "TikTok",
        title: data.data?.title || "TikTok Video",
        thumbnail: data.data?.cover || "",
        download_url: data.data.play
      });
    }

    // ================= PINTEREST =================
    if (url.includes("pinterest.com") || url.includes("pin.it")) {

      const { data } = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${url}`);
      
      if (!data?.data) {
        throw new Error("Pinterest API se video nahi mili");
      }

      let video = Array.isArray(data.data) ? data.data[0] : data.data;

      return res.json({
        platform: "Pinterest",
        title: "Pinterest Video",
        download_url: video
      });
    }

    // ================= INSTAGRAM =================
    if (url.includes("instagram.com")) {

      const { data } = await axios.get(`https://api.siputzx.my.id/api/d/igdl?url=${url}`);
      
      if (!data?.data?.[0]?.url) {
        throw new Error("Instagram API se video nahi mili");
      }

      return res.json({
        platform: "Instagram",
        title: "Instagram Video",
        download_url: data.data[0].url
      });
    }

    // ================= FACEBOOK =================
    if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("fb.com")) {

      const { data } = await axios.get(`https://api.siputzx.my.id/api/d/fb?url=${url}`);
      
      let download_url = data?.data?.hd || data?.data?.sd;
      if (!download_url) {
        throw new Error("Facebook API se video nahi mili");
      }

      return res.json({
        platform: "Facebook",
        title: "Facebook Video",
        download_url: download_url
      });
    }

    // ================= TWITTER / X =================
    if (url.includes("twitter.com") || url.includes("x.com")) {

      const { data } = await axios.get(`https://api.siputzx.my.id/api/d/twitter?url=${url}`);
      
      let download_url = data?.data?.HD || data?.data?.SD;
      if (!download_url) {
        throw new Error("Twitter API se video nahi mili");
      }

      return res.json({
        platform: "Twitter",
        title: "Twitter Video",
        download_url: download_url
      });
    }

    // Agar koi aisi website ho jo list mein na ho
    return res.status(400).json({ error: "Platform supported nahi hai" });

  } catch (err) {
    // Vercel dashboard mein check karne ke liye asol error print karega
    console.error("== API ERROR ==", err.message);

    return res.status(500).json({
      error: "Video fetch nahi ho saka",
      details: err.message
    });
  }
};
