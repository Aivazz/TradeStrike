let marketItems = [];

async function renderMarket() {
    const root = document.getElementById('market-root');
    root.innerHTML = `
        <section class="market-section">
            <div class="section-heading items-heading">
                <h2>Satılık Eşyalar</h2>
                <span>Yükleniyor...</span>
            </div>
            <div class="state-panel">Pazaryeri eşyaları yükleniyor...</div>
        </section>
    `;

    try {
        const response = await getMarketplaceItems();
        marketItems = response.data;
        window.marketItems = marketItems;
        displayMarket();
        if (typeof renderSidebar === 'function') renderSidebar();
    } catch (error) {
        root.innerHTML = `
            <section class="market-section">
                <div class="section-heading items-heading">
                    <h2>Satılık Eşyalar</h2>
                    <span>Kullanılamıyor</span>
                </div>
                <div class="state-panel error-state">${error.message}</div>
            </section>
        `;
    }
}

function displayMarket() {
    const root = document.getElementById('market-root');
    if (!root || root.style.display === 'none') return;

    let items = [...marketItems];

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
        items = items.filter(item => window.matchesSelectedWeapons(item.name, window.currentFilters.selectedWeapons));
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
            items = items.filter(item => item.price >= min);
        }
    }

    // Применяем фильтр по цене (Макс. цена)
    if (window.currentFilters && window.currentFilters.maxPrice !== '') {
        const max = Number(window.currentFilters.maxPrice);
        if (!isNaN(max)) {
            items = items.filter(item => item.price <= max);
        }
    }

    // Сортировка по цене
    if (window.currentFilters && window.currentFilters.sortBy) {
        if (window.currentFilters.sortBy === 'price-asc') {
            items.sort((a, b) => a.price - b.price);
        } else if (window.currentFilters.sortBy === 'price-desc') {
            items.sort((a, b) => b.price - a.price);
        }
    }

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
                <article class="item-card" style="--rarity-color: ${item.rarity || '#4b69ff'};">
                    <div class="item-image-wrapper" style="cursor: pointer;" onclick="openMarketInspect(${item.id})">
                        <img src="${getImageUrl(item.imageUrl)}" alt="${item.name}" onerror="handleInspectImageError(this, 'market', ${item.id})">
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
                <h2>Satılık Eşyalar</h2>
                <span>${items.length} eşya</span>
            </div>
            <div class="market-grid">
                ${cardsHTML || `
                    <div class="state-panel">
                        <i class="bi bi-search" style="font-size: 28px; color: var(--accent-blue); margin-bottom: 4px;"></i>
                        <span style="color: #ffffff; font-size: 15px; font-weight: 600;">Eşya bulunamadı</span>
                        <p style="margin: 0; font-size: 13px; color: var(--text-muted);">Filtrelerinizi veya arama sorgunuzu ayarlamayı deneyin.</p>
                    </div>
                `}
            </div>
        </section>
    `;
}

async function handleBuy(id, button) {
    if (button) {
        button.disabled = true;
        button.textContent = 'Satın alınıyor...';
    }

    try {
        const response = await buyMarketplaceItem(id);
        alert(`Başarılı! ${response.data.item.name} satın alındı.`);
        
        // Обновляем баланс юзера и перерисовываем сайдбар
        const userResponse = await getCurrentUser();
        currentUser = userResponse.data;
        if (typeof renderSidebar === 'function') renderSidebar();
        
        // Перезагружаем список товаров
        await renderMarket();
    } catch (error) {
        alert(error.message);
        if (button) {
            button.disabled = false;
            button.textContent = 'Satın Al';
        }
    }
}

window.openMarketInspect = function(id) {
    const item = marketItems.find(entry => entry.id === id);
    if (item) openInspectItem(item, 'market');
};