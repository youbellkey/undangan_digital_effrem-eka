
    /* =========================================================================
       CONFIG — from config.js
       ========================================================================= */
    const API_URL = window.APP_CONFIG.API_URL;
    const BASE_URL = window.APP_CONFIG.BASE_URL;

    /* =========================================================================
       STATE
       ========================================================================= */
    let guests = [];
    let editingIndex  = null; // null = add new, number = edit existing
    let linkGuest     = null; // guest shown in link modal
    let adminSession  = sessionStorage.getItem('adminSession') || null;

    /* =========================================================================
       INIT
       ========================================================================= */
    document.addEventListener('DOMContentLoaded', () => {
        if (adminSession) {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            loadGuests();
        }
    });

    /* =========================================================================
       API UTILS
       ========================================================================= */
    async function apiCall(payload) {
        if (adminSession) {
            payload.session = adminSession;
        }
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success && data.message === 'Unauthorized') {
            doLogout();
            throw new Error('Sesi telah berakhir. Silakan login kembali.');
        }
        if (!data.success) {
            throw new Error(data.message);
        }
        return data;
    }

    async function apiGet(action) {
        let url = `${API_URL}?action=${action}`;
        if (adminSession) url += `&session=${adminSession}`;
        
        const res = await fetch(url);
        const data = await res.json();
        if (!data.success && data.message === 'Unauthorized') {
            doLogout();
            throw new Error('Sesi telah berakhir. Silakan login kembali.');
        }
        if (!data.success) {
            throw new Error(data.message);
        }
        return data;
    }

    /* =========================================================================
       AUTH
       ========================================================================= */
    async function doLogin() {
        const val = document.getElementById('passwordInput').value;
        const btn = document.getElementById('loginBtn');
        const err = document.getElementById('loginError');
        
        err.classList.add('hidden');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'adminLogin',
                    password: val
                })
            });
            const data = await res.json();
            
            if (data.success) {
                adminSession = data.data.session;
                sessionStorage.setItem('adminSession', adminSession);
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                loadGuests();
            } else {
                err.classList.remove('hidden');
                document.getElementById('passwordInput').focus();
            }
        } catch (e) {
            showToast('Koneksi bermasalah. Coba lagi.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Masuk';
        }
    }

    function doLogout() {
        adminSession = null;
        sessionStorage.removeItem('adminSession');
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('passwordInput').value = '';
        guests = [];
    }

    /* =========================================================================
       DATA LOADING
       ========================================================================= */
    async function loadGuests() {
        showLoading(true);
        try {
            const data = await apiGet('listGuests');
            guests = Array.isArray(data.data) ? data.data : [];
        } catch (e) {
            showToast(e.message);
            guests = [];
        }
        renderTable();
        updateStats();
        showLoading(false);
    }

    function showLoading(show) {
        const el = document.getElementById('loadingOverlay');
        if (show) el.classList.remove('hidden');
        else el.classList.add('hidden');
    }

    /* =========================================================================
       TABLE RENDERING
       ========================================================================= */
    function renderTable() {
        const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
        const filtered = q
            ? guests.filter(g => g.displayName.toLowerCase().includes(q))
            : guests;

        const tbody = document.getElementById('guestTableBody');

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                  <td colspan="5" class="px-4 py-12 text-center text-gray-400">
                    <i class="fas fa-${q ? 'search' : 'users'} text-3xl mb-3 block text-gray-200"></i>
                    ${q ? 'Tidak ada tamu yang cocok.' : 'Belum ada tamu. Klik "Tambah Tamu".'}
                  </td>
                </tr>`;
            return;
        }

        // Sort descending by createdAt
        filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        tbody.innerHTML = filtered.map((g) => {
            const realIdx = guests.findIndex(xg => xg.uuid === g.uuid);
            const isActive = g.status === 'active';
            const badge = isActive
                ? '<span class="badge-active px-2 py-0.5 text-xs font-bold rounded-full">Aktif</span>'
                : '<span class="badge-inactive px-2 py-0.5 text-xs font-bold rounded-full">Nonaktif</span>';
            const dateStr = g.createdAt
                ? new Date(g.createdAt).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})
                : '—';
            
            const visitLabel = g.visitCount > 0 
                ? `<span class="text-xs text-blue-500 font-bold ml-2" title="Dibuka ${g.visitCount} kali"><i class="fas fa-eye"></i> ${g.visitCount}</span>` 
                : '';

            return `
            <tr class="hover:bg-gray-50 transition-colors ${isActive ? '' : 'is-inactive'}">
                <td class="px-4 py-3 text-gray-400 text-xs font-mono">${realIdx + 1}</td>
                <td class="px-4 py-3">
                    <p class="font-bold text-gray-800 text-sm">${escHtml(g.displayName)} ${visitLabel}</p>
                    <p class="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[220px]" title="${g.token}">${g.token}</p>
                </td>
                <td class="px-4 py-3">${badge}</td>
                <td class="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">${dateStr}</td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                        <button class="icon-btn bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="Link & QR Code" onclick="openLinkModal('${g.uuid}')">
                            <i class="fas fa-link"></i>
                        </button>
                        <button class="icon-btn bg-green-50 text-green-600 hover:bg-green-100"
                            title="Salin Pesan WhatsApp" onclick="copyWA('${g.uuid}')">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                        <button class="icon-btn bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                            title="Edit Nama" onclick="openEditModal('${g.uuid}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn bg-gray-50 text-gray-500 hover:bg-gray-200"
                            title="${isActive ? 'Nonaktifkan' : 'Aktifkan'}" onclick="toggleStatus('${g.uuid}')">
                            <i class="fas fa-${isActive ? 'ban' : 'check-circle'}"></i>
                        </button>
                        <button class="icon-btn bg-red-50 text-red-600 hover:bg-red-100"
                            title="Hapus Tamu" onclick="deleteGuest('${g.uuid}', '${escHtml(g.displayName).replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    function updateStats() {
        const total    = guests.length;
        const active   = guests.filter(g => g.status === 'active').length;
        const inactive = total - active;
        const visits   = guests.reduce((sum, g) => sum + (parseInt(g.visitCount) || 0), 0);

        document.getElementById('stat-total').textContent   = total;
        document.getElementById('stat-active').textContent  = active;
        document.getElementById('stat-inactive').textContent = inactive;
        document.getElementById('stat-visits').textContent  = visits;
        document.getElementById('statsLabel').textContent   = `${total} tamu · ${active} aktif`;
    }

    /* =========================================================================
       ADD / EDIT
       ========================================================================= */
    function openAddModal() {
        editingIndex = null;
        document.getElementById('guestModalTitle').textContent = 'Tambah Tamu Baru';
        document.getElementById('guestNameInput').value = '';
        document.getElementById('guestNameError').classList.add('hidden');
        document.getElementById('guestModal').classList.remove('hidden');
        setTimeout(() => document.getElementById('guestNameInput').focus(), 120);
    }

    function openEditModal(uuid) {
        editingIndex = uuid;
        const guest = guests.find(g => g.uuid === uuid);
        document.getElementById('guestModalTitle').textContent = 'Edit Nama Tamu';
        document.getElementById('guestNameInput').value = guest.displayName;
        document.getElementById('guestNameError').classList.add('hidden');
        document.getElementById('guestModal').classList.remove('hidden');
        setTimeout(() => {
            const inp = document.getElementById('guestNameInput');
            inp.focus();
            inp.select();
        }, 120);
    }

    function toTitleCase(str) {
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    async function saveGuest() {
        const name = toTitleCase(document.getElementById('guestNameInput').value.trim());
        const errEl = document.getElementById('guestNameError');
        if (!name) {
            errEl.classList.remove('hidden');
            document.getElementById('guestNameInput').focus();
            return;
        }
        errEl.classList.add('hidden');

        const btn = document.getElementById('saveGuestBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

        try {
            if (editingIndex === null) {
                // New guest
                await apiCall({ action: 'createGuest', displayName: name });
                showToast('✅ Tamu berhasil ditambahkan!');
            } else {
                // Edit existing
                await apiCall({ action: 'updateGuest', uuid: editingIndex, displayName: name });
                showToast('✅ Nama berhasil diperbarui!');
            }
            closeModal('guestModal');
            loadGuests();
        } catch (e) {
            showToast('❌ Gagal: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Simpan';
        }
    }

    /* =========================================================================
       STATUS (Soft Delete / Ban)
       ========================================================================= */
    async function toggleStatus(uuid) {
        const guest = guests.find(g => g.uuid === uuid);
        if (!guest) return;
        const newStatus = guest.status === 'active' ? 'inactive' : 'active';
        try {
            await apiCall({ action: 'updateGuest', uuid: uuid, status: newStatus });
            showToast(`🔄 Status diubah menjadi ${newStatus}`);
            loadGuests();
        } catch (e) {
            alert('Gagal update status: ' + e.message);
        }
    }

    async function deleteGuest(uuid, name) {
        if (!confirm(`Apakah Anda yakin ingin MENGHAPUS tamu "${name}" secara permanen? Data yang dihapus tidak dapat dikembalikan.`)) {
            return;
        }
        try {
            await apiCall({ action: 'deleteGuest', uuid: uuid });
            showToast('🗑️ Tamu berhasil dihapus permanen');
            loadGuests();
        } catch (e) {
            alert('Gagal menghapus tamu: ' + e.message);
        }
    }

    // ================== TAB & RSVP ==================
    function switchTab(tabId) {
        document.getElementById('guestsView').classList.add('hidden');
        document.getElementById('rsvpView').classList.add('hidden');
        document.getElementById('tabBtnGuests').className = 'font-bold text-gray-500 hover:text-gray-700 border-b-2 border-transparent pb-2 px-2 transition-colors';
        document.getElementById('tabBtnRsvp').className = 'font-bold text-gray-500 hover:text-gray-700 border-b-2 border-transparent pb-2 px-2 transition-colors';
        
        if (tabId === 'guests') {
            document.getElementById('guestsView').classList.remove('hidden');
            document.getElementById('guestsView').classList.add('space-y-4');
            document.getElementById('tabBtnGuests').className = 'font-bold text-red-700 border-b-2 border-red-700 pb-2 px-2 transition-colors';
        } else {
            document.getElementById('rsvpView').classList.remove('hidden');
            document.getElementById('tabBtnRsvp').className = 'font-bold text-red-700 border-b-2 border-red-700 pb-2 px-2 transition-colors';
            if (document.getElementById('rsvpTableBody').children.length === 0) {
                loadRSVP();
            }
        }
    }

    let rsvpChartInstance = null;
    async function loadRSVP() {
        document.getElementById('rsvpLoadingOverlay').classList.remove('hidden');
        document.getElementById('rsvpTableBody').innerHTML = '';
        try {
            const res = await apiCall({ action: 'getRSVP' });
            renderRSVP(res.data);
        } catch (e) {
            document.getElementById('rsvpTableBody').innerHTML = `<tr><td colspan="4" class="text-center text-red-500 py-4 text-sm font-bold">${e.message}</td></tr>`;
        } finally {
            document.getElementById('rsvpLoadingOverlay').classList.add('hidden');
        }
    }

    function renderRSVP(data) {
        const tbody = document.getElementById('rsvpTableBody');
        tbody.innerHTML = '';
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-4 text-center text-gray-500">Belum ada data RSVP.</td></tr>';
            return;
        }

        let totalResponds = 0;
        let totalAttendingHeads = 0;
        let totalNotAttending = 0;
        let hadirCount = 0;

        data.forEach(row => {
            totalResponds++;
            const isHadir = row.status === 'Hadir';
            if (isHadir) {
                hadirCount++;
                totalAttendingHeads += (parseInt(row.count) || 0);
            } else {
                totalNotAttending++;
            }

            const dateStr = new Date(row.timestamp).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit'});
            const badge = isHadir 
                ? '<span class="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md tracking-wider border border-green-200">Hadir</span>'
                : '<span class="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-md tracking-wider border border-red-200">Tidak Hadir</span>';

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-gray-400 text-xs font-mono">${dateStr}</td>
                    <td class="px-4 py-3 font-bold text-gray-800 text-sm">${escHtml(row.name)}</td>
                    <td class="px-4 py-3">${badge}</td>
                    <td class="px-4 py-3 text-center font-bold text-gray-700">${isHadir ? row.count : '-'}</td>
                </tr>`;
        });

        document.getElementById('rsvpTotalResponds').textContent = totalResponds;
        document.getElementById('rsvpTotalAttending').textContent = totalAttendingHeads;
        document.getElementById('rsvpTotalNotAttending').textContent = totalNotAttending;

        const ctx = document.getElementById('rsvpChart').getContext('2d');
        if (rsvpChartInstance) rsvpChartInstance.destroy();
        rsvpChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Hadir', 'Tidak Hadir'],
                datasets: [{
                    data: [hadirCount, totalNotAttending],
                    backgroundColor: ['#10B981', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    /* =========================================================================
       LINK MODAL & QR
       ========================================================================= */
    function openLinkModal(uuid) {
        linkGuest = guests.find(g => g.uuid === uuid);
        const url = BASE_URL + '/invite/' + linkGuest.token;

        document.getElementById('linkModalName').textContent = linkGuest.displayName;
        document.getElementById('linkModalUrl').textContent  = url;

        // Generate QR code
        const el = document.getElementById('qrcode');
        el.innerHTML = '';
        new QRCode(el, {
            text:         url,
            width:        176,
            height:       176,
            colorDark:    '#111827',
            colorLight:   '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });

        document.getElementById('linkModal').classList.remove('hidden');
    }

    function copyModalLink() {
        if (!linkGuest) return;
        copyToClipboard(BASE_URL + '/invite/' + linkGuest.token, '🔗 Tautan berhasil disalin!');
    }

    function copyModalWA() {
        if (!linkGuest) return;
        copyToClipboard(buildWAMessage(linkGuest), '💬 Pesan WhatsApp berhasil disalin!');
    }

    function copyWA(uuid) {
        const guest = guests.find(g => g.uuid === uuid);
        copyToClipboard(buildWAMessage(guest), '💬 Pesan WhatsApp disalin!');
    }

    /* =========================================================================
       WHATSAPP MESSAGE BUILDER
       ========================================================================= */
    function buildWAMessage(g) {
        const url = BASE_URL + '/invite/' + g.token;
        return (
            'Kepada Yth.\n'
            + 'Bapak/Ibu/Saudara/i\n'
            + g.displayName + '\n\n'
            + 'Salam sejahtera bagi kita semua.\n\n'
            + 'Dengan penuh rasa syukur kepada Tuhan Yang Maha Esa, kami mengundang '
            + 'Bapak/Ibu/Saudara/i ' + g.displayName + ' untuk hadir dan menjadi bagian '
            + 'dari sukacita dalam pemberkatan dan resepsi pernikahan kami.\n\n'
            + 'Berikut tautan undangan kami:\n\n'
            + url + '\n\n'
            + 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila '
            + 'Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa dan restu.\n\n'
            + 'Kiranya Tuhan senantiasa melimpahkan kesehatan, damai sejahtera dan penyertaan-Nya.\n\n'
            + 'Terima kasih.\n\n'
            + 'Hormat kami,\n\n'
            + 'Effrem & Eka\n'
            + 'beserta keluarga'
        );
    }

    /* =========================================================================
       UTILITIES
       ========================================================================= */
    function closeModal(id) {
        document.getElementById(id).classList.add('hidden');
    }

    function bgClose(e, id) {
        if (e.target === e.currentTarget) closeModal(id);
    }

    function copyToClipboard(text, msg) {
        const fallback = () => {
            const el = Object.assign(document.createElement('textarea'), {
                value: text,
                style: 'position:fixed;opacity:0'
            });
            document.body.appendChild(el);
            el.select();
            try { document.execCommand('copy'); } catch (_) {}
            document.body.removeChild(el);
            showToast(msg);
        };
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => showToast(msg)).catch(fallback);
        } else {
            fallback();
        }
    }

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    let _toastTimer = null;
    function showToast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(_toastTimer);
        _toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            ['guestModal','linkModal'].forEach(id => closeModal(id));
        }
    });
    