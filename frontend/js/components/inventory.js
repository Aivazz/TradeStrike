let inventoryItems = [];

async function renderInventory() {
    const root = document.getElementById('inventory-root');
    root.innerHTML = `
        <section class="inventory-section">
            <div class="state-panel">Envanter yükleniyor...</div>
        </section>
    `;

    try {
        const response = await getInventory();
        
        let actualItems = [];
        if (response.data && Array.isArray(response.data.items)) {
            actualItems = response.data.items;
        } else if (response.data && response.data.items && Array.isArray(response.data.items.items)) {
            actualItems = response.data.items.items;
        } else if (Array.isArray(response.data)) {
            actualItems = response.data;
        }

        inventoryItems = actualItems;
        displayInventory();
    } catch (error) {
        root.innerHTML = `
            <section class="inventory-section">
                <div class="state-panel error-state">${error.message}</div>
            </section>
        `;
    }
}

function displayInventory() {
    const root = document.getElementById('inventory-root');
    if (!root || root.style.display === 'none') return;

    let items = [...inventoryItems];

    // Применяем фильтр по поиску
    if (window.currentFilters && window.currentFilters.searchQuery) {
        const q = window.currentFilters.searchQuery.toLowerCase();
        items = items.filter(item => 
            item.name.toLowerCase().includes(q) || 
            (item.condition && item.condition.toLowerCase().includes(q))
        );
    }

    // Применяем фильтр по категориям оружия
    if (window.currentFilters && window.currentFilters.selectedCategories && window.currentFilters.selectedCategories.length > 0) {
        items = items.filter(item => {
            const cat = typeof window.getWeaponCategory === 'function' ? window.getWeaponCategory(item.name) : 'other';
            return window.currentFilters.selectedCategories.includes(cat);
        });
    }

    // Применяем фильтр по конкретному оружию (например, "AWP")
    if (window.currentFilters && window.currentFilters.selectedWeapons && window.currentFilters.selectedWeapons.length > 0) {
        items = items.filter(item => {
            const nameLower = item.name.toLowerCase();
            return window.currentFilters.selectedWeapons.some(w => {
                const wLower = w.toLowerCase();
                if (wLower === 'bayonet') {
                    return nameLower.includes('bayonet') && !nameLower.includes('m9');
                }
                return nameLower.includes(wLower);
            });
        });
    }

    // Применяем фильтр по качеству/состоянию (Condition)
    if (window.currentFilters && window.currentFilters.conditions && window.currentFilters.conditions.length > 0) {
        items = items.filter(item => window.currentFilters.conditions.includes(item.condition));
    }

    // Применяем фильтр по редкости (Rarity)
    if (window.currentFilters && window.currentFilters.rarities && window.currentFilters.rarities.length > 0) {
        items = items.filter(item => window.currentFilters.rarities.includes(item.rarity));
    }

    // Применяем фильтр по цене (Мин. цена)
    if (window.currentFilters && window.currentFilters.minPrice !== '') {
        const min = Number(window.currentFilters.minPrice);
        if (!isNaN(min)) {
            items = items.filter(item => item.estPrice >= min);
        }
    }

    // Применяем фильтр по цене (Макс. цена)
    if (window.currentFilters && window.currentFilters.maxPrice !== '') {
        const max = Number(window.currentFilters.maxPrice);
        if (!isNaN(max)) {
            items = items.filter(item => item.estPrice <= max);
        }
    }

    // Сортировка по цене
    if (window.currentFilters && window.currentFilters.sortBy) {
        if (window.currentFilters.sortBy === 'price-asc') {
            items.sort((a, b) => a.estPrice - b.estPrice);
        } else if (window.currentFilters.sortBy === 'price-desc') {
            items.sort((a, b) => b.estPrice - a.estPrice);
        }
    }

    const totalItemsCount = items.length;
    const estimatedValue = items.reduce((sum, item) => sum + (item.estPrice || 0), 0);

    const cardsHTML = items.map(item => {
        const nameParts = item.name.split('|');
        const weaponName = nameParts[0] ? nameParts[0].trim() : item.name;
        const skinName = nameParts[1] ? nameParts[1].trim() : '';
        const isStatTrak = weaponName.includes('StatTrak™') || weaponName.includes('StatTrak');
        const cleanWeaponName = weaponName.replace('StatTrak™', '').replace('StatTrak', '').trim();
        const condDetails = getConditionDetails(item.condition);
        const floatValue = Number(item.float) || 0;

        return `
            <div class="market-col">
                <article class="item-card inventory-card" style="--rarity-color: ${item.rarity || '#4b69ff'};">
                    <div class="item-image-wrapper" style="cursor: pointer;" onclick="inspectInventoryItem(${item.id})">
                        <img src="${item.imageUrl}" alt="${item.name}">
                        ${isStatTrak ? '<span class="stattrak-badge">StatTrak™</span>' : ''}
                    </div>
                    <div class="item-body" style="cursor: pointer;" onclick="inspectInventoryItem(${item.id})">
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
                    <div class="inventory-price-row">
                        <span>Tahmini Fiyat</span>
                        <strong>${item.estPrice.toFixed(2)} &#8378;</strong>
                    </div>
                    <div class="inventory-actions">
                        <button class="btn-buy btn-sell" onclick="openSellModal(${item.id})">Sat</button>
                        <button class="btn-inspect" onclick="inspectInventoryItem(${item.id})">İncele</button>
                    </div>
                </article>
            </div>
        `;
    }).join('');

    const inventoryHTML = `
        <section class="inventory-section">
            <div class="overview-bar">
                <article class="overview-card">
                    <div class="overview-icon"><i class="bi bi-box-seam"></i></div>
                    <div>
                        <span>Toplam Eşya</span>
                        <strong>${totalItemsCount}</strong>
                    </div>
                </article>
                <article class="overview-card">
                    <div class="overview-icon value"><i class="bi bi-wallet2"></i></div>
                    <div>
                        <span>Tahmini Değer</span>
                        <strong>${estimatedValue.toFixed(2)} &#8378;</strong>
                    </div>
                </article>
            </div>

            <div class="section-heading items-heading">
                <h2>Envanter Listesi</h2>
                <span>${totalItemsCount} sahip olunan eşya</span>
            </div>

            <div class="market-grid inventory-grid">
                ${cardsHTML || `
                    <div class="state-panel">
                        <i class="bi bi-search" style="font-size: 28px; color: var(--accent-blue); margin-bottom: 4px;"></i>
                        <span style="color: #ffffff; font-size: 15px; font-weight: 600;">Eşya bulunamadı</span>
                        <p style="margin: 0; font-size: 13px; color: var(--text-muted);">Filtrelerinizi veya arama sorgunuzu ayarlamayı deneyin.</p>
                    </div>
                `}
            </div>

            <div class="modal-backdrop" id="sell-modal" aria-hidden="true" onclick="handleSellBackdrop(event)">
                <div class="sell-modal" role="dialog" aria-modal="true" aria-labelledby="sell-modal-title">
                    <button class="modal-close" onclick="closeSellModal()" aria-label="Close"><i class="bi bi-x-lg"></i></button>
                    <h2 id="sell-modal-title">Eşyayı Satışa Çıkar</h2>
                    <p id="sell-modal-item">İstediğiniz satış fiyatını seçin.</p>
                    <label for="sell-price">Satış Fiyatı</label>
                    <div class="price-input-wrap">
                        <input id="sell-price" type="number" min="0" step="0.01" placeholder="0.00">
                        <span>&#8378;</span>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-inspect" onclick="closeSellModal()">İptal</button>
                        <button class="btn-buy btn-sell" onclick="submitSellListing(this)">İlan Oluştur</button>
                    </div>
                </div>
            </div>
        </section>
    `;

    root.innerHTML = inventoryHTML;
}

function openSellModal(id) {
    const item = inventoryItems.find(entry => entry.id === id);
    if (!item) return;

    const modal = document.getElementById('sell-modal');
    const input = document.getElementById('sell-price');
    document.getElementById('sell-modal-item').textContent = `${item.name} - Piyasa ortalaması ${item.estPrice.toFixed(2)} ₺`;
    input.value = item.estPrice.toFixed(2);
    input.dataset.itemId = item.id;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    input.focus();
}

function closeSellModal() {
    const modal = document.getElementById('sell-modal');
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function handleSellBackdrop(event) {
    if (event.target.id === 'sell-modal') {
        closeSellModal();
    }
}

async function submitSellListing(button) {
    const input = document.getElementById('sell-price');
    const itemId = Number(input.dataset.itemId);
    const price = Number(input.value);

    if (!price || price <= 0) {
        alert('Geçerli bir satış fiyatı girin.');
        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = 'Oluşturuluyor...';
    }

    try {
        const response = await createInventoryListing(itemId, price);
        alert(`${response.data.name} ${response.data.price.toFixed(2)} ₺ fiyatıyla satışa çıkarıldı.`);
        closeSellModal();
        await renderInventory();
    } catch (error) {
        alert(error.message);
        if (button) {
            button.disabled = false;
            button.textContent = 'İlan Oluştur';
        }
    }
}

async function inspectInventoryItem(id) {
    const item = inventoryItems.find(entry => entry.id === id);
    if (item) {
        openInspectItem(item, 'inventory');
    } else {
        try {
            const response = await getInventoryItem(id);
            openInspectItem(response.data, 'inventory');
        } catch (error) {
            alert(error.message);
        }
    }
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeSellModal();
    }
});