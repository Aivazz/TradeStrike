const db = require('./config/db');

async function main() {
    try {
        console.log("=== CONNECTED TO DATABASE ===");

        const [users] = await db.execute("SELECT id, username FROM users");
        console.log("\n=== USERS ===");
        console.log(users);

        await db.end();
    } catch (e) {
        console.error(e);
    }
}

main();
