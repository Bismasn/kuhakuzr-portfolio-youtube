const BACKEND_URL = ''; // Cukup kosongkan agar mengikuti origin domain/localhost

// 1. FETCH STATUS ACTIVITY (GAME)
async function fetchActivityStatus() {
    const statusBadge = document.getElementById('statusBadge');
    const gameTitle = document.getElementById('gameTitle');
    const gameDetails = document.getElementById('gameDetails');

    try {
        const response = await fetch('/api/activity/now-playing');
        const result = await response.json();

        if (result.success) {
            const { is_playing, activity } = result;

            if (is_playing) {
                statusBadge.textContent = '🟢 Playing Now';
                statusBadge.className = 'badge online';
                gameTitle.textContent = activity.game;
                gameDetails.textContent = activity.details || 'Sedang berada di dalam game';
            } else {
                statusBadge.textContent = '⚪ Offline / Idle';
                statusBadge.className = 'badge offline';
                gameTitle.textContent = activity.game;
                gameDetails.textContent = activity.details;
            }
        }
    } catch (error) {
        console.error('Error fetching status:', error);
        statusBadge.textContent = '🔴 Server Error';
        statusBadge.className = 'badge offline';
        gameTitle.textContent = 'Gagal terhubung ke Back-End';
    }
}

// 2. FETCH YOUTUBE LATEST VIDEO
async function fetchVideos() {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;

    try {
        const response = await fetch('/api/youtube/latest');
        const result = await response.json();

        // Ambil data video dari properti result.data
        if (!result.success || !result.data) {
            videoList.innerHTML = `
            <p class="text-muted">Gagal Memuat Video Terbaru.</p>`;
            return;
        }

         // result.data sekarang berisi array 4 video
        const videos = Array.isArray(result.data) ? result.data : [result.data];

        videoList.innerHTML = videos.map(video => `
            <div class="video-card">
                <div class="thumbnail-container">
                    <img src="${video.thumbnail}" alt="${video.title}">
                </div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p class="description">${video.description}</p>
                    <a href="${video.url}" target="_blank" class="btn-youtube">
                        ▶ Tonton di YouTube
                    </a>
                </div>
            </div>
            `).join('');

    } catch (error) {
        console.error('Gagal mengambil data video:', error);
        videoList.innerHTML = `<p class="text-muted">Gagal terhubung ke server API.</p>`;
    }
}

function setupSlider() {
    const slider = document.getElementById('videoList');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!slider || !prevBtn || !nextBtn) return;

    // Navigasi Tombol
    prevBtn.onclick = () => {
        slider.scrollBy({ left: -300, behavior: 'smooth' });
    };

    nextBtn.onclick = () => {
        slider.scrollBy({ left: 300, behavior: 'smooth' });
    };
}

// Jalankan semua fungsi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    fetchActivityStatus();
    fetchVideos();
});

// Auto refresh status game setiap 30 detik
setInterval(fetchActivityStatus, 30000);