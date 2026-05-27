// frontend/js/components/friends.js

// ─── Render main Friends page ──────────────────────────────────────────────

async function renderFriendsList() {
    const root = document.getElementById('friends-root');
    if (!root) return;

    root.innerHTML = `
        <div class="friends-container">
            <div class="friends-header">
                <div class="friends-title-group">
                    <h2>ARKADAŞLARINIZ <span id="friends-counter">— / —</span></h2>
                </div>
                <div class="friends-actions">
                    <button class="btn-friends-action manage-btn" id="manage-mode-btn" onclick="toggleFriendsManageMode()">
                        <i class="bi bi-sliders"></i> Listeyi Yönet
                    </button>
                    <button class="btn-friends-action add-btn" onclick="openAddFriendModal()">
                        <i class="bi bi-person-plus-fill"></i> Arkadaş Bul
                    </button>
                </div>
            </div>

            <div class="friends-search-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input type="text" id="friends-search" placeholder="Arkadaşlarını isme göre ara" oninput="handleFriendsSearch(this.value)">
            </div>

            <div class="friends-sections-wrapper" id="friends-sections">
                <div class="state-panel">
                    <i class="bi bi-arrow-repeat" style="font-size:24px; color:var(--accent-blue);"></i>
                    <span>Yükleniyor...</span>
                </div>
            </div>

            <!-- Remove Friend Confirmation Modal -->
            <div class="modal-backdrop" id="remove-friend-modal" aria-hidden="true">
                <div class="add-friend-modal-card" role="dialog" style="max-width:380px;">
                    <div class="remove-modal-icon">
                        <i class="bi bi-person-x-fill"></i>
                    </div>
                    <h2 class="add-modal-heading" style="text-align:center; margin-bottom:8px;">Arkadaştan Çıkar?</h2>
                    <p id="remove-modal-text" style="text-align:center; color:var(--text-muted); font-size:14px; margin-bottom:24px;"></p>
                    <div class="friends-modal-footer" style="justify-content:center; gap:12px;">
                        <button class="btn-friends-action manage-btn" style="margin:0;" onclick="closeRemoveFriendModal()">İptal</button>
                        <button class="btn-friends-action" id="remove-confirm-btn"
                            style="margin:0; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);"
                            onmouseover="this.style.background='#ef4444'; this.style.color='#fff';"
                            onmouseout="this.style.background='rgba(239,68,68,0.15)'; this.style.color='#ef4444';">
                            <i class="bi bi-person-x"></i> Sil
                        </button>
                    </div>
                </div>
            </div>

            <!-- Add Friend Modal -->
            <div class="modal-backdrop" id="add-friend-modal" aria-hidden="true" onclick="handleAddFriendBackdrop(event)">
                <div class="add-friend-modal-card" role="dialog" aria-modal="true" aria-labelledby="add-friend-title">
                    <button class="modal-close" onclick="closeAddFriendModal()"><i class="bi bi-x-lg"></i></button>
                    <h2 id="add-friend-title" class="add-modal-heading">Arkadaş Bul</h2>

                    <div class="friends-modal-body">
                        <div class="modal-form-group">
                            <label for="friend-search-input" class="modal-form-label">Kullanıcı adına göre ara (sadece çevrimiçi)</label>
                            <div class="friend-search-input-wrap">
                                <i class="bi bi-search"></i>
                                <input id="friend-search-input" type="text" class="modal-form-control" 
                                    placeholder="Kullanıcı adı girin..." autocomplete="off"
                                    oninput="debouncedFriendSearch(this.value)">
                            </div>
                        </div>

                        <div id="friend-search-results" class="friend-search-results">
                            <p class="search-hint">Kullanıcı adını yazmaya başlayın</p>
                        </div>
                    </div>

                    <div class="friends-modal-footer">
                        <button class="btn-friends-action manage-btn" style="margin:0;" onclick="closeAddFriendModal()">Kapat</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    await loadFriendsData();
}

// ─── Load real data from backend ──────────────────────────────────────────

async function loadFriendsData() {
    try {
        const [friendsRes, requestsRes] = await Promise.all([
            apiFriends(),
            apiFriendRequests()
        ]);

        const friends = friendsRes.data || [];
        const requests = requestsRes.data || [];

        renderFriendsGrid(friends, requests);
    } catch (err) {
        const sections = document.getElementById('friends-sections');
        if (sections) {
            sections.innerHTML = `<div class="state-panel error-state"><i class="bi bi-exclamation-triangle"></i><span>Hata: ${err.message}</span></div>`;
        }
    }
}

// ─── Render the friends grid HTML ─────────────────────────────────────────

const AVATAR_COLORS = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#0ea5e9','#6366f1','#d946ef'];

function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function renderFriendsGrid(friends, requests) {
    const sections = document.getElementById('friends-sections');
    const counter = document.getElementById('friends-counter');
    if (!sections) return;

    const onlineFriends = friends.filter(f => f.status === 'online');
    const offlineFriends = friends.filter(f => f.status === 'offline');

    if (counter) counter.textContent = `${onlineFriends.length} / ${friends.length}`;

    const requestsHtml = requests.length > 0 ? `
        <div class="friends-section">
            <h3 class="section-title requests-title">ARKADAŞLIK İSTEKLERİ (${requests.length})</h3>
            <div class="friends-grid" id="grid-requests">
                ${requests.map(r => renderRequestCard(r)).join('')}
            </div>
        </div>` : '';

    const onlineHtml = `
        <div class="friends-section">
            <h3 class="section-title online-title" id="online-title">ÇEVRİMİÇİ (${onlineFriends.length})</h3>
            <div class="friends-grid" id="grid-online">
                ${onlineFriends.length 
                    ? onlineFriends.map(f => renderFriendCard(f)).join('') 
                    : '<div class="no-friends-placeholder">Kimse çevrimiçi değil</div>'}
            </div>
        </div>`;

    const offlineHtml = `
        <div class="friends-section">
            <h3 class="section-title offline-title" id="offline-title">ÇEVRİMDIŞI (${offlineFriends.length})</h3>
            <div class="friends-grid" id="grid-offline">
                ${offlineFriends.length 
                    ? offlineFriends.map(f => renderFriendCard(f)).join('') 
                    : '<div class="no-friends-placeholder">Liste boş</div>'}
            </div>
        </div>`;

    sections.innerHTML = requestsHtml + onlineHtml + offlineHtml;
}

function renderFriendCard(friend) {
    const isOnline = friend.status === 'online';
    const name = friend.displayName || friend.username;
    const initials = name.substring(0, 2).toUpperCase();
    const color = getAvatarColor(name);

    return `
        <div class="friend-card ${isOnline ? 'online' : 'offline'}" data-friend-id="${friend.id}">
            <div class="friend-avatar-wrapper" style="--avatar-bg:${color};">
                <div class="friend-avatar">${initials}</div>
                <span class="status-indicator-dot"></span>
            </div>
            <div class="friend-info">
                <h4 class="friend-name">${name}</h4>
                <p class="friend-status-text">${isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</p>
            </div>
            <button class="remove-friend-btn" onclick="handleRemoveFriend(${friend.id}, '${name.replace(/'/g, "\\'")}')" title="Arkadaştan Çıkar">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>`;
}

function renderRequestCard(req) {
    const name = req.displayName || req.username;
    const initials = name.substring(0, 2).toUpperCase();
    const color = getAvatarColor(name);

    return `
        <div class="friend-card request-card" id="request-card-${req.friendshipId}">
            <div class="friend-avatar-wrapper" style="--avatar-bg:${color};">
                <div class="friend-avatar">${initials}</div>
            </div>
            <div class="friend-info">
                <h4 class="friend-name">${name}</h4>
                <p class="friend-status-text" style="color:var(--text-muted);">Sizinle arkadaş olmak istiyor</p>
            </div>
            <div class="request-actions">
                <button class="btn-request-action accept" onclick="handleAcceptRequest(${req.friendshipId})"><i class="bi bi-check-lg"></i></button>
                <button class="btn-request-action decline" onclick="handleDeclineRequest(${req.friendshipId})"><i class="bi bi-x-lg"></i></button>
            </div>
        </div>`;
}

// ─── Search filter ────────────────────────────────────────────────────────

function handleFriendsSearch(query) {
    const q = query.toLowerCase().trim();
    let onlineCount = 0, offlineCount = 0;

    document.querySelectorAll('.friend-card:not(.request-card)').forEach(card => {
        const name = card.querySelector('.friend-name').textContent.toLowerCase();
        const show = !q || name.includes(q);
        card.style.display = show ? 'flex' : 'none';
        if (show) {
            if (card.classList.contains('online')) onlineCount++;
            else offlineCount++;
        }
    });

    const ot = document.getElementById('online-title');
    const ft = document.getElementById('offline-title');
    if (ot) ot.textContent = `ÇEVRİMİÇİ (${onlineCount})`;
    if (ft) ft.textContent = `ÇEVRİMDIŞI (${offlineCount})`;
}

// ─── Manage mode ──────────────────────────────────────────────────────────

let manageModeActive = false;
function toggleFriendsManageMode() {
    manageModeActive = !manageModeActive;
    document.querySelector('.friends-container')?.classList.toggle('manage-mode-active', manageModeActive);
    const btn = document.getElementById('manage-mode-btn');
    if (btn) btn.innerHTML = manageModeActive
        ? '<i class="bi bi-check-lg"></i> Tamam'
        : '<i class="bi bi-sliders"></i> Listeyi Yönet';
}

// ─── Actions ──────────────────────────────────────────────────────────────

window.handleRemoveFriend = function(friendUserId, friendName) {
    const modal = document.getElementById('remove-friend-modal');
    const text = document.getElementById('remove-modal-text');
    const btn = document.getElementById('remove-confirm-btn');
    if (!modal) return;

    text.textContent = `«${friendName}» kullanıcısını arkadaşlarınızdan silmek istediğinizden emin misiniz?`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    // Set up confirm action
    btn.onclick = async function() {
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass"></i> Siliniyor...';
        try {
            await apiRemoveFriend(friendUserId);
            closeRemoveFriendModal();
            showToast(`${friendName} arkadaşlıktan çıkarıldı`, 'success');
            await loadFriendsData();
        } catch (err) {
            showToast('Hata: ' + err.message, 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-person-x"></i> Sil';
        }
    };
};

window.closeRemoveFriendModal = function() {
    const modal = document.getElementById('remove-friend-modal');
    if (modal) { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); }
};

window.handleAcceptRequest = async function(friendshipId) {
    try {
        await apiAcceptFriendRequest(friendshipId);
        showToast('Arkadaşlık isteği kabul edildi!', 'success');
        await loadFriendsData();
    } catch (err) {
        showToast('Hata: ' + err.message, 'error');
    }
};

window.handleDeclineRequest = async function(friendshipId) {
    try {
        await apiDeclineFriendRequest(friendshipId);
        showToast('Arkadaşlık isteği reddedildi', 'info');
        await loadFriendsData();
    } catch (err) {
        showToast('Hata: ' + err.message, 'error');
    }
};

// ─── Add Friend Modal ─────────────────────────────────────────────────────

window.openAddFriendModal = function() {
    const modal = document.getElementById('add-friend-modal');
    if (!modal) return;
    const input = document.getElementById('friend-search-input');
    if (input) input.value = '';
    const results = document.getElementById('friend-search-results');
    if (results) results.innerHTML = '<p class="search-hint">Kullanıcı adını yazmaya başlayın</p>';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    if (input) input.focus();
};

window.closeAddFriendModal = function() {
    const modal = document.getElementById('add-friend-modal');
    if (modal) { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); }
};

window.handleAddFriendBackdrop = function(e) {
    if (e.target.id === 'add-friend-modal') closeAddFriendModal();
};

// Debounced search inside the modal
let _searchTimer = null;
window.debouncedFriendSearch = function(query) {
    clearTimeout(_searchTimer);
    const results = document.getElementById('friend-search-results');
    if (!query.trim()) {
        results.innerHTML = '<p class="search-hint">Kullanıcı adını yazmaya başlayın</p>';
        return;
    }
    results.innerHTML = '<p class="search-hint">Aranıyor...</p>';
    _searchTimer = setTimeout(async () => {
        try {
            const res = await apiFriendsSearch(query);
            const users = res.data || [];
            if (users.length === 0) {
                results.innerHTML = '<p class="search-hint">Kimse bulunamadı (sadece çevrimiçi kullanıcılar)</p>';
                return;
            }
            results.innerHTML = users.map(u => {
                const name = u.displayName || u.username;
                const initials = name.substring(0, 2).toUpperCase();
                const color = getAvatarColor(name);
                return `
                    <div class="search-result-row">
                        <div class="friend-avatar-wrapper" style="--avatar-bg:${color}; width:36px; height:36px;">
                            <div class="friend-avatar" style="font-size:12px;">${initials}</div>
                            <span class="status-indicator-dot" style="background:#5cbf3f;"></span>
                        </div>
                        <div class="friend-info">
                            <h4 class="friend-name" style="font-size:14px;">${name}</h4>
                            <p class="friend-status-text" style="color:#5cbf3f; font-size:11px;">Çevrimiçi</p>
                        </div>
                        <button class="btn-friends-action add-btn" style="padding:0 12px; height:30px; font-size:12px; margin:0;"
                            onclick="handleSendRequest(${u.id}, this)">
                            <i class="bi bi-person-plus"></i> Ekle
                        </button>
                    </div>`;
            }).join('');
        } catch (err) {
            results.innerHTML = `<p class="search-hint" style="color:#ef4444;">${err.message}</p>`;
        }
    }, 350);
};

window.handleSendRequest = async function(targetUserId, btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-clock"></i> Gönderildi';
    try {
        const res = await apiSendFriendRequest(targetUserId);
        showToast('Arkadaşlık isteği gönderildi!', 'success');
    } catch (err) {
        showToast('Hata: ' + err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-person-plus"></i> Ekle';
    }
};
