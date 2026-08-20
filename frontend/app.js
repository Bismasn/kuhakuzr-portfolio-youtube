const BACKEND_URL = ''; // Cukup kosongkan agar mengikuti origin domain/localhost

// 1. FETCH STATUS ACTIVITY DISCORD (GAME)
const DISCORD_ID = '691612004854530081'; // Contoh: '345678901234567890'

async function fetchDiscordStatus() {
    const statusBadge = document.getElementById('statusBadge');
  const gameTitle = document.getElementById('gameTitle');
  const gameDetails = document.getElementById('gameDetails');

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    const result = await response.json();

    if (result.success && result.data) {
      const data = result.data;
      const gameActivity = data.activities.find(act => act.type === 0); // Type 0 = Playing Game

      // 1. Update Badge Status & Warna Class (online, idle, dnd, offline)
      if (statusBadge) {
        const status = data.discord_status;
        statusBadge.textContent = status.toUpperCase();
        statusBadge.className = `badge ${status}`; // Menyesuaikan class CSS (misal: badge online)
      }

      // 2. Update Judul & Detail Game
      if (gameActivity) {
        if (gameTitle) gameTitle.textContent = gameActivity.name;
        if (gameDetails) gameDetails.textContent = gameActivity.details || gameActivity.state || 'Sedang dimainkan';
      } else {
        if (gameTitle) gameTitle.textContent = 'Tidak Sedang Bermain';
        if (gameDetails) gameDetails.textContent = `Status Discord: ${data.discord_status.toUpperCase()}`;
      }
    } else {
      if (gameTitle) gameTitle.textContent = 'User Tidak Ditemukan';
      if (gameDetails) gameDetails.textContent = 'Pastikan sudah join server Discord Lanyard.';
    }
  } catch (error) {
    console.error('Error fetching Lanyard:', error);
    if (gameTitle) gameTitle.textContent = 'Gagal Memuat Status';
    if (gameDetails) gameDetails.textContent = 'Terjadi kesalahan koneksi API.';
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
    const slider = document.querySelector('.video-slider');
    
    if (slider) {
        slider.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                slider.scrollLeft += e.deltaY * 1.5;
            }
        }, { passive: false });
    }
    
    // Jalankan saat halaman di-load
    fetchDiscordStatus();
    fetchVideos();
});

// Auto refresh status game setiap 30 detik
setInterval(fetchDiscordStatus, 30000);