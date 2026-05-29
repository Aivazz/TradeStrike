// backend/dal/itemDal.js
const db = require('../config/db');

const trendingItems = [
    { id: 1, name: 'AWP | Dragon Lore', image: 'AWP', price: 45000.00, change: '+12.5%', imageUrl: 'assets/trend-1.png' },
    { id: 2, name: 'Karambit | Fade', image: 'Karambit', price: 8500.00, change: '+8.3%', imageUrl: 'assets/trend-2.png' },
    { id: 3, name: 'M4A4 | Howl', image: 'M4A4', price: 12500.00, change: '+15.2%', imageUrl: 'assets/trend-3.png' },
    { id: 4, name: 'Butterfly Knife | Tiger Tooth', image: 'Butterfly', price: 7200.00, change: '+5.7%', imageUrl: 'assets/trend-4.png' }
];

async function getItemsForSale() {
    const [rows] = await db.execute('CALL sp_GetItemsForSale()');
    return rows[0].map(row => ({
        ...row,
        imageUrl: row.imageUrl || row.imageurl || row.image_url,
        condition: row.itemCondition || row.item_condition || row.condition,
        price: Number(row.price || 0),
        estPrice: Number(row.estPrice || 0),
        float: row.float ? Number(row.float) : null
    }));
}

function getTrendingItems() {
    return trendingItems;
}

async function findItemById(id) {
    const [rows] = await db.execute('CALL sp_GetMarketItemById(?)', [id]);
    if (rows[0].length === 0) return null;
    const row = rows[0][0];
    return {
        ...row,
        imageUrl: row.imageUrl || row.imageurl || row.image_url,
        condition: row.itemCondition || row.item_condition || row.condition,
        price: Number(row.price || 0),
        estPrice: Number(row.estPrice || 0),
        float: row.float ? Number(row.float) : null,
        inventoryItemId: row.inventoryItemId || row.inventory_item_id || row.inventory_id
    };
}

async function markItemAsSold(id, newOwnerId) {
    const item = await findItemById(id);
    if (!item) return null;

    // 1. Удаляем запись из маркетплейса через хранимую процедуру
    await db.execute('CALL sp_DeleteMarketItem(?)', [id]);

    // 2. Переводим скин новому владельцу через хранимую процедуру
    const inventoryId = item.inventoryItemId;
    if (inventoryId) {
        await db.execute('CALL sp_TransferMarketSale(?, ?)', [newOwnerId, inventoryId]);
    }

    const purchaseId = `PUR-${Date.now()}`;
    return { purchaseId, item };
}

async function getInventoryItems(ownerId) {
    const [rows] = await db.execute('CALL sp_GetInventoryByOwner(?)', [ownerId]);
    const items = rows[0];

    console.log(`\n[VT LOG] ${ownerId} kullanıcısı için toplam ${items.length} eşya getirildi`);
    if (items.length > 0) {
        console.log(`[VT LOG] İlk eşyanın resim bağlantısı: ${items[0].imageUrl}`);
    } else {
        console.log(`[VT LOG] Hiç eşya bulunamadı!`);
    }

    return items.map(row => ({
        ...row,
        imageUrl: row.imageUrl || row.imageurl || row.image_url,
        condition: row.itemCondition || row.item_condition || row.itemcondition || row.condition,
        estPrice: Number(row.estPrice || row.est_price || 0),
        float: row.float !== undefined ? Number(row.float) : (row.float_value ? Number(row.float_value) : null)
    }));
}

async function findInventoryItemById(id, ownerId) {
    const [rows] = await db.execute('CALL sp_GetInventoryItemByOwner(?, ?)', [id, ownerId]);
    if (rows[0].length === 0) return null;

    const row = rows[0][0];
    return {
        ...row,
        imageUrl: row.imageUrl || row.imageurl || row.image_url,
        condition: row.itemCondition || row.item_condition || row.itemcondition || row.condition,
        estPrice: Number(row.estPrice || row.est_price || 0),
        float: row.float !== undefined ? Number(row.float) : (row.float_value ? Number(row.float_value) : null)
    };
}

async function listInventoryItemForSale(id, price, ownerId) {
    const invItem = await findInventoryItemById(id, ownerId);
    if (!invItem) return null;

    const [resultRows] = await db.execute('CALL sp_ListInventoryItemForSale(?, ?)', [id, price]);
    const insertId = resultRows[0][0].insertId;

    return { ...invItem, price, status: 'listed', id: insertId };
}

async function cancelInventoryListing(id, ownerId) {
    const invItem = await findInventoryItemById(id, ownerId);
    if (!invItem) return null;

    await db.execute('CALL sp_CancelInventoryListing(?, ?)', [id, ownerId]);
    return { ...invItem, status: 'available' };
}


async function addFavoriteItem(userId, marketItemId) {
    await db.execute('CALL sp_AddFavoriteItem(?, ?)', [userId, marketItemId]);
    return { success: true };
}

async function removeFavoriteItem(userId, marketItemId) {
    await db.execute('CALL sp_RemoveFavoriteItem(?, ?)', [userId, marketItemId]);
    return { success: true };
}

async function getFavoriteItems(userId) {
    const [rows] = await db.execute('CALL sp_GetFavoriteItems(?)', [userId]);
    return rows[0].map(row => ({
        ...row,
        imageUrl: row.imageUrl || row.imageurl || row.image_url,
        condition: row.itemCondition || row.item_condition || row.condition,
        price: Number(row.price || 0),
        estPrice: Number(row.estPrice || 0),
        float: row.float ? Number(row.float) : null
    }));
}

async function transferInventoryItems(itemIds, fromUserId, toUserId) {
    if (!itemIds || itemIds.length === 0) return;

    for (const itemId of itemIds) {
        await db.execute('CALL sp_TransferSingleInventoryItem(?, ?, ?)', [itemId, fromUserId, toUserId]);
    }
}

module.exports = {
    getItemsForSale,
    getTrendingItems,
    findItemById,
    markItemAsSold,
    getInventoryItems,
    findInventoryItemById,
    listInventoryItemForSale,
    cancelInventoryListing,
    addFavoriteItem,
    removeFavoriteItem,
    getFavoriteItems,
    transferInventoryItems
};