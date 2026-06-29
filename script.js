/* ==========================================================================
   Undangan Pernikahan — Effrem & Eka
   Script: musik, countdown, form RSVP, buku tamu, toast, reveal animation
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------- PRELOADER ---------------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
      if (preloader) {
          setTimeout(() => {
              preloader.classList.add('preloader-hidden');
              setTimeout(() => preloader.style.display = 'none', 800);
          }, 1000); // 1s min display time for effect
      }
  });

  // Tombol Buka Undangan sekarang menggunakan onclick="openInvitation()" dari HTML

  /* ---------------- MUSIC LOGIC ---------------- */
  const audio = document.getElementById('bgMusic');
  const musicToggleBtn = document.getElementById('musicToggle');
  const musicIcon = musicToggleBtn ? musicToggleBtn.querySelector('i') : null;
  let isPlaying = false;

  function updateMusicIcon() {
    if (!musicIcon || !musicToggleBtn) return;
    musicIcon.className = isPlaying ? 'fas fa-music' : 'fas fa-volume-mute';
    musicToggleBtn.setAttribute('aria-label', isPlaying ? 'Matikan musik' : 'Nyalakan musik');
    musicToggleBtn.setAttribute('aria-pressed', String(isPlaying));
  }

  function playMusic() {
    if (audio) {
      audio.play().then(() => {
        isPlaying = true;
        updateMusicIcon();
        musicToggleBtn && musicToggleBtn.classList.add('playing');
      }).catch(() => {
        isPlaying = false;
        updateMusicIcon();
      });
    }
  }

  window.openInvitation = function openInvitation() {
    const overlay = document.getElementById('welcome-overlay');
    const bodyLock = document.getElementById('body-lock');
    if (overlay) {
      overlay.classList.add('welcome-open');
      setTimeout(() => {
          overlay.classList.add('slide-up');
      }, 500);
      
      overlay.addEventListener('transitionend', () => {
        overlay.setAttribute('aria-hidden', 'true');
      }, { once: true });
    }

    if (bodyLock) {
        bodyLock.classList.remove('overflow-hidden');
    } else {
        document.body.style.overflow = 'auto';
    }
    
    if (typeof window.burstConfetti === 'function') {
        setTimeout(window.burstConfetti, 1000);
    }

    if (audio) {
      audio.play().then(() => {
        isPlaying = true;
        updateMusicIcon();
        musicToggleBtn && musicToggleBtn.classList.add('playing');
      }).catch(() => {
        isPlaying = false;
        updateMusicIcon();
      });
    }

    // Pindahkan fokus ke konten utama untuk pengguna keyboard / screen reader
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus({ preventScroll: true });
    }
  };

  if (musicToggleBtn && audio) {
    musicToggleBtn.addEventListener('click', () => {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        musicToggleBtn.classList.remove('playing');
      } else {
        audio.play().catch(() => {});
        isPlaying = true;
        musicToggleBtn.classList.add('playing');
      }
      updateMusicIcon();
    });
    updateMusicIcon();
  }

  /* ---------------- COUNTDOWN LOGIC ---------------- */
  // Target: 25 Juli 2026 11:00:00 WIB (UTC+7)
  const countDownDate = new Date('2026-07-25T11:00:00+07:00').getTime();
  const countdownEl = document.getElementById('countdown-timer');

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tickCountdown() {
    const now = Date.now();
    const distance = countDownDate - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      if (countdownEl) {
        countdownEl.innerHTML = "<div class='text-xl md:text-2xl font-bold text-[#FFC107]' role='status'>Acara sedang berlangsung / telah selesai</div>";
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setText('days', pad(days));
    setText('hours', pad(hours));
    setText('minutes', pad(minutes));
    setText('seconds', pad(seconds));
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  let countdownInterval = null;
  if (countdownEl) {
    tickCountdown();
    countdownInterval = setInterval(tickCountdown, 1000);
  }

  /* ---------------- COPY TO CLIPBOARD ---------------- */
  window.copyText = function copyText(text, label) {
    const fallbackCopy = () => {
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);
      tempInput.select();
      try { document.execCommand('copy'); } catch (e) { /* no-op */ }
      document.body.removeChild(tempInput);
    };

    const done = () => showToast((label || 'Teks') + ' berhasil disalin!');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {
        fallbackCopy();
        done();
      });
    } else {
      fallbackCopy();
      done();
    }
  };

  /* ---------------- TOAST ---------------- */
  let toastTimeout = null;
  window.showToast = function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  /* ---------------- FORM VALIDATION HELPERS ---------------- */
  function showFieldError(input, message) {
    input.classList.add('field-error');
    input.setAttribute('aria-invalid', 'true');
    const errorEl = document.getElementById(input.id + '-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
  }

  function clearFieldError(input) {
    input.classList.remove('field-error');
    input.removeAttribute('aria-invalid');
    const errorEl = document.getElementById(input.id + '-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }
  }

  function validateRequired(input, message) {
    if (!input.value || !input.value.trim()) {
      showFieldError(input, message || 'Wajib diisi.');
      return false;
    }
    clearFieldError(input);
    return true;
  }

  /* ---------------- RSVP FORM ---------------- */
  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    const rsvpName = document.getElementById('rsvpName');
    const rsvpStatus = document.getElementById('rsvpStatus');
    const rsvpCount = document.getElementById('rsvpCount');

    [rsvpName, rsvpStatus].forEach((input) => {
      if (!input) return;
      input.addEventListener('blur', () => validateRequired(input));
    });

    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameValid = validateRequired(rsvpName, 'Mohon isi nama lengkap Anda.');
      const statusValid = validateRequired(rsvpStatus, 'Mohon pilih konfirmasi kehadiran.');

      if (!nameValid || !statusValid) {
        const firstInvalid = !nameValid ? rsvpName : rsvpStatus;
        firstInvalid.focus();
        return;
      }

      const submitBtn = rsvpForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Mengirim...';
      }

      // Pengiriman via WhatsApp
      let waMessage = `Halo, saya ${encodeURIComponent(nameValid.value.trim())}. `;
      waMessage += `Saya ingin konfirmasi bahwa saya *${encodeURIComponent(statusValid.value)}* acara pernikahan Effrem & Eka.`;
      
      const countValue = rsvpCount ? parseInt(rsvpCount.value, 10) : 0;
      if (statusValid.value === 'Hadir' && countValue > 0) {
        waMessage += ` %0A%0AJumlah kehadiran: ${countValue} orang.`;
      }
      
      const waNumber = "6281234567890"; // Ganti dengan nomor WA asli
      const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

      setTimeout(() => {
        window.open(waUrl, '_blank');
        showToast('Dialihkan ke WhatsApp...');
        rsvpForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
      }, 600);
    });
  }

  /* ---------------- GUESTBOOK ---------------- */
  const guestForm = document.getElementById('guestbookForm');
  if (guestForm) {
    const guestName = document.getElementById('guestName');
    const guestMessage = document.getElementById('guestMessage');
    const box = document.getElementById('comments-box');

    [guestName, guestMessage].forEach((input) => {
      if (!input) return;
      input.addEventListener('blur', () => validateRequired(input));
    });

    guestForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameValid = validateRequired(guestName, 'Mohon isi nama Anda.');
      const msgValid = validateRequired(guestMessage, 'Mohon tulis ucapan & doa.');

      if (!nameValid || !msgValid) {
        const firstInvalid = !nameValid ? guestName : guestMessage;
        firstInvalid.focus();
        return;
      }

      const name = guestName.value.trim();
      const msg = guestMessage.value.trim();

      const newComment = document.createElement('div');
      newComment.className = 'bg-white p-4 rounded-xl border-l-4 border-[#FFC107] mb-2 shadow-md transform scale-95 opacity-0 transition-all duration-500 ease-out';
      newComment.setAttribute('role', 'listitem');
      newComment.innerHTML =
        '<p class="font-bold text-sm text-[#8B0000]">' + escapeHtml(name) +
        ' <span class="text-xs text-gray-400 font-normal ml-2">Baru saja</span></p>' +
        '<p class="text-sm text-gray-700 mt-1">' + escapeHtml(msg) + '</p>';

      if (box) {
        box.insertBefore(newComment, box.firstChild);
        
        // Trigger reflow & animation
        requestAnimationFrame(() => {
            newComment.classList.remove('scale-95', 'opacity-0');
            newComment.classList.add('scale-100', 'opacity-100');
        });
      }

      guestForm.reset();
      showToast('Ucapan berhasil dikirim. Terima kasih!');
      
      if (typeof window.burstConfetti === 'function') {
          window.burstConfetti();
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- LIGHTBOX GALERI ---------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const photoItems = document.querySelectorAll('.photo-item');

  if (lightbox && lightboxImg) {
    photoItems.forEach(img => {
      img.style.cursor = 'pointer';
      img.classList.add('transition', 'transform', 'hover:scale-105');
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightbox.classList.remove('hidden');
        // Small delay to allow display:block to apply before animating opacity
        requestAnimationFrame(() => {
          lightbox.classList.remove('opacity-0');
          lightbox.classList.add('opacity-100');
        });
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('opacity-100');
      lightbox.classList.add('opacity-0');
      setTimeout(() => {
        lightbox.classList.add('hidden');
        lightboxImg.src = '';
      }, 300);
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ---------------- REVEAL ON SCROLL ---------------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-3d, .reveal-zoom, .reveal-slide-left, .reveal-slide-right, .reveal-flip');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: tampilkan langsung jika IntersectionObserver tidak didukung
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- LAZY IMAGE LOADED STATE ---------------- */
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });
})();
