const mysql = require('./node_modules/mysql2/promise');

async function main() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Vufk15Gi9',
            database: 'lis_trade'
        });
        
        console.log("Connected to MySQL!");
        
        const [inventory] = await connection.query("SELECT * FROM inventory LIMIT 5;");
        console.log("\nSample inventory rows:");
        console.log(inventory);

        const [marketItems] = await connection.query("SELECT * FROM market_items LIMIT 5;");
        console.log("\nSample market_items rows:");
        console.log(marketItems);

        await connection.end();
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
