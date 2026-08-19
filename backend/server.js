const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =========================================================
// 1. CACHE & LOGIKA YOUTUBE (4 VIDEO TERBARU)
// =========================================================
let youtubeCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 Menit Cache

async function getLatestYouTubeVideos() {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    console.log("Key loaded:", apiKey ? "OK" : "MISSING");
    console.log("Channel loaded:", channelId ? "OK" : "MISSING");

    if (!apiKey || !channelId) return null;

    // Mengambil 4 video terbaru (maxResults=4)
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=4&type=video`;
    const response = await fetch(url);
    const data = await response.json();

    // LOG INI UNTUK MENGETAHUI ERROR DARI GOOGLE (seperti Quota Exceeded / API Disabled)
    if (data.error) {
        console.error("YouTube API Error Details:", data.error.message);
        return null;
    }

    if (!data.items || data.items.length === 0) return null;

    // Mapping 4 item video menjadi array sederhana
    return data.items.map(video => ({
        videoId: video.id.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high ? video.snippet.thumbnails.high.url : video.snippet.thumbnails.default.url,
        publishedAt: video.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`
    }));
}

app.get('/api/youtube/latest', async (req, res) => {
    try {
        const currentTime = Date.now();
        
        // Mengembalikan cache jika belum expired (membuat loading jadi instant 0ms)
        if (youtubeCache && (currentTime - lastFetchTime < CACHE_DURATION)) {
            return res.json({ success: true, cached: true, data: youtubeCache });
        }

        const videosData = await getLatestYouTubeVideos();
        
        if (!videosData) {
            return res.status(404).json({ success: false, message: "Video tidak ditemukan atau API Key invalid." });
        }

        youtubeCache = videosData;
        lastFetchTime = currentTime;

        res.json({ success: true, cached: false, data: videosData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =========================================================
// 2. LOGIKA ACTIVITY STATUS
// =========================================================
app.get('/api/activity/now-playing', async (req, res) => {
    try {
        res.json({
            success: true,
            is_playing: true,
            activity: {
                game: process.env.CURRENT_GAME || "Not Playing",
                details: process.env.GAME_DETAILS || "Offline / Koding"
            }
        });
    } catch (error) {
        console.error("Error Activity API:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// =========================================================
// 3. STATIC FILES FRONTEND
// =========================================================
app.use(express.static(path.join(__dirname, '../frontend')));

// Jalankan Server
app.listen(PORT, () => {
    console.log(`🚀 Server Back-End aktif di http://localhost:${PORT}`);
});

// Tambahkan baris ini di paling bawah backend/server.js
module.exports = app;