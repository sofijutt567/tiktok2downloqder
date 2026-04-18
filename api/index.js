const axios = require("axios");
const ytdl = require("ytdl-core");

module.exports = async (req, res) => {

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
    if (url.includes("youtube.com") || url.includes("youtu.be")) {

      if (!ytdl.validateURL(url)) {
        throw new Error("Invalid YouTube link");
      }

      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: "18" });

      return res.json({
        platform: "YouTube",
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[0].url,
        download_url: format.url
      });
    }

    // ================= TIKTOK =================
    if (url.includes("tiktok.com")) {

      const { data } = await axios.get(`https://www.tikwm.com/api/?url=${url}`);

      return res.json({
        platform: "TikTok",
        title: data.data.title,
        thumbnail: data.data.cover,
        download_url: data.data.play
      });
    }

    // ================= PINTEREST =================
    if (url.includes("pinterest.com") || url.includes("pin.it")) {

      const { data } = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${url}`);

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

      return res.json({
        platform: "Instagram",
        title: "Instagram Video",
        download_url: data.data[0].url
      });
    }

    // ================= FACEBOOK =================
    if (url.includes("facebook.com")) {

      const { data } = await axios.get(`https://api.siputzx.my.id/api/d/fb?url=${url}`);

      return res.json({
        platform: "Facebook",
        title: "Facebook Video",
        download_url: data.data.hd || data.data.sd
      });
    }

    // ================= TWITTER =================
    if (url.includes("twitter.com") || url.includes("x.com")) {

      const { data } = await axios.get(`https://api.siputzx.my.id/api/d/twitter?url=${url}`);

      return res.json({
        platform: "Twitter",
        title: "Twitter Video",
        download_url: data.data.HD || data.data.SD
      });
    }

    return res.json({ error: "Platform supported nahi hai" });

  } catch (err) {

    return res.json({
      error: "Video fetch nahi ho saka",
      message: err.message
    });

  }
};
