window.weaponCategories = {
    pistol: ['Glock-18', 'USP-S', 'P2000', 'P250', 'Desert Eagle', 'Tec-9', 'CZ75-Auto', 'Dual Berettas', 'Five-SeveN', 'R8 Revolver', 'Revolver'],
    smg: ['MAC-10', 'MP9', 'MP7', 'MP5-SD', 'MP5', 'UMP-45', 'P90', 'PP-19 Bizon', 'PP-Bizon'],
    rifle: ['AK-47', 'M4A4', 'M4A1-S', 'FAMAS', 'Galil AR', 'Galil', 'AUG', 'SG 553'],
    sniper: ['AWP', 'SSG 08', 'SCAR-20', 'G3SG1'],
    shotgun: ['Nova', 'XM1014', 'MAG-7', 'Sawed-Off'],
    machinegun: ['Negev', 'M249'],
    knife: [
        'Bayonet', 'M9 Bayonet', 'Flip Knife', 'Gut Knife', 'Karambit', 
        'Huntsman Knife', 'Butterfly Knife', 'Falchion Knife', 'Shadow Daggers', 
        'Bowie Knife', 'Navaja Knife', 'Stiletto Knife', 'Ursus Knife', 'Talon Knife', 
        'Classic Knife', 'Paracord Knife', 'Survival Knife', 'Nomad Knife', 
        'Skeleton Knife', 'Kukri Knife'
    ]
};

window.getWeaponCategory = function(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('knife') || lowerName.includes('dagger') || lowerName.includes('bayonet') || lowerName.includes('karambit') || lowerName.includes('нож')) {
        return 'knife';
    }
    
    for (const [catKey, list] of Object.entries(window.weaponCategories)) {
        if (catKey === 'knife') continue;
        for (const item of list) {
            const cleanItem = item.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanName = lowerName.replace(/[^a-z0-9]/g, '');
            if (cleanName.includes(cleanItem)) {
                return catKey;
            }
        }
    }
    return 'other';
};

if (!window.currentFilters) {
    window.currentFilters = {
        searchQuery: '',
        selectedCategories: [],
        selectedWeapons: [],
        conditions: [],
        rarities: [],
        minPrice: '',
        maxPrice: '',
        sortBy: 'default'
    };
}

function renderTopbar(title = 'Marketplace') {
    const user = currentUser || { displayName: 'TraderPro', balance: 0 };

    const topbarHTML = `
        <header class="topbar">
            <h1 class="page-title">${title}</h1>
            <div class="topbar-search">
                <div class="search-wrap">
                    <i class="bi bi-search"></i>
                    <input type="text" class="search-bar" placeholder="Eşya, süs veya koleksiyon ara..." oninput="handleSearchInput(event)">
                </div>
            </div>
            <div class="topbar-actions" style="position: relative;">
                <div class="wallet-badge" onclick="renderSettingsView()" title="Bakiye Yükle">
                    <i class="bi bi-wallet2"></i>
                    <span>${user.balance.toFixed(2)} ₺</span>
                </div>
                <button class="filter-button" onclick="toggleFilterMenu(event)">
                    <i class="bi bi-sliders"></i>
                    <span>Filtrele</span>
                </button>

                <!-- Выпадающий список фильтров -->
                <div class="filter-popover" id="filter-popover" onclick="event.stopPropagation()">
                    <div class="filter-grid-new">
                        <!-- Пистолеты -->
                        <div class="filter-cell" id="cell-pistol">
                            <span class="cell-label" onclick="toggleCategory('pistol')">
                                <input type="checkbox" id="check-cat-pistol" class="cat-checkbox" ${window.currentFilters.selectedCategories.includes('pistol') ? 'checked' : ''} onclick="event.stopPropagation();" onchange="toggleCategoryCheckbox('pistol', this.checked)">
                                Tabancalar
                            </span>
                            <button class="cell-arrow" onclick="toggleDropdown(event, 'pistol')">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                            <div class="cell-dropdown" id="dropdown-pistol" onclick="event.stopPropagation()">
                                <label><input type="checkbox" onchange="toggleAllWeapons('pistol', this.checked)"> Tümü</label>
                                <label><input type="checkbox" value="Glock-18" ${window.currentFilters.selectedWeapons.includes('Glock-18') ? 'checked' : ''} onchange="toggleWeapon('Glock-18', this.checked)"> Glock-18</label>
                                <label><input type="checkbox" value="USP-S" ${window.currentFilters.selectedWeapons.includes('USP-S') ? 'checked' : ''} onchange="toggleWeapon('USP-S', this.checked)"> USP-S</label>
                                <label><input type="checkbox" value="P2000" ${window.currentFilters.selectedWeapons.includes('P2000') ? 'checked' : ''} onchange="toggleWeapon('P2000', this.checked)"> P2000</label>
                                <label><input type="checkbox" value="P250" ${window.currentFilters.selectedWeapons.includes('P250') ? 'checked' : ''} onchange="toggleWeapon('P250', this.checked)"> P250</label>
                                <label><input type="checkbox" value="Desert Eagle" ${window.currentFilters.selectedWeapons.includes('Desert Eagle') ? 'checked' : ''} onchange="toggleWeapon('Desert Eagle', this.checked)"> Desert Eagle</label>
                                <label><input type="checkbox" value="Tec-9" ${window.currentFilters.selectedWeapons.includes('Tec-9') ? 'checked' : ''} onchange="toggleWeapon('Tec-9', this.checked)"> Tec-9</label>
                                <label><input type="checkbox" value="CZ75-Auto" ${window.currentFilters.selectedWeapons.includes('CZ75-Auto') ? 'checked' : ''} onchange="toggleWeapon('CZ75-Auto', this.checked)"> CZ75-Auto</label>
                                <label><input type="checkbox" value="Dual Berettas" ${window.currentFilters.selectedWeapons.includes('Dual Berettas') ? 'checked' : ''} onchange="toggleWeapon('Dual Berettas', this.checked)"> Dual Berettas</label>
                                <label><input type="checkbox" value="Five-SeveN" ${window.currentFilters.selectedWeapons.includes('Five-SeveN') ? 'checked' : ''} onchange="toggleWeapon('Five-SeveN', this.checked)"> Five-SeveN</label>
                                <label><input type="checkbox" value="R8 Revolver" ${window.currentFilters.selectedWeapons.includes('R8 Revolver') ? 'checked' : ''} onchange="toggleWeapon('R8 Revolver', this.checked)"> R8 Revolver</label>
                            </div>
                        </div>

                        <!-- Пистолеты-пулеметы (ПП) -->
                        <div class="filter-cell" id="cell-smg">
                            <span class="cell-label" onclick="toggleCategory('smg')">
                                <input type="checkbox" id="check-cat-smg" class="cat-checkbox" ${window.currentFilters.selectedCategories.includes('smg') ? 'checked' : ''} onclick="event.stopPropagation();" onchange="toggleCategoryCheckbox('smg', this.checked)">
                                Hafif Makineli Tüfekler
                            </span>
                            <button class="cell-arrow" onclick="toggleDropdown(event, 'smg')">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                            <div class="cell-dropdown" id="dropdown-smg" onclick="event.stopPropagation()">
                                <label><input type="checkbox" onchange="toggleAllWeapons('smg', this.checked)"> Tümü</label>
                                <label><input type="checkbox" value="MAC-10" ${window.currentFilters.selectedWeapons.includes('MAC-10') ? 'checked' : ''} onchange="toggleWeapon('MAC-10', this.checked)"> MAC-10</label>
                                <label><input type="checkbox" value="MP9" ${window.currentFilters.selectedWeapons.includes('MP9') ? 'checked' : ''} onchange="toggleWeapon('MP9', this.checked)"> MP9</label>
                                <label><input type="checkbox" value="MP7" ${window.currentFilters.selectedWeapons.includes('MP7') ? 'checked' : ''} onchange="toggleWeapon('MP7', this.checked)"> MP7</label>
                                <label><input type="checkbox" value="MP5-SD" ${window.currentFilters.selectedWeapons.includes('MP5-SD') ? 'checked' : ''} onchange="toggleWeapon('MP5-SD', this.checked)"> MP5-SD</label>
                                <label><input type="checkbox" value="UMP-45" ${window.currentFilters.selectedWeapons.includes('UMP-45') ? 'checked' : ''} onchange="toggleWeapon('UMP-45', this.checked)"> UMP-45</label>
                                <label><input type="checkbox" value="P90" ${window.currentFilters.selectedWeapons.includes('P90') ? 'checked' : ''} onchange="toggleWeapon('P90', this.checked)"> P90</label>
                                <label><input type="checkbox" value="PP-19 Bizon" ${window.currentFilters.selectedWeapons.includes('PP-19 Bizon') ? 'checked' : ''} onchange="toggleWeapon('PP-19 Bizon', this.checked)"> PP-19 Bizon</label>
                            </div>
                        </div>

                        <!-- Винтовки -->
                        <div class="filter-cell" id="cell-rifle">
                            <span class="cell-label" onclick="toggleCategory('rifle')">
                                <input type="checkbox" id="check-cat-rifle" class="cat-checkbox" ${window.currentFilters.selectedCategories.includes('rifle') ? 'checked' : ''} onclick="event.stopPropagation();" onchange="toggleCategoryCheckbox('rifle', this.checked)">
                                Tüfekler
                            </span>
                            <button class="cell-arrow" onclick="toggleDropdown(event, 'rifle')">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                            <div class="cell-dropdown" id="dropdown-rifle" onclick="event.stopPropagation()">
                                <label><input type="checkbox" onchange="toggleAllWeapons('rifle', this.checked)"> Tümü</label>
                                <label><input type="checkbox" value="AK-47" ${window.currentFilters.selectedWeapons.includes('AK-47') ? 'checked' : ''} onchange="toggleWeapon('AK-47', this.checked)"> AK-47</label>
                                <label><input type="checkbox" value="M4A4" ${window.currentFilters.selectedWeapons.includes('M4A4') ? 'checked' : ''} onchange="toggleWeapon('M4A4', this.checked)"> M4A4</label>
                                <label><input type="checkbox" value="M4A1-S" ${window.currentFilters.selectedWeapons.includes('M4A1-S') ? 'checked' : ''} onchange="toggleWeapon('M4A1-S', this.checked)"> M4A1-S</label>
                                <label><input type="checkbox" value="FAMAS" ${window.currentFilters.selectedWeapons.includes('FAMAS') ? 'checked' : ''} onchange="toggleWeapon('FAMAS', this.checked)"> FAMAS</label>
                                <label><input type="checkbox" value="Galil AR" ${window.currentFilters.selectedWeapons.includes('Galil AR') ? 'checked' : ''} onchange="toggleWeapon('Galil AR', this.checked)"> Galil AR</label>
                                <label><input type="checkbox" value="AUG" ${window.currentFilters.selectedWeapons.includes('AUG') ? 'checked' : ''} onchange="toggleWeapon('AUG', this.checked)"> AUG</label>
                                <label><input type="checkbox" value="SG 553" ${window.currentFilters.selectedWeapons.includes('SG 553') ? 'checked' : ''} onchange="toggleWeapon('SG 553', this.checked)"> SG 553</label>
                            </div>
                        </div>

                        <!-- Снайперские винтовки -->
                        <div class="filter-cell" id="cell-sniper">
                            <span class="cell-label" onclick="toggleCategory('sniper')">
                                <input type="checkbox" id="check-cat-sniper" class="cat-checkbox" ${window.currentFilters.selectedCategories.includes('sniper') ? 'checked' : ''} onclick="event.stopPropagation();" onchange="toggleCategoryCheckbox('sniper', this.checked)">
                                Keskin Nişancı Tüfekleri
                            </span>
                            <button class="cell-arrow" onclick="toggleDropdown(event, 'sniper')">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                            <div class="cell-dropdown" id="dropdown-sniper" onclick="event.stopPropagation()">
                                <label><input type="checkbox" onchange="toggleAllWeapons('sniper', this.checked)"> Tümü</label>
                                <label><input type="checkbox" value="AWP" ${window.currentFilters.selectedWeapons.includes('AWP') ? 'checked' : ''} onchange="toggleWeapon('AWP', this.checked)"> AWP</label>
                                <label><input type="checkbox" value="SSG 08" ${window.currentFilters.selectedWeapons.includes('SSG 08') ? 'checked' : ''} onchange="toggleWeapon('SSG 08', this.checked)"> SSG 08</label>
                                <label><input type="checkbox" value="SCAR-20" ${window.currentFilters.selectedWeapons.includes('SCAR-20') ? 'checked' : ''} onchange="toggleWeapon('SCAR-20', this.checked)"> SCAR-20</label>
                                <label><input type="checkbox" value="G3SG1" ${window.currentFilters.selectedWeapons.includes('G3SG1') ? 'checked' : ''} onchange="toggleWeapon('G3SG1', this.checked)"> G3SG1</label>
                            </div>
                        </div>

                        <!-- Дробовики -->
                        <div class="filter-cell" id="cell-shotgun">
                            <span class="cell-label" onclick="toggleCategory('shotgun')">
                                <input type="checkbox" id="check-cat-shotgun" class="cat-checkbox" ${window.currentFilters.selectedCategories.includes('shotgun') ? 'checked' : ''} onclick="event.stopPropagation();" onchange="toggleCategoryCheckbox('shotgun', this.checked)">
                                Pompalı Tüfekler
                            </span>
                            <button class="cell-arrow" onclick="toggleDropdown(event, 'shotgun')">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                            <div class="cell-dropdown" id="dropdown-shotgun" onclick="event.stopPropagation()">
                                <label><input type="checkbox" onchange="toggleAllWeapons('shotgun', this.checked)"> Tümü</label>
                                <label><input type="checkbox" value="Nova" ${window.currentFilters.selectedWeapons.includes('Nova') ? 'checked' : ''} onchange="toggleWeapon('Nova', this.checked)"> Nova</label>
                                <label><input type="checkbox" value="XM1014" ${window.currentFilters.selectedWeapons.includes('XM1014') ? 'checked' : ''} onchange="toggleWeapon('XM1014', this.checked)"> XM1014</label>
                                <label><input type="checkbox" value="MAG-7" ${window.currentFilters.selectedWeapons.includes('MAG-7') ? 'checked' : ''} onchange="toggleWeapon('MAG-7', this.checked)"> MAG-7</label>
                                <label><input type="checkbox" value="Sawed-Off" ${window.currentFilters.selectedWeapons.includes('Sawed-Off') ? 'checked' : ''} onchange="toggleWeapon('Sawed-Off', this.checked)"> Sawed-Off</label>
                            </div>
                        </div>

                        <!-- Пулеметы -->
                        <div class="filter-cell" id="cell-machinegun">
                            <span class="cell-label" onclick="toggleCategory('machinegun')">
                                <input type="checkbox" id="check-cat-machinegun" class="cat-checkbox" ${window.currentFilters.selectedCategories.includes('machinegun') ? 'checked' : ''} onclick="event.stopPropagation();" onchange="toggleCategoryCheckbox('machinegun', this.checked)">
                                Makineli Tüfekler
                            </span>
                            <button class="cell-arrow" onclick="toggleDropdown(event, 'machinegun')">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                            <div class="cell-dropdown" id="dropdown-machinegun" onclick="event.stopPropagation()">
                                <label><input type="checkbox" onchange="toggleAllWeapons('machinegun', this.checked)"> Tümü</label>
                                <label><input type="checkbox" value="Negev" ${window.currentFilters.selectedWeapons.includes('Negev') ? 'checked' : ''} onchange="toggleWeapon('Negev', this.checked)"> Negev</label>
                                <label><input type="checkbox" value="M249" ${window.currentFilters.selectedWeapons.includes('M249') ? 'checked' : ''} onchange="toggleWeapon('M249', this.checked)"> M249</label>
                            </div>
                        </div>

                        <!-- Ножи -->
                        <div class="filter-cell" id="cell-knife">
                            <span class="cell-label" onclick="toggleCategory('knife')">
                                <input type="checkbox" id="check-cat-knife" class="cat-checkbox" ${window.currentFilters.selectedCategories.includes('knife') ? 'checked' : ''} onclick="event.stopPropagation();" onchange="toggleCategoryCheckbox('knife', this.checked)">
                                Bıçaklar
                            </span>
                            <button class="cell-arrow" onclick="toggleDropdown(event, 'knife')">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                            <div class="cell-dropdown" id="dropdown-knife" onclick="event.stopPropagation()">
                                <label><input type="checkbox" onchange="toggleAllWeapons('knife', this.checked)"> Tümü</label>
                                <label><input type="checkbox" value="Bayonet" ${window.currentFilters.selectedWeapons.includes('Bayonet') ? 'checked' : ''} onchange="toggleWeapon('Bayonet', this.checked)"> Bayonet</label>
                                <label><input type="checkbox" value="M9 Bayonet" ${window.currentFilters.selectedWeapons.includes('M9 Bayonet') ? 'checked' : ''} onchange="toggleWeapon('M9 Bayonet', this.checked)"> M9 Bayonet</label>
                                <label><input type="checkbox" value="Flip Knife" ${window.currentFilters.selectedWeapons.includes('Flip Knife') ? 'checked' : ''} onchange="toggleWeapon('Flip Knife', this.checked)"> Flip Knife</label>
                                <label><input type="checkbox" value="Gut Knife" ${window.currentFilters.selectedWeapons.includes('Gut Knife') ? 'checked' : ''} onchange="toggleWeapon('Gut Knife', this.checked)"> Gut Knife</label>
                                <label><input type="checkbox" value="Karambit" ${window.currentFilters.selectedWeapons.includes('Karambit') ? 'checked' : ''} onchange="toggleWeapon('Karambit', this.checked)"> Karambit</label>
                                <label><input type="checkbox" value="Huntsman Knife" ${window.currentFilters.selectedWeapons.includes('Huntsman Knife') ? 'checked' : ''} onchange="toggleWeapon('Huntsman Knife', this.checked)"> Huntsman Knife</label>
                                <label><input type="checkbox" value="Butterfly Knife" ${window.currentFilters.selectedWeapons.includes('Butterfly Knife') ? 'checked' : ''} onchange="toggleWeapon('Butterfly Knife', this.checked)"> Butterfly Knife</label>
                                <label><input type="checkbox" value="Falchion Knife" ${window.currentFilters.selectedWeapons.includes('Falchion Knife') ? 'checked' : ''} onchange="toggleWeapon('Falchion Knife', this.checked)"> Falchion Knife</label>
                                <label><input type="checkbox" value="Shadow Daggers" ${window.currentFilters.selectedWeapons.includes('Shadow Daggers') ? 'checked' : ''} onchange="toggleWeapon('Shadow Daggers', this.checked)"> Shadow Daggers</label>
                                <label><input type="checkbox" value="Bowie Knife" ${window.currentFilters.selectedWeapons.includes('Bowie Knife') ? 'checked' : ''} onchange="toggleWeapon('Bowie Knife', this.checked)"> Bowie Knife</label>
                                <label><input type="checkbox" value="Navaja Knife" ${window.currentFilters.selectedWeapons.includes('Navaja Knife') ? 'checked' : ''} onchange="toggleWeapon('Navaja Knife', this.checked)"> Navaja Knife</label>
                                <label><input type="checkbox" value="Stiletto Knife" ${window.currentFilters.selectedWeapons.includes('Stiletto Knife') ? 'checked' : ''} onchange="toggleWeapon('Stiletto Knife', this.checked)"> Stiletto Knife</label>
                                <label><input type="checkbox" value="Ursus Knife" ${window.currentFilters.selectedWeapons.includes('Ursus Knife') ? 'checked' : ''} onchange="toggleWeapon('Ursus Knife', this.checked)"> Ursus Knife</label>
                                <label><input type="checkbox" value="Talon Knife" ${window.currentFilters.selectedWeapons.includes('Talon Knife') ? 'checked' : ''} onchange="toggleWeapon('Talon Knife', this.checked)"> Talon Knife</label>
                                <label><input type="checkbox" value="Classic Knife" ${window.currentFilters.selectedWeapons.includes('Classic Knife') ? 'checked' : ''} onchange="toggleWeapon('Classic Knife', this.checked)"> Classic Knife</label>
                                <label><input type="checkbox" value="Paracord Knife" ${window.currentFilters.selectedWeapons.includes('Paracord Knife') ? 'checked' : ''} onchange="toggleWeapon('Paracord Knife', this.checked)"> Paracord Knife</label>
                                <label><input type="checkbox" value="Survival Knife" ${window.currentFilters.selectedWeapons.includes('Survival Knife') ? 'checked' : ''} onchange="toggleWeapon('Survival Knife', this.checked)"> Survival Knife</label>
                                <label><input type="checkbox" value="Nomad Knife" ${window.currentFilters.selectedWeapons.includes('Nomad Knife') ? 'checked' : ''} onchange="toggleWeapon('Nomad Knife', this.checked)"> Nomad Knife</label>
                                <label><input type="checkbox" value="Skeleton Knife" ${window.currentFilters.selectedWeapons.includes('Skeleton Knife') ? 'checked' : ''} onchange="toggleWeapon('Skeleton Knife', this.checked)"> Skeleton Knife</label>
                                <label><input type="checkbox" value="Kukri Knife" ${window.currentFilters.selectedWeapons.includes('Kukri Knife') ? 'checked' : ''} onchange="toggleWeapon('Kukri Knife', this.checked)"> Kukri Knife</label>
                            </div>
                        </div>

                        <!-- Качество оружия -->
                        <div class="filter-cell" id="cell-quality">
                            <span class="cell-label" onclick="toggleDropdown(event, 'quality')">
                                Silah Durumu
                            </span>
                            <button class="cell-arrow" onclick="toggleDropdown(event, 'quality')">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                            <div class="cell-dropdown" id="dropdown-quality" onclick="event.stopPropagation()">
                                <div class="dropdown-subheader">Aşınma Durumu</div>
                                <label><input type="checkbox" value="Factory New" ${window.currentFilters.conditions.includes('Factory New') ? 'checked' : ''} onchange="toggleFilterCondition('Factory New', this.checked)"> Fabrikadan Yeni Çıkmış</label>
                                <label><input type="checkbox" value="Minimal Wear" ${window.currentFilters.conditions.includes('Minimal Wear') ? 'checked' : ''} onchange="toggleFilterCondition('Minimal Wear', this.checked)"> Az Aşınmış</label>
                                <label><input type="checkbox" value="Field-Tested" ${window.currentFilters.conditions.includes('Field-Tested') ? 'checked' : ''} onchange="toggleFilterCondition('Field-Tested', this.checked)"> Görevde Kullanılmış</label>
                                <label><input type="checkbox" value="Well-Worn" ${window.currentFilters.conditions.includes('Well-Worn') ? 'checked' : ''} onchange="toggleFilterCondition('Well-Worn', this.checked)"> Eskimiş</label>
                                <label><input type="checkbox" value="Battle-Scarred" ${window.currentFilters.conditions.includes('Battle-Scarred') ? 'checked' : ''} onchange="toggleFilterCondition('Battle-Scarred', this.checked)"> Savaş Görmüş</label>
                                
                                <div class="dropdown-subheader" style="margin-top: 10px;">Nadirliği</div>
                                <label><input type="checkbox" value="#e4ae39" ${window.currentFilters.rarities.includes('#e4ae39') ? 'checked' : ''} onchange="toggleFilterRarity('#e4ae39', this.checked)"> <span class="rarity-dot" style="background:#e4ae39;"></span> Altın</label>
                                <label><input type="checkbox" value="#eb4b4b" ${window.currentFilters.rarities.includes('#eb4b4b') ? 'checked' : ''} onchange="toggleFilterRarity('#eb4b4b', this.checked)"> <span class="rarity-dot" style="background:#eb4b4b;"></span> Gizli</label>
                                <label><input type="checkbox" value="#d32ce6" ${window.currentFilters.rarities.includes('#d32ce6') ? 'checked' : ''} onchange="toggleFilterRarity('#d32ce6', this.checked)"> <span class="rarity-dot" style="background:#d32ce6;"></span> Çok Gizli</label>
                                <label><input type="checkbox" value="#8847ff" ${window.currentFilters.rarities.includes('#8847ff') ? 'checked' : ''} onchange="toggleFilterRarity('#8847ff', this.checked)"> <span class="rarity-dot" style="background:#8847ff;"></span> Sınırlı</label>
                                <label><input type="checkbox" value="#4b69ff" ${window.currentFilters.rarities.includes('#4b69ff') ? 'checked' : ''} onchange="toggleFilterRarity('#4b69ff', this.checked)"> <span class="rarity-dot" style="background:#4b69ff;"></span> Askeri Sınıf</label>
                            </div>
                        </div>
                    </div>

                    <!-- Диапазон цен -->
                    <div class="price-range-wrapper">
                        <div class="price-input-container">
                            <input type="number" id="filter-min-price" class="price-field" placeholder="Min. Fiyat" value="${window.currentFilters.minPrice}" oninput="handleMinPrice(this.value)">
                            <i class="bi bi-sliders price-icon"></i>
                        </div>
                        <span class="price-separator">-</span>
                        <div class="price-input-container">
                            <input type="number" id="filter-max-price" class="price-field" placeholder="Maks. Fiyat" value="${window.currentFilters.maxPrice}" oninput="handleMaxPrice(this.value)">
                            <i class="bi bi-sliders price-icon"></i>
                        </div>
                    </div>

                    <!-- Сортировка и Кнопки -->
                    <div class="filter-bottom-row">
                        <select class="price-field sort-select" onchange="setFilterSort(this.value)">
                            <option value="default" ${window.currentFilters.sortBy === 'default' ? 'selected' : ''}>Varsayılan Sıralama</option>
                            <option value="price-asc" ${window.currentFilters.sortBy === 'price-asc' ? 'selected' : ''}>Fiyat: Artan</option>
                            <option value="price-desc" ${window.currentFilters.sortBy === 'price-desc' ? 'selected' : ''}>Fiyat: Azalan</option>
                        </select>
                        <div class="filter-actions-new">
                            <button class="btn-clear" onclick="resetFilters()">Temizle</button>
                            <button class="btn-apply" onclick="toggleFilterMenu(event, false)">Uygula</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
                  <style>
            .filter-popover {
                position: absolute;
                top: 52px;
                right: 0;
                z-index: 1000;
                width: 440px;
                padding: 16px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.5);
                display: none;
                flex-direction: column;
                gap: 14px;
            }
            .filter-popover.show {
                display: flex;
            }
            .filter-grid-new {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
            .filter-cell {
                position: relative;
                display: flex;
                align-items: center;
                background: var(--bg-main);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                height: 38px;
                overflow: visible;
            }
            .cell-label {
                flex-grow: 1;
                display: flex;
                align-items: center;
                gap: 8px;
                padding-left: 10px;
                font-size: 13px;
                font-weight: 600;
                color: #ffffff;
                cursor: pointer;
                user-select: none;
                height: 100%;
            }
            .cat-checkbox {
                width: 14px;
                height: 14px;
                cursor: pointer;
                accent-color: var(--accent-blue);
            }
            .cell-arrow {
                width: 36px;
                height: 100%;
                background: transparent;
                border: 0;
                border-left: 1px solid var(--border-color);
                color: var(--text-muted);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
            .cell-arrow:hover {
                color: #ffffff;
                background: rgba(255,255,255,0.03);
            }
            .cell-dropdown {
                position: absolute;
                top: 42px;
                left: 0;
                z-index: 1020;
                width: 100%;
                max-height: 200px;
                overflow-y: auto;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 10px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                display: none;
                flex-direction: column;
                gap: 6px;
            }
            .cell-dropdown.show {
                display: flex;
            }
            .cell-dropdown label {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: var(--text-muted);
                cursor: pointer;
                user-select: none;
                margin-bottom: 2px;
            }
            .cell-dropdown label input {
                accent-color: var(--accent-blue);
            }
            .dropdown-subheader {
                font-size: 10px;
                color: var(--text-primary);
                text-transform: uppercase;
                font-weight: 700;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 3px;
                margin-bottom: 4px;
            }
            
            /* Price Range */
            .price-range-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .price-input-container {
                position: relative;
                flex: 1;
            }
            .price-field {
                width: 100%;
                height: 36px;
                padding: 0 30px 0 10px;
                background: var(--bg-main);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: #ffffff;
                font-size: 13px;
                outline: none;
                transition: all 0.2s ease;
            }
            .price-field::placeholder {
                color: var(--text-muted);
                opacity: 0.6;
            }
            .price-field:focus {
                border-color: var(--accent-blue);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
            }
            .price-icon {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-muted);
                font-size: 13px;
                pointer-events: none;
                opacity: 0.7;
            }
            .price-separator {
                color: var(--border-soft);
                font-weight: 700;
            }
 
            /* Bottom Row */
            .filter-bottom-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }
            .sort-select {
                width: 130px;
                height: 36px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
            }
            .filter-actions-new {
                display: flex;
                gap: 8px;
                flex-grow: 1;
            }
            .filter-actions-new button {
                flex: 1;
                height: 36px;
                border: 0;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .btn-clear {
                background: rgba(255, 255, 255, 0.04);
                color: var(--text-primary);
                border: 1px solid var(--border-color) !important;
            }
            .btn-clear:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: var(--border-soft) !important;
            }
            .btn-apply {
                background: var(--accent-blue);
                color: #ffffff;
            }
            .btn-apply:hover {
                background: #2563eb;
                box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
            }
            .rarity-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }
        </style>
    `;

    document.getElementById('topbar-root').innerHTML = topbarHTML;
    
    const searchInput = document.querySelector('.search-bar');
    if (searchInput) {
        searchInput.value = window.currentFilters.searchQuery;
    }
}

function handleSearchInput(event) {
    window.currentFilters.searchQuery = event.target.value;
    triggerViewUpdate();
}

function toggleFilterMenu(event, forceState) {
    if (event) {
        event.stopPropagation();
    }
    const popover = document.getElementById('filter-popover');
    if (!popover) return;

    if (forceState !== undefined) {
        popover.classList.toggle('show', forceState);
    } else {
        popover.classList.toggle('show');
    }
}

document.addEventListener('click', () => {
    toggleFilterMenu(null, false);
    document.querySelectorAll('.cell-dropdown').forEach(d => d.classList.remove('show'));
});

function setFilterSort(val) {
    window.currentFilters.sortBy = val;
    triggerViewUpdate();
}

function handleMinPrice(val) {
    window.currentFilters.minPrice = val;
    triggerViewUpdate();
}

function handleMaxPrice(val) {
    window.currentFilters.maxPrice = val;
    triggerViewUpdate();
}

function toggleCategory(cat) {
    const cb = document.getElementById(`check-cat-${cat}`);
    if (!cb) return;
    cb.checked = !cb.checked;
    toggleCategoryCheckbox(cat, cb.checked);
}

function toggleCategoryCheckbox(cat, isChecked) {
    if (isChecked) {
        if (!window.currentFilters.selectedCategories.includes(cat)) {
            window.currentFilters.selectedCategories.push(cat);
        }
    } else {
        window.currentFilters.selectedCategories = window.currentFilters.selectedCategories.filter(c => c !== cat);
    }
    triggerViewUpdate();
}

function toggleDropdown(event, cat) {
    if (event) {
        event.stopPropagation();
    }
    const dropdowns = document.querySelectorAll('.cell-dropdown');
    const target = document.getElementById(`dropdown-${cat}`);
    
    dropdowns.forEach(d => {
        if (d !== target) d.classList.remove('show');
    });
    
    if (target) {
        target.classList.toggle('show');
    }
}

function toggleAllWeapons(cat, isChecked) {
    const list = window.weaponCategories[cat];
    if (!list) return;

    const dropdown = document.getElementById(`dropdown-${cat}`);
    if (dropdown) {
        dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.value) {
                cb.checked = isChecked;
                toggleWeapon(cb.value, isChecked, false);
            }
        });
    }
    triggerViewUpdate();
}

function toggleWeapon(weapon, isChecked, updateView = true) {
    if (isChecked) {
        if (!window.currentFilters.selectedWeapons.includes(weapon)) {
            window.currentFilters.selectedWeapons.push(weapon);
        }
    } else {
        window.currentFilters.selectedWeapons = window.currentFilters.selectedWeapons.filter(w => w !== weapon);
    }
    if (updateView) {
        triggerViewUpdate();
    }
}

function toggleFilterCondition(condition, isChecked) {
    if (isChecked) {
        if (!window.currentFilters.conditions.includes(condition)) {
            window.currentFilters.conditions.push(condition);
        }
    } else {
        window.currentFilters.conditions = window.currentFilters.conditions.filter(c => c !== condition);
    }
    triggerViewUpdate();
}

function toggleFilterRarity(rarity, isChecked) {
    if (isChecked) {
        if (!window.currentFilters.rarities.includes(rarity)) {
            window.currentFilters.rarities.push(rarity);
        }
    } else {
        window.currentFilters.rarities = window.currentFilters.rarities.filter(r => r !== rarity);
    }
    triggerViewUpdate();
}

function resetFilters() {
    window.currentFilters.conditions = [];
    window.currentFilters.rarities = [];
    window.currentFilters.selectedCategories = [];
    window.currentFilters.selectedWeapons = [];
    window.currentFilters.minPrice = '';
    window.currentFilters.maxPrice = '';
    window.currentFilters.sortBy = 'default';
    
    const minInput = document.getElementById('filter-min-price');
    if (minInput) minInput.value = '';
    const maxInput = document.getElementById('filter-max-price');
    if (maxInput) maxInput.value = '';

    const popover = document.getElementById('filter-popover');
    if (popover) {
        popover.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        const defaultRadio = popover.querySelector('input[name="sortPrice"][value="default"]');
        if (defaultRadio) defaultRadio.checked = true;
    }

    triggerViewUpdate();
}

function triggerViewUpdate() {
    const activeNavItem = document.querySelector('.nav-item.active');
    if (!activeNavItem) return;
    
    const view = activeNavItem.dataset.view;
    if (view === 'marketplace' && typeof displayMarket === 'function') {
        displayMarket();
    } else if (view === 'inventory' && typeof displayInventory === 'function') {
        displayInventory();
    }
}
