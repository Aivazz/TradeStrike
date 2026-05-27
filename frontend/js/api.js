const API_BASE_URL = (() => {
    if (window.location.port === '3000') {
        return `${window.location.origin}/api`;
    }

    return 'http://localhost:3000/api';
})();

async function apiRequest(path, options = {}) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        },
        ...options
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.reload();
            return new Promise(() => {}); // prevent further execution
        }
        throw new Error(payload.error || 'API request failed');
    }

    return payload;
}

function getMarketplaceItems() {
    return apiRequest('/market/items');
}

function getTrendingItems() {
    return apiRequest('/market/trending');
}

function buyMarketplaceItem(id) {
    return apiRequest(`/market/items/${id}/buy`, { method: 'POST' });
}

function getInventory() {
    return apiRequest('/inventory');
}

function getInventoryItem(id) {
    return apiRequest(`/inventory/${id}`);
}

function createInventoryListing(id, price) {
    return apiRequest(`/inventory/${id}/listings`, {
        method: 'POST',
        body: JSON.stringify({ price })
    });
}

function getTradeOffers(tab) {
    return apiRequest(`/trades?tab=${encodeURIComponent(tab)}`);
}

function getTradeOffer(id) {
    return apiRequest(`/trades/${id}`);
}

function runTradeAction(id, action) {
    return apiRequest(`/trades/${id}/${action}`, { method: 'POST' });
}

function getAnalytics(range) {
    return apiRequest(`/analytics?range=${encodeURIComponent(range)}`);
}

function exportAnalytics(range) {
    return apiRequest(`/analytics/export?range=${encodeURIComponent(range)}`, { method: 'POST' });
}

function loginUser(username, password) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

function registerUser(data) {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

function getCurrentUser() {
    return apiRequest('/auth/me');
}

function getSystemUsers() {
    return apiRequest('/users');
}

function logoutUser() {
    return apiRequest('/auth/logout', { method: 'POST' });
}

function updateUserSettings(settings) {
    return apiRequest('/users/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
    });
}

function depositUserBalance(amount) {
    return apiRequest('/users/deposit', {
        method: 'POST',
        body: JSON.stringify({ amount })
    });
}

function deleteUserAccount() {
    return apiRequest('/users/account', {
        method: 'DELETE'
    });
}

function getFavorites() {
    return apiRequest('/favorites');
}

function addFavorite(marketItemId) {
    return apiRequest('/favorites', {
        method: 'POST',
        body: JSON.stringify({ marketItemId })
    });
}

function deleteFavorite(marketItemId) {
    return apiRequest(`/favorites/${marketItemId}`, {
        method: 'DELETE'
    });
}

// Global Toast Notification System
function showToast(message, type = 'info') {
    let toastType = type;
    const lower = message.toLowerCase();
    if (lower.includes('error') || lower.includes('failed') || lower.includes('wrong') || lower.includes('invalid') || lower.includes('not match')) {
        toastType = 'error';
    } else if (lower.includes('success') || lower.includes('successfully') || lower.includes('done') || lower.includes('bought') || lower.includes('listed')) {
        toastType = 'success';
    } else {
        toastType = 'info';
    }

    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message ${toastType}`;
    
    let icon = 'bi-info-circle-fill';
    if (toastType === 'success') icon = 'bi-check-circle-fill';
    if (toastType === 'error') icon = 'bi-exclamation-triangle-fill';

    toast.innerHTML = `
        <i class="bi ${icon}"></i>
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    // Auto-remove
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

window.alert = function(message) {
    showToast(message);
};

window.getConditionDetails = function(cond) {
    if (!cond) return { abbr: '-', ru: '-' };
    const clean = cond.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes('factorynew') || clean === 'fn') return { abbr: 'FN', ru: 'Fabrikadan Yeni Çıkmış' };
    if (clean.includes('minimalwear') || clean === 'mw') return { abbr: 'MW', ru: 'Az Aşınmış' };
    if (clean.includes('fieldtested') || clean === 'ft') return { abbr: 'FT', ru: 'Görevde Kullanılmış' };
    if (clean.includes('wellworn') || clean === 'ww') return { abbr: 'WW', ru: 'Eskimiş' };
    if (clean.includes('battlescarred') || clean === 'bs') return { abbr: 'BS', ru: 'Savaş Görmüş' };
    return { abbr: cond.substring(0, 3).toUpperCase(), ru: cond };
};

// ─── Friendship API functions ───────────────────────────────────────────────

function apiFriends() {
    return apiRequest('/friends');
}

function apiFriendRequests() {
    return apiRequest('/friends/requests');
}

function apiFriendsSearch(query) {
    return apiRequest(`/friends/search?q=${encodeURIComponent(query)}`);
}

function apiSendFriendRequest(targetUserId) {
    return apiRequest('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ targetUserId })
    });
}

function apiAcceptFriendRequest(friendshipId) {
    return apiRequest('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ friendshipId })
    });
}

function apiDeclineFriendRequest(friendshipId) {
    return apiRequest('/friends/decline', {
        method: 'POST',
        body: JSON.stringify({ friendshipId })
    });
}

function apiRemoveFriend(targetUserId) {
    return apiRequest('/friends/remove', {
        method: 'DELETE',
        body: JSON.stringify({ targetUserId })
    });
}


