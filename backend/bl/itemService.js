// backend/bl/itemService.js
const itemDal = require('../dal/itemDal');
const userDal = require('../dal/userDal');

async function getMarketplaceItems() {
    return itemDal.getItemsForSale();
}

async function getTrendingItems() {
    return itemDal.getTrendingItems(); // синхронный — await не нужен, но не мешает
}

async function getUserInventory(userId, requesterId = null) {
    const user = await userDal.findUserById(userId);
    if (!user) {
        const error = new Error('Kullanıcı bulunamadı');
        error.statusCode = 404;
        throw error;
    }

    if (user.is_inventory_private && userId !== requesterId) {
        const error = new Error('Bu kullanıcının envanteri gizlidir.');
        error.statusCode = 403;
        throw error;
    }

    const items = await itemDal.getInventoryItems(userId);
    const totalValue = items.reduce((sum, item) => sum + (Number(item.estPrice) || Number(item.price) || 0), 0);

    return {
        items,
        totalItems: items.length,
        totalValue: Number((totalValue || 0).toFixed(2))
    };
}

async function getInventoryItem(id, userId) {
    const item = await itemDal.findInventoryItemById(id, userId);
    if (!item) {
        const error = new Error('Envanter eşyası bulunamadı');
        error.statusCode = 404;
        throw error;
    }
    return item;
}

async function buyMarketplaceItem(id, buyerId) {
    const item = await itemDal.findItemById(id);

    if (!item || item.status !== 'listed') {
        const error = new Error('Eşya satın alınabilir durumda değil');
        error.statusCode = 409;
        throw error;
    }

    const buyer = await userDal.findUserById(buyerId);

    if (buyer.balance < item.price) {
        const error = new Error(`Yetersiz bakiye. ${item.price} \u20BA değerinde bakiyeye ihtiyacınız var.`);
        error.statusCode = 400;
        throw error;
    }

    await userDal.updateUserBalance(buyer.id, -item.price);

    if (item.ownerId && item.ownerId !== buyer.id) {
        const commissionRate = 0.03; // 3% commission
        const sellerEarnings = item.price * (1 - commissionRate);
        const roundedEarnings = Math.round(sellerEarnings * 100) / 100;
        await userDal.updateUserBalance(item.ownerId, roundedEarnings);
    }

    return itemDal.markItemAsSold(id, buyer.id);
}

async function listInventoryItemForSale(id, price, userId) {
    const item = await itemDal.listInventoryItemForSale(id, price, userId);
    if (!item) {
        const error = new Error('Eşya envanterde bulunamadı');
        error.statusCode = 404;
        throw error;
    }
    return item;
}

async function cancelInventoryListing(id, userId) {
    const item = await itemDal.cancelInventoryListing(id, userId);
    if (!item) {
        const error = new Error('Eşya envanterde bulunamadı veya satışta değil');
        error.statusCode = 404;
        throw error;
    }
    return item;
}

async function addFavoriteItem(userId, marketItemId) {
    return itemDal.addFavoriteItem(userId, marketItemId);
}

async function removeFavoriteItem(userId, marketItemId) {
    return itemDal.removeFavoriteItem(userId, marketItemId);
}

async function getFavoriteItems(userId) {
    return itemDal.getFavoriteItems(userId);
}

module.exports = {
    getMarketplaceItems,
    getTrendingItems,
    getUserInventory,
    getInventoryItem,
    buyMarketplaceItem,
    listInventoryItemForSale,
    cancelInventoryListing,
    addFavoriteItem,
    removeFavoriteItem,
    getFavoriteItems
};