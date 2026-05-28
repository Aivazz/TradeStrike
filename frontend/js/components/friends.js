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
                            <label for="friend-search-input" class="modal-form-label">Kullanıcı adına göre ara</label>
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
        <div class="friend-card ${isOnline ? 'online' : 'offline'}" data-friend-id="${friend.id}" onclick="event.target.closest('.remove-friend-btn') ? null : openFriendInventoryModal(${friend.id}, '${name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
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
                results.innerHTML = '<p class="search-hint">Kimse bulunamadı</p>';
                return;
            }
            results.innerHTML = users.map(u => {
                const name = u.displayName || u.username;
                const initials = name.substring(0, 2).toUpperCase();
                const color = getAvatarColor(name);
                const statusColor = u.isOnline ? '#5cbf3f' : '#8c98a5';
                const statusText = u.isOnline ? 'Çevrimiçi' : 'Çevrimdışı';
                return `
                    <div class="search-result-row">
                        <div class="friend-avatar-wrapper" style="--avatar-bg:${color}; width:36px; height:36px;">
                            <div class="friend-avatar" style="font-size:12px;">${initials}</div>
                            <span class="status-indicator-dot" style="background:${statusColor};"></span>
                        </div>
                        <div class="friend-info">
                            <h4 class="friend-name" style="font-size:14px;">${name}</h4>
                            <p class="friend-status-text" style="color:${statusColor}; font-size:11px;">${statusText}</p>
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

window.openFriendInventoryModal = async function(friendId, friendName) {
    let modal = document.getElementById('friend-inventory-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'friend-inventory-modal';
        modal.className = 'modal-backdrop';
        modal.onclick = function(e) {
            if (e.target.id === 'friend-inventory-modal') {
                window.closeFriendInventoryModal();
            }
        };
        modal.innerHTML = `
            <div class="friend-inventory-modal-card" role="dialog" aria-modal="true">
                <button class="modal-close" onclick="window.closeFriendInventoryModal()" aria-label="Close"><i class="bi bi-x-lg"></i></button>
                <h2 id="friend-inventory-title"></h2>
                <div id="friend-inventory-modal-body">
                    <div class="state-panel">Envanter yükleniyor...</div>
                </div>
            </div>
            <style>
                .friend-inventory-modal-card {
                    position: relative;
                    width: min(840px, 95%);
                    max-height: 85vh;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 28px 24px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
                    animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                #friend-inventory-modal-body {
                    flex: 1;
                    overflow-y: auto;
                    margin-top: 16px;
                    padding-right: 4px;
                }
                #friend-inventory-modal-body::-webkit-scrollbar {
                    width: 6px;
                }
                #friend-inventory-modal-body::-webkit-scrollbar-track {
                    background: transparent;
                }
                #friend-inventory-modal-body::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 4px;
                }
                .friend-inventory-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
                    gap: 16px;
                }
                .friend-inventory-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 12px;
                    margin-bottom: 16px;
                }
                .friend-inventory-header span {
                    font-size: 13px;
                    color: var(--text-muted);
                }
                .friend-inventory-header strong {
                    color: var(--accent-green);
                    font-size: 16px;
                }
            </style>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('friend-inventory-title').textContent = `${friendName} Envanteri`;
    const body = document.getElementById('friend-inventory-modal-body');
    body.innerHTML = '<div class="state-panel">Envanter yükleniyor...</div>';
    
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    try {
        const response = await getInventory(friendId);
        
        let actualItems = [];
        if (response.data && Array.isArray(response.data.items)) {
            actualItems = response.data.items;
        } else if (response.data && response.data.items && Array.isArray(response.data.items.items)) {
            actualItems = response.data.items.items;
        } else if (Array.isArray(response.data)) {
            actualItems = response.data;
        }

        if (actualItems.length === 0) {
            body.innerHTML = `
                <div class="state-panel">
                    <i class="bi bi-box-seam" style="font-size: 32px; color: var(--text-muted); margin-bottom: 8px;"></i>
                    <span style="color: #ffffff; font-weight: 600;">Envanter boş</span>
                    <p style="margin: 0; font-size: 13px; color: var(--text-muted);">Bu kullanıcının envanterinde eşya bulunmuyor.</p>
                </div>
            `;
            return;
        }

        const totalItemsCount = actualItems.length;
        const estimatedValue = actualItems.reduce((sum, item) => sum + (item.estPrice || 0), 0);

        const cardsHTML = actualItems.map(item => {
            const nameParts = item.name.split('|');
            const weaponName = nameParts[0] ? nameParts[0].trim() : item.name;
            const skinName = nameParts[1] ? nameParts[1].trim() : '';
            const isStatTrak = weaponName.includes('StatTrak™') || weaponName.includes('StatTrak');
            const cleanWeaponName = weaponName.replace('StatTrak™', '').replace('StatTrak', '').trim();
            const condDetails = getConditionDetails(item.condition);
            const floatValue = Number(item.float) || 0;

            return `
                <article class="item-card inventory-card" style="--rarity-color: ${item.rarity || '#4b69ff'}; min-height: auto; margin-bottom: 0;">
                    <div class="item-image-wrapper">
                        <img src="${getImageUrl(item.imageUrl)}" alt="${item.name}">
                        ${isStatTrak ? '<span class="stattrak-badge">StatTrak™</span>' : ''}
                    </div>
                    <div class="item-body">
                        <div class="weapon-info">
                            <span class="weapon-type">${cleanWeaponName}</span>
                            <span class="weapon-skin">${skinName}</span>
                        </div>
                        <div class="condition-info">
                            <span class="cond-abbr">${condDetails.abbr}</span>
                            <span class="cond-ru">${condDetails.ru}</span>
                        </div>
                        <div class="wear-bar-container">
                            <div class="wear-bar">
                                <div class="wear-segment fn" style="width: 7%;"></div>
                                <div class="wear-segment mw" style="width: 8%;"></div>
                                <div class="wear-segment ft" style="width: 23%;"></div>
                                <div class="wear-segment ww" style="width: 7%;"></div>
                                <div class="wear-segment bs" style="width: 55%;"></div>
                                <div class="wear-marker" style="left: ${floatValue * 100}%;"></div>
                            </div>
                            <span class="wear-value">${floatValue.toFixed(4)}</span>
                        </div>
                    </div>
                    <div class="inventory-price-row" style="padding: 10px 0;">
                        <span>Tahmini Fiyat</span>
                        <strong>${item.estPrice.toFixed(2)} &#8378;</strong>
                    </div>
                </article>
            `;
        }).join('');

        body.innerHTML = `
            <div class="friend-inventory-header">
                <span>Eşya Sayısı: <strong>${totalItemsCount}</strong></span>
                <span>Envanter Değeri: <strong>${estimatedValue.toFixed(2)} ₺</strong></span>
            </div>
            <div class="friend-inventory-grid">
                ${cardsHTML}
            </div>
        `;
    } catch (error) {
        body.innerHTML = `
            <div class="state-panel error-state">${error.message}</div>
        `;
    }
};

window.closeFriendInventoryModal = function() {
    const modal = document.getElementById('friend-inventory-modal');
    if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
};

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        window.closeFriendInventoryModal();
    }
});

