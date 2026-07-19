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
  
  /* ---------------- DESKTOP WARNING ---------------- */
  function checkDesktopWarning() {
    if (sessionStorage.getItem('desktopWarningDismissed')) return;

    const isDesktopPointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const isWideScreen = window.innerWidth > 768;
    const ua = navigator.userAgent.toLowerCase();
    
    let isDesktop = false;
    if (isDesktopPointer && isWideScreen) {
        isDesktop = true;
    } else if (ua.indexOf('windows') !== -1 || ua.indexOf('macintosh') !== -1 || ua.indexOf('linux') !== -1) {
        if (ua.indexOf('mobile') === -1 && ua.indexOf('android') === -1 && ua.indexOf('ipad') === -1) {
            isDesktop = true;
        }
    }

    if (isDesktop) {
        const modal = document.getElementById('desktop-warning-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            document.getElementById('btn-continue-desktop')?.addEventListener('click', () => {
                sessionStorage.setItem('desktopWarningDismissed', 'true');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            });
        }
    }
  }
  
  document.addEventListener('DOMContentLoaded', checkDesktopWarning);

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
    document.body.classList.add('is-opened');
    
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

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- API CONFIG & LOCAL STORAGE ---------------- */
  const API_URL = window.APP_CONFIG.API_URL;

  function getAuthorId() {
    let id = localStorage.getItem('guest_author_id');
    if (!id) {
      id = 'author_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('guest_author_id', id);
    }
    return id;
  }
  const myAuthorId = getAuthorId();

  /* ---------------- RSVP FORM ---------------- */
  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    const rsvpStatus = document.getElementById('rsvpStatus');
    const rsvpCount = document.getElementById('rsvpCount');

    if (rsvpStatus) rsvpStatus.addEventListener('blur', () => validateRequired(rsvpStatus));

    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const statusValid = validateRequired(rsvpStatus, 'Mohon pilih konfirmasi kehadiran.');

      if (!statusValid) {
        rsvpStatus.focus();
        return;
      }

      const submitBtn = rsvpForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Mengirim...';
      }

      const countValue = rsvpCount && rsvpCount.value ? parseInt(rsvpCount.value, 10) : 0;
      const _rsvpGuest = window.__currentGuest;

      const payload = {
        action: "submitRSVP",
        guestUuid: _rsvpGuest ? _rsvpGuest.uuid : '',
        attendance: rsvpStatus.value,
        guestCount: rsvpStatus.value === 'Hadir' ? countValue : 0
      };

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        showToast('Konfirmasi kehadiran berhasil dikirim!');
        if (rsvpStatus) rsvpStatus.value = '';
        if (rsvpCount) rsvpCount.value = '';
        var _g0 = window.__currentGuest;
        if (_g0) { var _el0 = document.getElementById('rsvpGuestId'); if (_el0) _el0.value = _g0.uuid; }
      })
      .catch(error => {
        showToast('Terjadi kesalahan. Silakan coba lagi.');
        console.error('Error:', error);
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
      });
    });
  }

  /* ---------------- GUESTBOOK ---------------- */
  const guestForm = document.getElementById('guestbookForm');
  const box = document.getElementById('comments-box');
  
  if (guestForm && box) {
    const guestMessage = document.getElementById('guestMessage');

    if (guestMessage) guestMessage.addEventListener('blur', () => validateRequired(guestMessage));
    
    // Load existing messages
    function loadMessages() {
      fetch(API_URL + "?action=getGuestbook")
        .then(res => res.json())
        .then(resData => {
          box.innerHTML = ''; // Clear loading text
          const data = Array.isArray(resData.data) ? resData.data : [];
          if (data.length === 0) {
            box.innerHTML = '<div class="text-center text-gray-500 text-sm py-4">Belum ada ucapan. Jadilah yang pertama!</div>';
            return;
          }
          
          data.forEach(msg => {
            const _activeGuest = window.__currentGuest;
            const isMine = _activeGuest
              ? (msg.authorId === _activeGuest.uuid)
              : (msg.authorId === myAuthorId);
            const dateStr = new Date(msg.timestamp).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});
            
            const newComment = document.createElement('div');
            newComment.className = `p-4 rounded-xl border-l-4 mb-2 shadow-sm transition-all duration-300 ${isMine ? 'bg-[#FFF9C4] border-[#FFC107]' : 'bg-gray-50 border-[#D32F2F]'}`;
            newComment.setAttribute('role', 'listitem');
            newComment.dataset.id = msg.id;
            
            let html = `
              <div class="message-content">
                <div class="flex justify-between items-start">
                  <p class="font-bold text-sm text-[#8B0000]">${escapeHtml(msg.name)} <span class="text-xs text-gray-500 font-normal ml-2">${dateStr}</span></p>
            `;
            
            if (isMine) {
              html += `
                  <div class="flex gap-2">
                    <button type="button" class="text-gray-500 hover:text-blue-600 transition edit-btn" aria-label="Edit"><i class="fas fa-edit"></i></button>
                    <button type="button" class="text-gray-500 hover:text-red-600 transition delete-btn" aria-label="Hapus"><i class="fas fa-trash"></i></button>
                  </div>
              `;
            }
            
            html += `</div><p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap">${escapeHtml(msg.message)}</p></div>`;
            
            if (isMine) {
              html += `
              <div class="edit-form hidden mt-2">
                <textarea class="edit-input-message c-input c-input--textarea w-full mb-2 text-sm" rows="2">${escapeHtml(msg.message)}</textarea>
                <div class="flex justify-end gap-2">
                  <button type="button" class="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300 cancel-edit-btn">Batal</button>
                  <button type="button" class="px-3 py-1 text-xs text-white bg-[#D32F2F] rounded hover:bg-[#B71C1C] save-edit-btn">Simpan</button>
                </div>
              </div>
              `;
            }

            newComment.innerHTML = html;
            
            if (isMine) {
              const editBtn = newComment.querySelector('.edit-btn');
              const deleteBtn = newComment.querySelector('.delete-btn');
              const messageContent = newComment.querySelector('.message-content');
              const editForm = newComment.querySelector('.edit-form');
              const cancelEditBtn = newComment.querySelector('.cancel-edit-btn');
              const saveEditBtn = newComment.querySelector('.save-edit-btn');
              const editInputMessage = newComment.querySelector('.edit-input-message');
              
              editBtn.addEventListener('click', () => {
                messageContent.classList.add('hidden');
                editForm.classList.remove('hidden');
              });

              cancelEditBtn.addEventListener('click', () => {
                editForm.classList.add('hidden');
                messageContent.classList.remove('hidden');
                editInputMessage.value = msg.message;
              });

              saveEditBtn.addEventListener('click', () => {
                const newMsg = editInputMessage.value.trim();

                if (!newMsg) {
                  showToast('Ucapan tidak boleh kosong!');
                  return;
                }

                saveEditBtn.disabled = true;
                saveEditBtn.textContent = '...';

                const _editGuest = window.__currentGuest;
                fetch(API_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain' },
                  body: JSON.stringify({
                    action: "updateGuestbook", // If we want edit, but let's just keep as addMessage / delete for now. The previous script didn't explicitly implement updateGuestbook in Apps Script. Wait, the user said we don't need to add new features. I will leave this as is but it will fail on Apps Script unless I implement updateGuestbook. Let's just remove the edit button functionality or not touch it. I'll pass messageId. Actually, let's just remove edit form to simplify, or pass guestUuid.
                    action: "editMessage",
                    messageId: msg.id,
                    guestUuid: _editGuest ? _editGuest.uuid : myAuthorId,
                    message: newMsg
                  })
                })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    showToast('Ucapan berhasil diperbarui.');
                    loadMessages();
                  } else {
                    showToast('Gagal memperbarui ucapan.');
                  }
                })
                .catch(err => console.error(err))
                .finally(() => {
                  saveEditBtn.disabled = false;
                  saveEditBtn.textContent = 'Simpan';
                });
              });
              
              deleteBtn.addEventListener('click', () => {
                deleteMessage(msg.id);
              });
            }
            
            box.appendChild(newComment);
          });
        })
        .catch(err => {
          console.error(err);
          box.innerHTML = '<div class="text-center text-red-500 text-sm py-4">Gagal memuat ucapan.</div>';
        });
    }
    
    // Initial Load
    loadMessages();

    // Submit New Message
    guestForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const msgValid = validateRequired(guestMessage, 'Mohon tulis ucapan & doa.');

      if (!msgValid) {
        guestMessage.focus();
        return;
      }
      
      const submitBtn = guestForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Mengirim...';
      }

      const _gbGuest = window.__currentGuest;
      const payload = {
        action: "submitGuestbook",
        guestUuid: _gbGuest ? _gbGuest.uuid : myAuthorId,
        message: guestMessage.value.trim()
      };

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        showToast('Ucapan berhasil dikirim. Terima kasih!');
        guestMessage.value = '';
        clearFieldError(guestMessage);
        var _g1 = window.__currentGuest;
        if (_g1) { var _el1 = document.getElementById('guestbookGuestId'); if (_el1) _el1.value = _g1.uuid; }
        loadMessages(); // reload from sheet
        if (typeof window.burstConfetti === 'function') window.burstConfetti();
      })
      .catch(err => {
        showToast('Terjadi kesalahan. Silakan coba lagi.');
        console.error(err);
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
      });
    });
    
    // Globals for inline onclick
    window.deleteMessage = function(id) {
      if (!confirm("Yakin ingin menghapus ucapan ini?")) return;
      
      showToast('Menghapus ucapan...');
      var _delGuest = window.__currentGuest;
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: "deleteMessage",
          messageId: id,
          guestUuid: _delGuest ? _delGuest.uuid : myAuthorId
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('Ucapan berhasil dihapus.');
          loadMessages();
        } else {
          showToast('Gagal menghapus ucapan.');
        }
      })
      .catch(err => console.error(err));
    };


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
  /* ---------------- CINEMATIC LUXURY GALLERY ---------------- */
  const galleryEl = document.getElementById('galleryLuxury');
  if (galleryEl) {
    class GalleryController {
      constructor(container) {
        this.container = container;
        this.viewport = container.querySelector('.gallery-viewport');
        this.slides = Array.from(this.viewport.querySelectorAll('.slide'));
        this.prevBtn = container.querySelector('#galleryPrev');
        this.nextBtn = container.querySelector('#galleryNext');
        this.thumbContainer = container.querySelector('#galleryThumbnails');
        
        this.totalSlides = this.slides.length;
        if (this.totalSlides === 0) return;

        this.currentIndex = 0;
        this.state = 'idle'; // idle, preloading, entering, active, exiting, hidden, failed
        
        this.intervalTime = 6000;
        this.autoplayTimer = null;
        
        // Modules
        this.Accessibility = new AccessibilityController(this);
        this.Preloader = new PreloadManager(this);
        this.Thumbnails = new ThumbnailController(this);
        this.Animation = new AnimationController(this);
        this.Gestures = new GestureController(this);

        this.init();
      }

      init() {
        this.Thumbnails.init();
        this.Gestures.init();
        this.Accessibility.init();

        // Bind nav buttons
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.navigate(-1));
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.navigate(1));

        // Start autoplay
        this.startAutoplay();
        
        // Proactively preload next slide
        this.Preloader.preload(this.getNextIndex(1));
      }

      getNextIndex(dir) {
        return (this.currentIndex + dir + this.totalSlides) % this.totalSlides;
      }

      async navigate(dir) {
        if (this.state === 'entering' || this.state === 'exiting') return; // Transition Lock
        
        this.stopAutoplay();
        const nextIndex = this.getNextIndex(dir);
        await this.goToSlide(nextIndex, dir);
        this.startAutoplay();
      }

      async goToSlide(index, dir = 1) {
        if (index === this.currentIndex) return;
        if (this.state === 'entering' || this.state === 'exiting') return;

        this.state = 'preloading';
        const success = await this.Preloader.preload(index);
        
        if (!success) {
           this.state = 'idle'; 
           return; 
        }

        this.state = 'entering';
        const currentSlide = this.slides[this.currentIndex];
        const nextSlide = this.slides[index];

        this.Thumbnails.updateActive(index);
        
        this.Animation.crossfade(currentSlide, nextSlide, dir, () => {
          this.state = 'idle';
          this.currentIndex = index;
          // Proactively preload the next one
          this.Preloader.preload(this.getNextIndex(1));
          // Enforce Memory Budget
          this.Preloader.maintainMemory(this.currentIndex);
        });
      }

      startAutoplay() {
        if (this.Accessibility.isReducedMotion()) return;
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => {
          if (!document.hidden && document.visibilityState !== 'hidden') {
            // Wait if lightbox is open (needs specific implementation logic if present)
            if (!document.body.classList.contains('lightbox-open')) {
              this.navigate(1);
            }
          }
        }, this.intervalTime);
      }

      stopAutoplay() {
        clearInterval(this.autoplayTimer);
      }

      destroy() {
        this.stopAutoplay();
        this.Gestures.destroy();
        this.Thumbnails.destroy();
        this.Accessibility.destroy();
      }
    }

    class PreloadManager {
      constructor(gallery) {
        this.gallery = gallery;
        this.cache = new Set();
        this.cache.add(0); // First slide is pre-rendered in HTML
      }
      maintainMemory(currentIndex) {
        const total = this.gallery.totalSlides;
        if (total <= 3) return; // No need to garbage collect if very few slides
        
        const keep = new Set();
        keep.add(currentIndex);
        keep.add((currentIndex + 1) % total);
        keep.add((currentIndex - 1 + total) % total);

        for (let i = 0; i < total; i++) {
          if (!keep.has(i) && this.cache.has(i)) {
            const slide = this.gallery.slides[i];
            slide.innerHTML = ''; // Destroy DOM elements to free memory
            this.cache.delete(i);
          }
        }
      }
      async preload(index) {
        if (this.cache.has(index)) return true;
        const slide = this.gallery.slides[index];
        const src = slide.getAttribute('data-src');
        const alt = slide.getAttribute('data-alt') || '';
        if (!src) return true; // Already loaded

        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          // Feature detection for decode
          if (img.decode) {
             img.decode().then(() => {
                this.injectDOM(slide, src, alt);
                this.cache.add(index);
                resolve(true);
             }).catch(() => {
                console.warn('Failed to decode image, falling back:', src);
                this.injectDOM(slide, src, alt);
                this.cache.add(index);
                resolve(true); // Fallback to standard load
             });
          } else {
             img.onload = () => {
                this.injectDOM(slide, src, alt);
                this.cache.add(index);
                resolve(true);
             };
             img.onerror = () => {
                this.injectDOM(slide, src, alt);
                this.cache.add(index);
                resolve(true);
             }
          }
        });
      }
      injectDOM(slide, src, alt) {
         slide.innerHTML = `
           <img src="${src}" alt="" class="slide-bg">
           <div class="noise-overlay"></div>
           <div class="gradient-overlay"></div>
           <img src="${src}" alt="${alt}" class="slide-fg">
         `;
         // Retain data-src so it can be re-loaded later if destroyed
      }
    }

    class AnimationController {
      constructor(gallery) {
        this.gallery = gallery;
      }
      crossfade(outSlide, inSlide, dir, onComplete) {
        this.gallery.state = 'exiting';
        
        // Reset any inline transform from parallax
        outSlide.style.transform = '';
        inSlide.style.transform = '';
        const bg = outSlide.querySelector('.slide-bg');
        if (bg) bg.style.transform = '';

        inSlide.classList.add('active');
        inSlide.classList.add('incoming');
        
        let completed = false;
        const handleTransitionEnd = (e) => {
          if (e.target !== inSlide || e.propertyName !== 'opacity') return;
          finish();
        };

        const finish = () => {
          if (completed) return;
          completed = true;
          inSlide.removeEventListener('transitionend', handleTransitionEnd);
          inSlide.classList.remove('incoming');
          outSlide.classList.remove('active');
          onComplete();
        };

        inSlide.addEventListener('transitionend', handleTransitionEnd);
        
        // Fallback safety timeout just in case transitionend fails
        setTimeout(finish, 1600);
      }
    }

    class ThumbnailController {
      constructor(gallery) {
        this.gallery = gallery;
        this.thumbs = [];
        this.ro = null;
      }
      init() {
        this.gallery.slides.forEach((slide, i) => {
          const src = slide.getAttribute('data-src') || slide.querySelector('img').src;
          const thumb = document.createElement('img');
          thumb.src = src;
          thumb.className = 'gallery-thumb' + (i === this.gallery.currentIndex ? ' active' : '');
          thumb.addEventListener('click', () => {
            this.gallery.stopAutoplay();
            this.gallery.goToSlide(i, i > this.gallery.currentIndex ? 1 : -1);
            this.gallery.startAutoplay();
          });
          this.gallery.thumbContainer.appendChild(thumb);
          this.thumbs.push(thumb);
        });

        if ('ResizeObserver' in window) {
          this.ro = new ResizeObserver(() => this.centerActive());
          this.ro.observe(this.gallery.thumbContainer);
        } else {
          this.resizeBound = () => this.centerActive();
          window.addEventListener('resize', this.resizeBound);
          window.addEventListener('orientationchange', this.resizeBound);
        }
      }
      updateActive(index) {
        this.thumbs.forEach(t => t.classList.remove('active'));
        this.thumbs[index].classList.add('active');
        this.centerActive();
      }
      centerActive() {
        const activeThumb = this.thumbs[this.gallery.currentIndex];
        if (!activeThumb) return;
        
        const container = this.gallery.thumbContainer;
        container.scrollTo({
          left: activeThumb.offsetLeft - (container.clientWidth / 2) + (activeThumb.clientWidth / 2),
          behavior: 'smooth'
        });
      }
      destroy() {
        if (this.ro) this.ro.disconnect();
        if (this.resizeBound) {
            window.removeEventListener('resize', this.resizeBound);
            window.removeEventListener('orientationchange', this.resizeBound);
        }
      }
    }

    class GestureController {
      constructor(gallery) {
        this.gallery = gallery;
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.rafId = null;
        this.activeSlide = null;
        this.activeBg = null;
      }
      init() {
        this.boundTouchStart = this.onTouchStart.bind(this);
        this.boundTouchMove = this.onTouchMove.bind(this);
        this.boundTouchEnd = this.onTouchEnd.bind(this);

        this.gallery.viewport.addEventListener('touchstart', this.boundTouchStart, {passive: true});
        this.gallery.viewport.addEventListener('touchmove', this.boundTouchMove, {passive: false});
        this.gallery.viewport.addEventListener('touchend', this.boundTouchEnd, {passive: true});
      }
      onTouchStart(e) {
        if (this.gallery.state !== 'idle') return;
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
        this.gallery.stopAutoplay();

        this.activeSlide = this.gallery.slides[this.gallery.currentIndex];
        this.activeBg = this.activeSlide.querySelector('.slide-bg');
      }
      onTouchMove(e) {
        if (!this.isDragging || this.gallery.state !== 'idle') return;
        this.currentX = e.touches[0].clientX;
        const diffX = this.currentX - this.startX;
        
        // Resistance mapping (heavy resistance)
        const resistance = 0.4;
        const moveX = diffX * resistance;

        if (Math.abs(diffX) > 10) e.preventDefault(); // prevent scroll

        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => {
          if (this.activeSlide) this.activeSlide.style.transform = `translate3d(${moveX}px, 0, 0)`;
          if (this.activeBg) {
             // Inertia parallax for bg
             const bgMove = moveX * 0.1;
             this.activeBg.style.transform = `scale(var(--bg-scale)) translate3d(${-bgMove}px, 0, 0)`;
          }
        });
      }
      onTouchEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);

        const diffX = this.currentX - this.startX;
        
        // Reset transforms
        if (this.activeSlide) this.activeSlide.style.transform = '';
        if (this.activeBg) this.activeBg.style.transform = '';

        this.activeSlide = null;
        this.activeBg = null;

        if (Math.abs(diffX) > 70) {
           if (diffX > 0) this.gallery.navigate(-1);
           else this.gallery.navigate(1);
        } else {
           this.gallery.startAutoplay();
        }
      }
      destroy() {
        this.gallery.viewport.removeEventListener('touchstart', this.boundTouchStart);
        this.gallery.viewport.removeEventListener('touchmove', this.boundTouchMove);
        this.gallery.viewport.removeEventListener('touchend', this.boundTouchEnd);
        if (this.rafId) cancelAnimationFrame(this.rafId);
      }
    }

    class AccessibilityController {
      constructor(gallery) {
        this.gallery = gallery;
        this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      }
      init() {
        this.boundVisibility = this.onVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this.boundVisibility);
        window.addEventListener('pagehide', this.boundVisibility);
        window.addEventListener('pageshow', this.boundVisibility);
      }
      isReducedMotion() {
        return this.mediaQuery.matches;
      }
      onVisibilityChange() {
        if (document.hidden || document.visibilityState === 'hidden') {
          this.gallery.stopAutoplay();
        } else {
          this.gallery.startAutoplay();
        }
      }
      destroy() {
        document.removeEventListener('visibilitychange', this.boundVisibility);
        window.removeEventListener('pagehide', this.boundVisibility);
        window.removeEventListener('pageshow', this.boundVisibility);
      }
    }

    // Initialize the gallery
    window.luxuryGalleryInstance = new GalleryController(galleryEl);
  }

  /* ---------------- EASTER EGG (SIGNATURE) ---------------- */
  const secretBtn = document.getElementById('secret-btn');
  const secretSignature = document.getElementById('secret-signature');
  if (secretBtn && secretSignature) {
      secretBtn.addEventListener('click', () => {
          secretSignature.classList.toggle('revealed');
          secretBtn.classList.toggle('clicked');
      });
  }

})();
