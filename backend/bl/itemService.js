// backend/bl/itemService.js
const itemDal = require('../dal/itemDal');
const userDal = require('../dal/userDal');

async function getMarketplaceItems() {
    return itemDal.getItemsForSale();
}

async function getTrendingItems() {
    return itemDal.getTrendingItems(); // синхронный — await не нужен, но не мешает
}

async function getUserInventory(userId) {
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
        const error = new Error('Inventory item not found');
        error.statusCode = 404;
        throw error;
    }
    return item;
}

async function buyMarketplaceItem(id, buyerId) {
    const item = await itemDal.findItemById(id);

    if (!item || item.status !== 'listed') {
        const error = new Error('Item is not available for purchase');
        error.statusCode = 409;
        throw error;
    }

    const buyer = await userDal.findUserById(buyerId);

    if (buyer.balance < item.price) {
        const error = new Error(`Insufficient balance. You need ${item.price} \u20BA`);
        error.statusCode = 400;
        throw error;
    }

    await userDal.updateUserBalance(buyer.id, -item.price);

    if (item.ownerId && item.ownerId !== buyer.id) {
        await userDal.updateUserBalance(item.ownerId, item.price);
    }

    return itemDal.markItemAsSold(id, buyer.id);
}

async function listInventoryItemForSale(id, price, userId) {
    const item = await itemDal.listInventoryItemForSale(id, price, userId);
    if (!item) {
        const error = new Error('Item not found in inventory');
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
    addFavoriteItem,
    removeFavoriteItem,
    getFavoriteItems
};