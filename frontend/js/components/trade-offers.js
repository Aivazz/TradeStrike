let activeTradeTab = 'incoming';
let tradeCounts = { incoming: 0, sent: 0, history: 0 };
let selectedTradeUser = null; 
let selectedGiveItemsForTrade = [];
let selectedReceiveItemsForTrade = [];
let isGiftModeActive = false;
let currentCounterTradeId = null;

async function renderTradeOffers(tab = activeTradeTab) {
    activeTradeTab = tab;
    const root = document.getElementById('trade-offers-root');

    root.innerHTML = `
        <section class="trade-section">
            ${renderTradeHeader()}
            <div class="state-panel">Takas teklifleri yükleniyor...</div>
        </section>
    `;

    try {
        const response = await getTradeOffers(activeTradeTab);
        tradeCounts = response.data.counts;
        const offers = response.data.offers;
        const offersHTML = offers.map(offer => renderTradeCard(offer, activeTradeTab)).join('');
        const emptyHTML = `
            <div class="trade-empty">
                <i class="bi bi-arrow-left-right"></i>
                <strong>Burada takas teklifi yok</strong>
                <span>Yeni takas hareketleri bu sekmede görünecektir.</span>
            </div>
        `;

        root.innerHTML = `
            <section class="trade-section">
                ${renderTradeHeader()}
                <div class="trade-list">
                    ${offers.length ? offersHTML : emptyHTML}
                </div>
                ${renderTradeBuilderModal()}
            </section>
        `;
    } catch (error) {
        root.innerHTML = `
            <section class="trade-section">
                ${renderTradeHeader()}
                <div class="state-panel error-state">${error.message}</div>
            </section>
        `;
    }
}

function renderTradeHeader() {
    return `
        <div class="d-flex justify-content-between align-items-start mb-4">
            <div class="trade-tabs m-0" role="tablist" aria-label="Takas sekmeleri">
                ${renderTradeTab('incoming', 'Gelenler', tradeCounts.incoming)}
                ${renderTradeTab('sent', 'Gönderilenler', tradeCounts.sent)}
                ${renderTradeTab('history', 'Geçmiş', tradeCounts.history)}
            </div>
            <button class="btn-buy" style="height: 48px; padding: 0 24px;" onclick="openTradeBuilder()">
                <i class="bi bi-plus-lg me-2"></i> Yeni Takas
            </button>
        </div>
    `;
}

function renderTradeTab(id, label, count) {
    const isActive = activeTradeTab === id ? 'active' : '';
    return `
        <button class="trade-tab ${isActive}" onclick="renderTradeOffers('${id}')" role="tab" aria-selected="${activeTradeTab === id}">
            <span>${label}</span>
            <strong>${count}</strong>
        </button>
    `;
}

function renderTradeBuilderModal() {
    return `
        <div class="modal-backdrop" id="trade-builder-modal" aria-hidden="true" onclick="handleTradeBackdrop(event)">
            <div class="trade-builder-modal" id="trade-builder-content" role="dialog" aria-modal="true"></div>
        </div>
    `;
}

function extractItemsSafely(response) {
    if (response && response.data && Array.isArray(response.data.items)) return response.data.items;
    if (response && response.data && response.data.items && Array.isArray(response.data.items.items)) return response.data.items.items;
    if (response && Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
}

async function openTradeBuilder() {
    selectedTradeUser = null;
    selectedGiveItemsForTrade = [];
    selectedReceiveItemsForTrade = [];
    isGiftModeActive = false;
    
    const modal = document.getElementById('trade-builder-modal');
    document.getElementById('trade-builder-content').innerHTML = `<div class="p-4 text-center text-white">Takas ortakları yükleniyor...</div>`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    try {
        const response = await apiFriends();
        const friends = response.data || [];

        document.getElementById('trade-builder-content').innerHTML = `
            <button class="modal-close" onclick="closeTradeBuilder()"><i class="bi bi-x-lg"></i></button>
            <div class="trade-builder-header">
                <h2>Takas Ortağı Seç</h2>
                <p>Sadece arkadaş listenizdeki kullanıcılarla takas yapabilirsiniz.</p>
            </div>
            <div class="user-select-list">
                ${friends.length > 0 ? friends.map(user => {
                    const isOnline = user.status === 'online';
                    const name = user.displayName || user.username;
                    const initials = name.substring(0, 2).toUpperCase();
                    return `
                    <div class="user-select-item" id="user-opt-${user.id}" onclick="selectUserForTrade(${user.id}, '${name}')">
                        <div class="user-select-avatar">${initials}</div>
                        <div class="user-select-info">
                            <h4>${name}</h4>
                            <span style="color: ${isOnline ? '#5cbf3f' : 'var(--text-muted)'};">
                                <i class="bi bi-circle-fill" style="font-size:8px; margin-right:4px;"></i>${isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                            </span>
                        </div>
                    </div>`;
                }).join('') : `
                <div class="state-panel" style="min-height: 120px; border: 1px dashed var(--border-color);">
                    <i class="bi bi-people" style="font-size: 24px; color: var(--accent-blue); margin-bottom: 4px;"></i>
                    <span style="color:#ffffff; font-weight:600;">Takas yapacak arkadaş yok</span>
                    <span style="font-size:12px; color:var(--text-muted);">Takasa başlamak için Arkadaşlar sayfasından arkadaş ekleyin.</span>
                </div>`}
            </div>
            <div class="trade-gift-toggle d-flex align-items-center justify-content-between">
                <div>
                    <strong class="d-block text-white mb-1">Hediye Modu</strong>
                    <span class="text-muted small">Karşılığında hiçbir şey istemeden eşya gönderin.</span>
                </div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="giftModeCheck" style="transform: scale(1.3);">
                </div>
            </div>
            <div class="modal-actions border-top mt-4 pt-4" style="border-color: var(--border-soft) !important;">
                <button class="btn-inspect" onclick="closeTradeBuilder()">İptal</button>
                <button class="btn-buy btn-sell" id="btn-continue-trade" disabled onclick="goToGiveItems()">Eşyaları Seç</button>
            </div>
        `;
    } catch (error) {
        document.getElementById('trade-builder-content').innerHTML = `<div class="p-4 text-center text-danger">Hata: ${error.message}</div>`;
    }
}

function selectUserForTrade(userId, username) {
    selectedTradeUser = { id: userId, username };
    document.querySelectorAll('.user-select-item').forEach(el => el.classList.remove('selected'));
    document.getElementById(`user-opt-${userId}`).classList.add('selected');
    document.getElementById('btn-continue-trade').disabled = false;
}

async function goToGiveItems() {
    isGiftModeActive = document.getElementById('giftModeCheck') ? document.getElementById('giftModeCheck').checked : false;
    document.getElementById('trade-builder-content').innerHTML = `<div class="p-4 text-center text-white">Envanteriniz yükleniyor...</div>`;

    try {
        const response = await getInventory(); 
        const myItems = extractItemsSafely(response);
        
        document.getElementById('trade-builder-content').innerHTML = `
            <button class="modal-close" onclick="closeTradeBuilder()"><i class="bi bi-x-lg"></i></button>
            <div class="trade-builder-header">
                <h2>Ne vereceksiniz?</h2>
                <p>Teklif etmek için envanterinizden süsleri seçin.</p>
            </div>
            <div class="user-select-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-height: 350px;">
                ${myItems.length > 0 ? myItems.map(item => `
                    <div class="user-select-item" id="trade-give-${item.id}" onclick="toggleGiveItem(${item.id})" style="flex-direction: column; padding: 12px;">
                        <div class="trade-item-image" style="width: 100%; height: 80px; border-bottom: 2px solid ${item.rarity}; display:flex; justify-content:center; align-items:center; background:radial-gradient(circle at center, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%); border-radius:8px;">
                            <img src="${item.imageUrl}" style="max-height: 80%; max-width: 90%; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));">
                        </div>
                        <div class="user-select-info mt-2 text-center" style="width: 100%;">
                            <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">${item.name}</h4>
                        </div>
                    </div>
                `).join('') : '<div class="state-panel" style="grid-column: 1 / -1; min-height: 150px; border: 1px dashed var(--border-color);"><i class="bi bi-box-seam" style="font-size: 24px; color: var(--accent-blue); margin-bottom: 4px;"></i><span style="color:#ffffff; font-weight:600;">Envanteriniz boş</span><p style="font-size:12px; margin:0; color:var(--text-muted);">Önce pazaryerinden eşya satın alın.</p></div>'}
            </div>
            <div class="modal-actions border-top mt-4 pt-4" style="border-color: var(--border-soft) !important;">
                <button class="btn-inspect" onclick="openTradeBuilder()">Geri</button>
                <button class="btn-buy btn-sell" id="btn-next-step" disabled onclick="${isGiftModeActive ? 'finalizeTradeOffer()' : 'goToReceiveItems()'}">
                    ${isGiftModeActive ? 'Hediye Gönder' : 'Devam Et'}
                </button>
            </div>
        `;
    } catch (error) {
        alert('Hata: ' + error.message);
        closeTradeBuilder();
    }
}

async function openCounterOfferModal(tradeId) {
    currentCounterTradeId = tradeId;
    selectedGiveItemsForTrade = [];
    
    const modal = document.getElementById('trade-builder-modal');
    document.getElementById('trade-builder-content').innerHTML = `<div class="p-4 text-center text-white">Envanteriniz yükleniyor...</div>`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    try {
        const response = await getInventory(); 
        const myItems = extractItemsSafely(response);
        
        document.getElementById('trade-builder-content').innerHTML = `
            <button class="modal-close" onclick="closeTradeBuilder()"><i class="bi bi-x-lg"></i></button>
            <div class="trade-builder-header">
                <h2>Karşı Teklif</h2>
                <p>Bu takasa eklemek için envanterinizden süsler seçin.</p>
            </div>
            <div class="user-select-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-height: 350px;">
                ${myItems.length > 0 ? myItems.map(item => `
                    <div class="user-select-item" id="trade-give-${item.id}" onclick="toggleGiveItem(${item.id})" style="flex-direction: column; padding: 12px;">
                        <div class="trade-item-image" style="width: 100%; height: 80px; border-bottom: 2px solid ${item.rarity}; display:flex; justify-content:center; align-items:center; background:radial-gradient(circle at center, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%); border-radius:8px;">
                            <img src="${item.imageUrl}" style="max-height: 80%; max-width: 90%; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));">
                        </div>
                        <div class="user-select-info mt-2 text-center" style="width: 100%;">
                            <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">${item.name}</h4>
                        </div>
                    </div>
                `).join('') : '<div class="state-panel" style="grid-column: 1 / -1; min-height: 150px; border: 1px dashed var(--border-color);"><i class="bi bi-box-seam" style="font-size: 24px; color: var(--accent-blue); margin-bottom: 4px;"></i><span style="color:#ffffff; font-weight:600;">Envanteriniz boş</span><p style="font-size:12px; margin:0; color:var(--text-muted);">Önce pazaryerinden eşya satın alın.</p></div>'}
            </div>
            <div class="modal-actions border-top mt-4 pt-4" style="border-color: var(--border-soft) !important;">
                <button class="btn-inspect" onclick="closeTradeBuilder()">İptal</button>
                <button class="btn-buy btn-sell" id="btn-send-counter" disabled onclick="submitCounterOffer()">Karşı Teklif Gönder</button>
            </div>
        `;
    } catch (error) {
        alert('Hata: ' + error.message);
        closeTradeBuilder();
    }
}

function toggleGiveItem(id) {
    const el = document.getElementById(`trade-give-${id}`);
    const index = selectedGiveItemsForTrade.indexOf(id);
    if (index > -1) {
        selectedGiveItemsForTrade.splice(index, 1);
        el.classList.remove('selected');
    } else {
        selectedGiveItemsForTrade.push(id);
        el.classList.add('selected');
    }
    
    const btnNext = document.getElementById('btn-next-step');
    if (btnNext) btnNext.disabled = selectedGiveItemsForTrade.length === 0;

    const btnCounter = document.getElementById('btn-send-counter');
    if (btnCounter) btnCounter.disabled = selectedGiveItemsForTrade.length === 0;
}

async function submitCounterOffer() {
    const btn = document.getElementById('btn-send-counter');
    btn.disabled = true;
    btn.textContent = 'Gönderiliyor...';

    try {
        const response = await apiRequest(`/trades/${currentCounterTradeId}/counter`, {
            method: 'POST',
            body: JSON.stringify({ itemIds: selectedGiveItemsForTrade })
        });
        alert('Karşı teklif başarıyla gönderildi!');
        closeTradeBuilder();
        await renderTradeOffers('sent');
    } catch (error) {
        alert(error.message);
        btn.disabled = false;
        btn.textContent = 'Karşı Teklif Gönder';
    }
}

async function goToReceiveItems() {
    document.getElementById('trade-builder-content').innerHTML = `<div class="p-4 text-center text-white">${selectedTradeUser.username} envanteri yükleniyor...</div>`;

    try {
        const response = await apiRequest(`/inventory?userId=${selectedTradeUser.id}`); 
        const theirItems = extractItemsSafely(response);
        
        document.getElementById('trade-builder-content').innerHTML = `
            <button class="modal-close" onclick="closeTradeBuilder()"><i class="bi bi-x-lg"></i></button>
            <div class="trade-builder-header">
                <h2>Ne istiyorsunuz?</h2>
                <p><strong>${selectedTradeUser.username}</strong> kullanıcısının envanterinden istediğiniz süsleri seçin.</p>
            </div>
            <div class="user-select-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-height: 350px;">
                ${theirItems.length > 0 ? theirItems.map(item => `
                    <div class="user-select-item" id="trade-receive-${item.id}" onclick="toggleReceiveItem(${item.id})" style="flex-direction: column; padding: 12px;">
                        <div class="trade-item-image" style="width: 100%; height: 80px; border-bottom: 3px solid ${item.rarity}; display:flex; justify-content:center; align-items:center; background:#29384d; border-radius:8px;">
                            <img src="${item.imageUrl}" style="max-height: 80%; max-width: 90%;">
                        </div>
                        <div class="user-select-info mt-2 text-center" style="width: 100%;">
                            <h4 style="font-size: 14px;">${item.name}</h4>
                        </div>
                    </div>
                `).join('') : '<div class="text-muted p-3">Kullanıcının hiç eşyası yok.</div>'}
            </div>
            <div class="modal-actions border-top mt-4 pt-4" style="border-color: var(--border-soft) !important;">
                <button class="btn-inspect" onclick="goToGiveItems()">Geri</button>
                <button class="btn-buy btn-sell" id="btn-send-final" disabled onclick="finalizeTradeOffer()">Teklif Gönder</button>
            </div>
        `;
    } catch (error) {
        alert('Hedef envanter yüklenirken hata oluştu: ' + error.message);
    }
}

function toggleReceiveItem(id) {
    const el = document.getElementById(`trade-receive-${id}`);
    const index = selectedReceiveItemsForTrade.indexOf(id);
    if (index > -1) {
        selectedReceiveItemsForTrade.splice(index, 1);
        el.classList.remove('selected');
    } else {
        selectedReceiveItemsForTrade.push(id);
        el.classList.add('selected');
    }
    document.getElementById('btn-send-final').disabled = selectedReceiveItemsForTrade.length === 0;
}

async function finalizeTradeOffer() {
    const btn = document.getElementById('btn-next-step') || document.getElementById('btn-send-final');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Gönderiliyor...';
    }

    try {
        await apiRequest('/trades/create', {
            method: 'POST',
            body: JSON.stringify({
                recipientId: selectedTradeUser.id,
                isGift: isGiftModeActive,
                giveItemIds: selectedGiveItemsForTrade,
                receiveItemIds: selectedReceiveItemsForTrade
            })
        });
        
        closeTradeBuilder();
        await renderTradeOffers('sent');
        alert('Takas teklifi başarıyla gönderildi!');
    } catch (error) {
        alert(error.message);
        if (btn) btn.disabled = false;
    }
}

function closeTradeBuilder() {
    const modal = document.getElementById('trade-builder-modal');
    if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function handleTradeBackdrop(event) {
    if (event.target.id === 'trade-builder-modal') closeTradeBuilder();
}

function renderTradeCard(offer, tab) {
    let addBtnHTML = '';
    if (tab === 'incoming') {
        addBtnHTML = `
            <div class="trade-item" onclick="openCounterOfferModal(${offer.id})" style="border: 2px dashed #32425d; background: rgba(255,255,255,0.02); cursor: pointer; display: flex; justify-content: center; align-items: center; min-height: 80px; border-radius: 8px;">
                <div style="text-align: center; color: var(--accent-blue);">
                    <i class="bi bi-plus-circle" style="font-size: 24px; display: block; margin-bottom: 4px;"></i>
                    <strong style="font-size: 13px;">Eşya Ekle</strong>
                </div>
            </div>
        `;
    }

    return `
        <article class="trade-card">
            <div class="trade-card-header">
                <div>
                    <span class="trade-label">${tab === 'sent' ? 'Gönderilen' : 'Gelen Teklif'}</span>
                    <h2>${offer.trader}</h2>
                </div>
                <div class="trade-meta">
                    <span class="trade-status ${offer.status.toLowerCase()}">${translateStatus(offer.status)}</span>
                    <span>${offer.time}</span>
                </div>
            </div>

            <div class="trade-body">
                <div class="trade-side give">
                    <div class="trade-side-title">
                        <span>Verdikleriniz</span>
                    </div>
                    <div class="trade-items" style="display: flex; flex-direction: column; gap: 8px;">
                        ${offer.give.map(renderMiniTradeItem).join('')}
                        ${addBtnHTML}
                    </div>
                </div>

                <div class="trade-swap-icon"><i class="bi bi-arrow-left-right"></i></div>

                <div class="trade-side receive">
                    <div class="trade-side-title">
                        <span>Aldıklarınız</span>
                    </div>
                    <div class="trade-items">
                        ${offer.receive.map(renderMiniTradeItem).join('')}
                    </div>
                </div>
            </div>

            <div class="trade-footer">
                <div class="trade-actions">
                    ${renderTradeActions(offer, tab)}
                </div>
            </div>
        </article>
    `;
}

function translateStatus(status) {
    if (status === 'Pending') return 'Beklemede';
    if (status === 'Accepted') return 'Kabul Edildi';
    if (status === 'Declined') return 'Reddedildi';
    if (status === 'Cancelled') return 'İptal Edildi';
    return status;
}

function renderMiniTradeItem(item) {
    return `
        <div class="trade-item" style="border-left-color: ${item.rarity};">
            <div class="trade-item-image">
                <span>${item.name.split(' ')[0]}</span>
            </div>
            <div>
                <h3>${item.name}</h3>
                <p>${item.condition}</p>
            </div>
        </div>
    `;
}

function renderTradeActions(offer, tab) {
    if (tab === 'incoming') {
        return `
            <button class="trade-action accept" onclick="acceptTrade(${offer.id}, this)">Kabul Et</button>
            <button class="trade-action decline" onclick="declineTrade(${offer.id}, this)">Reddet</button>
        `;
    }

    if (tab === 'sent') {
        return `
            <button class="trade-action decline" onclick="cancelTrade(${offer.id}, this)">Teklifi İptal Et</button>
        `;
    }

    return `<button class="trade-action counter" onclick="inspectTrade(${offer.id})">Detayları Görüntüle</button>`;
}

async function acceptTrade(id, button) { await executeTradeAction(id, 'accept', button); }
async function declineTrade(id, button) { await executeTradeAction(id, 'decline', button); }
async function cancelTrade(id, button) { await executeTradeAction(id, 'cancel', button); }

async function executeTradeAction(id, action, button) {
    const previousText = button?.textContent;
    if (button) { button.disabled = true; button.textContent = 'İşleniyor...'; }

    try {
        const response = await runTradeAction(id, action);
        alert(action === 'accept' ? 'Takas kabul edildi!' : (action === 'decline' ? 'Takas reddedildi!' : 'Takas iptal edildi!'));
        await renderTradeOffers(activeTradeTab);
    } catch (error) {
        alert(error.message);
        if (button) { button.disabled = false; button.textContent = previousText; }
    }
}

async function inspectTrade(id) {
    try {
        const response = await getTradeOffer(id);
        const trade = response.data;
        alert(`Takas #${trade.id}\nDurum: ${translateStatus(trade.status)}`);
    } catch (error) {
        alert(error.message);
    }
}