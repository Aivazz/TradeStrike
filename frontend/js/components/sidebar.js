async function renderSidebar() {
    const user = currentUser || {
        displayName: 'TraderPro',
        balance: 0
    };

    const initials = (user.displayName || user.username || 'TP').substring(0, 2).toUpperCase();

    // Fetch favorites from API to keep state synchronized
    try {
        const response = await getFavorites();
        const favsList = response.data || [];
        window.favoriteItems = favsList;
        window.favoriteItemIds = favsList.map(item => item.id);
    } catch (error) {
        console.error("Failed to fetch favorites inside sidebar:", error);
    }

    const sidebarHTML = `
        <div class="logo-area">
            <span class="logo-primary">TradeStrike</span>
        </div>
        <ul class="nav-menu">
            <li class="nav-item active" data-view="marketplace" onclick="renderMarketplaceView()"><i class="bi bi-cart3"></i><span>Pazaryeri</span></li>
            <li class="nav-item" data-view="inventory" onclick="renderInventoryView()"><i class="bi bi-box-seam"></i><span>Envanterim</span></li>
            <li class="nav-item" data-view="favorites" onclick="renderFavoritesView()"><i class="bi bi-heart"></i><span>Favoriler</span></li>
            <li class="nav-item" data-view="friends" onclick="renderFriendsView()"><i class="bi bi-people"></i><span>Arkadaşlar</span></li>
            <li class="nav-item" data-view="trade-offers" onclick="renderTradeOffersView()"><i class="bi bi-arrow-left-right"></i><span>Takas Teklifleri</span></li>
            <li class="nav-item" data-view="settings" onclick="renderSettingsView()"><i class="bi bi-gear"></i><span>Ayarlar</span></li>
        </ul>

        <div class="user-profile-card">
            <div class="user-profile-details">
                <div class="user-avatar-circle">${initials}</div>
                <div class="user-profile-text">
                    <span class="user-profile-name">${user.displayName || user.username}</span>
                    <span class="user-profile-balance">${user.balance.toFixed(2)} ₺</span>
                </div>
            </div>
            <button class="logout-btn-new" onclick="handleLogout()" title="Çıkış Yap">
                <i class="bi bi-box-arrow-right"></i>
            </button>
        </div>
    `;

    document.getElementById('sidebar-root').innerHTML = sidebarHTML;
}
