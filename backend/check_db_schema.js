const db = require('c:/Users/Aivaz/Desktop/TradeStrike/backend/config/db');

async function main() {
    try {
        console.log("=== DESCRIBE users ===");
        const [columns] = await db.execute("DESCRIBE users");
        console.log(JSON.stringify(columns, null, 2));

        console.log("\n=== SHOW CREATE PROCEDURE sp_GetUserById ===");
        const [procId] = await db.execute("SHOW CREATE PROCEDURE sp_GetUserById");
        console.log(procId[0]);

        console.log("\n=== SHOW CREATE PROCEDURE sp_UpdateUserSettings ===");
        const [procSettings] = await db.execute("SHOW CREATE PROCEDURE sp_UpdateUserSettings");
        console.log(procSettings[0]);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
