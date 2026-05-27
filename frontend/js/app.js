document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});

function renderMarketplaceView() {
    if (typeof closeSellModal === 'function') {
        closeSellModal();
    }

    setActiveNav('marketplace');
    renderTopbar('Pazaryeri');
    document.getElementById('trending-root').style.display = '';
    document.getElementById('market-root').style.display = '';
    document.getElementById('inventory-root').style.display = 'none';
    document.getElementById('trade-offers-root').style.display = 'none';
    document.getElementById('settings-root').style.display = 'none';
    document.getElementById('favorites-root').style.display = 'none';
    document.getElementById('friends-root').style.display = 'none';
    renderTrending();
    renderMarket();
}

function renderInventoryView() {
    setActiveNav('inventory');
    renderTopbar('Envanterim');
    document.getElementById('trending-root').style.display = 'none';
    document.getElementById('market-root').style.display = 'none';
    document.getElementById('inventory-root').style.display = '';
    document.getElementById('trade-offers-root').style.display = 'none';
    document.getElementById('settings-root').style.display = 'none';
    document.getElementById('favorites-root').style.display = 'none';
    document.getElementById('friends-root').style.display = 'none';
    renderInventory();
}

function renderTradeOffersView() {
    if (typeof closeSellModal === 'function') {
        closeSellModal();
    }

    setActiveNav('trade-offers');
    renderTopbar('Takas Teklifleri');
    document.getElementById('trending-root').style.display = 'none';
    document.getElementById('market-root').style.display = 'none';
    document.getElementById('inventory-root').style.display = 'none';
    document.getElementById('trade-offers-root').style.display = '';
    document.getElementById('settings-root').style.display = 'none';
    document.getElementById('favorites-root').style.display = 'none';
    document.getElementById('friends-root').style.display = 'none';
    renderTradeOffers();
}

function renderSettingsView() {
    if (typeof closeSellModal === 'function') {
        closeSellModal();
    }

    setActiveNav('settings');
    renderTopbar('Ayarlar');
    document.getElementById('trending-root').style.display = 'none';
    document.getElementById('market-root').style.display = 'none';
    document.getElementById('inventory-root').style.display = 'none';
    document.getElementById('trade-offers-root').style.display = 'none';
    document.getElementById('settings-root').style.display = '';
    document.getElementById('favorites-root').style.display = 'none';
    document.getElementById('friends-root').style.display = 'none';
    renderSettings();
}

function renderFavoritesView() {
    if (typeof closeSellModal === 'function') {
        closeSellModal();
    }

    setActiveNav('favorites');
    renderTopbar('Favoriler');
    document.getElementById('trending-root').style.display = 'none';
    document.getElementById('market-root').style.display = 'none';
    document.getElementById('inventory-root').style.display = 'none';
    document.getElementById('trade-offers-root').style.display = 'none';
    document.getElementById('settings-root').style.display = 'none';
    document.getElementById('favorites-root').style.display = '';
    document.getElementById('friends-root').style.display = 'none';
    renderFavoritesList();
}

function renderFriendsView() {
    if (typeof closeSellModal === 'function') {
        closeSellModal();
    }

    setActiveNav('friends');
    renderTopbar('Arkadaşlar');
    document.getElementById('trending-root').style.display = 'none';
    document.getElementById('market-root').style.display = 'none';
    document.getElementById('inventory-root').style.display = 'none';
    document.getElementById('trade-offers-root').style.display = 'none';
    document.getElementById('settings-root').style.display = 'none';
    document.getElementById('favorites-root').style.display = 'none';
    document.getElementById('friends-root').style.display = '';
    if (typeof renderFriendsList === 'function') {
        renderFriendsList();
    }
}

window.renderFavoritesList = async function() {
    const root = document.getElementById('favorites-root');
    if (!root) return;

    let favorites = [];
    try {
        const response = await getFavorites();
        favorites = response.data || [];
        window.favoriteItems = favorites;
        window.favoriteItemIds = favorites.map(item => item.id);
    } catch (error) {
        console.error("Failed to load favorites list:", error);
    }

    if (favorites.length === 0) {
        root.innerHTML = `
            <section class="market-section">
                <div class="section-heading items-heading">
                    <h2>Favoriler</h2>
                    <span>0 eşya</span>
                </div>
                <div class="state-panel">
                    <i class="bi bi-heart" style="font-size: 28px; color: var(--accent-blue); margin-bottom: 4px;"></i>
                    <span style="color: #ffffff; font-size: 15px; font-weight: 600;">Favori eşya bulunamadı</span>
                    <p style="margin: 0; font-size: 13px; color: var(--text-muted);">Favorilerinize pazaryerinden eşya ekleyerek burada görebilirsiniz.</p>
                </div>
            </section>
        `;
        return;
    }

    const cardsHTML = favorites.map(item => {
        const nameParts = item.name.split('|');
        const weaponName = nameParts[0] ? nameParts[0].trim() : item.name;
        const skinName = nameParts[1] ? nameParts[1].trim() : '';
        const isStatTrak = weaponName.includes('StatTrak™') || weaponName.includes('StatTrak');
        const cleanWeaponName = weaponName.replace('StatTrak™', '').replace('StatTrak', '').trim();
        const condDetails = getConditionDetails(item.condition);
        const floatValue = Number(item.float) || 0;

        return `
            <div class="market-col">
                <article class="item-card" style="--rarity-color: ${item.rarity || '#4b69ff'};">
                    <div class="item-image-wrapper" style="cursor: pointer;" onclick="openMarketInspect(${item.id})">
                        <img src="${item.imageUrl}" alt="${item.name}" onerror="handleInspectImageError(this, 'market', ${item.id})">
                        ${isStatTrak ? '<span class="stattrak-badge">StatTrak™</span>' : ''}
                    </div>
                    <div class="item-body" style="cursor: pointer;" onclick="openMarketInspect(${item.id})">
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
                    <div class="item-footer">
                        <div class="price-text">${item.price.toFixed(2)} &#8378;</div>
                        <button class="btn-buy" onclick="handleBuy(${item.id}, this)">Satın Al</button>
                    </div>
                </article>
            </div>
        `;
    }).join('');

    root.innerHTML = `
        <section class="market-section">
            <div class="section-heading items-heading">
                <h2>Favoriler</h2>
                <span>${favorites.length} eşya</span>
            </div>
            <div class="market-grid">
                ${cardsHTML}
            </div>
        </section>
    `;
};

function setActiveNav(view) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });
}

// Global Item Inspection Modal
window.openInspectItem = function(item, type = 'market') {
    const modal = document.getElementById('inspect-item-modal');
    const content = document.getElementById('inspect-modal-content');
    if (!modal || !content) return;

    let rarityLabel = 'Tüketici Sınıfı';
    const rarityColor = item.rarity || '#4b69ff';
    if (rarityColor === '#e4ae39') rarityLabel = 'Olağanüstü Nadir';
    else if (rarityColor === '#eb4b4b') rarityLabel = 'Çok Gizli';
    else if (rarityColor === '#d32ce6') rarityLabel = 'Gizli';
    else if (rarityColor === '#8847ff') rarityLabel = 'Sınırlı';
    else if (rarityColor === '#4b69ff') rarityLabel = 'Askeri Sınıf';

    const itemPrice = item.price || item.estPrice || 0;
    const recommendedPrice = item.estPrice || itemPrice;
    
    let discountPercent = 0;
    if (type === 'market' && recommendedPrice > itemPrice) {
        discountPercent = Math.round((1 - (itemPrice / recommendedPrice)) * 100);
    }

    const isStatTrak = item.name.includes('StatTrak');
    let cleanName = item.name;
    let statTrakPrefix = '';
    if (isStatTrak) {
        statTrakPrefix = `<span class="inspect-rarity-badge" style="color: #cf5aff; margin-right: 6px;">StatTrak™</span>`;
        cleanName = item.name.replace('StatTrak™', '').replace('StatTrak', '').trim();
    }

    let buttonHTML = '';
    if (type === 'market') {
        buttonHTML = `<button class="btn-inspect-action" onclick="handleInspectBuy(${item.id})"><i class="bi bi-cart-plus-fill"></i> Satın Al</button>`;
    } else {
        buttonHTML = `<button class="btn-inspect-action" onclick="handleInspectSell(${item.id})"><i class="bi bi-tag-fill"></i> Satışa Çıkar</button>`;
    }

    const isLiked = window.favoriteItemIds && window.favoriteItemIds.includes(item.id);

    const heartButtonHTML = type === 'market' ? `
        <button class="inspect-heart-btn ${isLiked ? 'liked' : ''}" onclick="toggleInspectLike(this, ${item.id})">
            <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
    ` : '';

    content.innerHTML = `
        <button class="modal-close" onclick="closeInspectItem()"><i class="bi bi-x-lg"></i></button>
        <div class="inspect-header">
            <div class="inspect-title-wrap">
                ${statTrakPrefix}
                <h2 class="inspect-item-name">${cleanName}</h2>
                <button class="inspect-copy-btn" onclick="copyInspectItemName('${item.name.replace(/'/g, "\\'")}')" title="İsmi Kopyala">
                    <i class="bi bi-copy"></i>
                </button>
            </div>
        </div>
        <div class="inspect-body">
            <div class="inspect-image-container">
                <img class="inspect-main-image" src="${item.imageUrl}" alt="${item.name}" onerror="handleInspectImageError(this, '${type}', ${item.id})">
                ${heartButtonHTML}
            </div>
            <div class="inspect-details">
                <div class="inspect-detail-card">
                    <div class="inspect-float-header">
                        <span>Float</span>
                        <span>${item.float || '0.000000'}</span>
                    </div>
                    <div class="inspect-float-slider-container">
                        <div class="inspect-float-track"></div>
                        <div class="inspect-float-marker" style="left: ${(item.float || 0) * 100}%"></div>
                    </div>
                    <div class="inspect-attrs">
                        <div class="inspect-attr-row">
                            <span>Nadirik</span>
                            <span style="color: ${rarityColor}">${rarityLabel}</span>
                        </div>
                        <div class="inspect-attr-row">
                            <span>Desen</span>
                            <span>${item.pattern || Math.floor(Math.random() * 900) + 100}</span>
                        </div>
                    </div>
                </div>

                <div class="inspect-prices">
                    <div class="inspect-price-group">
                        <span class="inspect-price-label">Önerilen Fiyat</span>
                        <div class="inspect-price-value recommended">₺ ${recommendedPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <span class="inspect-price-subtext">CS.MONEY fiyatlarına dayalı önerilen fiyat</span>
                    </div>

                    <div class="inspect-price-group">
                        <span class="inspect-price-label">Güncel Fiyat</span>
                        <div class="inspect-current-price-row">
                            <div class="inspect-price-value current">₺ ${itemPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            ${discountPercent > 0 ? `<div class="inspect-discount-badge">-${discountPercent}%</div>` : ''}
                        </div>
                    </div>
                </div>

                <div style="margin-top: 10px;">
                    ${buttonHTML}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
};

window.closeInspectItem = function() {
    const modal = document.getElementById('inspect-item-modal');
    if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
};

window.handleInspectBackdrop = function(event) {
    if (event.target.id === 'inspect-item-modal') {
        closeInspectItem();
    }
};

window.toggleInspectLike = async function(btn, id) {
    const isLiked = btn.classList.contains('liked');
    try {
        if (isLiked) {
            await deleteFavorite(id);
            btn.classList.remove('liked');
            btn.querySelector('i').className = 'bi bi-heart';
            showToast('Eşya favorilerden kaldırıldı', 'success');
        } else {
            await addFavorite(id);
            btn.classList.add('liked');
            btn.querySelector('i').className = 'bi bi-heart-fill';
            showToast('Eşya favorilere eklendi', 'success');
        }
        await renderSidebar();
        
        // If favorites view is active, re-render the favorites list
        const favRoot = document.getElementById('favorites-root');
        if (favRoot && favRoot.style.display !== 'none') {
            renderFavoritesList();
        }
    } catch (error) {
        showToast('Favoriler güncellenemedi', 'error');
    }
};

window.removeFavorite = async function(id) {
    try {
        await deleteFavorite(id);
        
        // Update inspect modal heart if open for this item
        const inspectModal = document.getElementById('inspect-item-modal');
        if (inspectModal && inspectModal.classList.contains('is-open')) {
            const heartBtn = inspectModal.querySelector('.inspect-heart-btn');
            if (heartBtn) {
                heartBtn.classList.remove('liked');
                const heartIcon = heartBtn.querySelector('i');
                if (heartIcon) heartIcon.className = 'bi bi-heart';
            }
        }
        
        await renderSidebar();
        
        // If favorites view is active, re-render the favorites list
        const favRoot = document.getElementById('favorites-root');
        if (favRoot && favRoot.style.display !== 'none') {
            renderFavoritesList();
        }
    } catch (error) {
        showToast('Favorilerden kaldırılamadı', 'error');
    }
};

window.copyInspectItemName = function(name) {
    navigator.clipboard.writeText(name).then(() => {
        showToast('İsim panoya kopyalandı', 'success');
    }).catch(() => {
        showToast('İsim kopyalanamadı', 'error');
    });
};

window.handleInspectBuy = async function(id) {
    closeInspectItem();
    const btn = document.querySelector(`button[onclick*="handleBuy(${id}"]`);
    await handleBuy(id, btn);
};

window.handleInspectSell = function(id) {
    closeInspectItem();
    openSellModal(id);
};

window.handleInspectImageError = function(img, type = 'market', id = null) {
    const container = img.parentElement;
    if (container) {
        let heartHTML = '';
        if (type === 'market' && id !== null) {
            const isLiked = window.favoriteItemIds && window.favoriteItemIds.includes(id);
            heartHTML = `
                <button class="inspect-heart-btn ${isLiked ? 'liked' : ''}" onclick="toggleInspectLike(this, ${id})">
                    <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
            `;
        }
        container.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(255, 255, 255, 0.12); width: 70%; height: 70%;">
                <path d="M 5,20 L 25,20 L 30,16 L 70,16 L 75,20 L 95,20 L 95,22 L 80,22 L 75,25 L 60,25 L 58,22 L 25,22 L 20,28 L 15,28 Z" fill="rgba(255,255,255,0.01)" stroke="currentColor" stroke-width="1"/>
                <path d="M 35,22 L 33,26 L 38,26 L 39,22" stroke="currentColor" stroke-width="1.2"/>
                <rect x="42" y="12" width="18" height="4" rx="1" fill="rgba(255,255,255,0.02)" stroke="currentColor" stroke-width="0.8"/>
            </svg>
            ${heartHTML}
        `;
    }
};

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeInspectItem();
    }
});
