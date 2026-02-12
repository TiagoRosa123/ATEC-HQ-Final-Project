const pool = require('./db');

async function lowerEmails() {
    try {
        console.log("Applying lowercase to all existing emails...");
        const res = await pool.query("UPDATE utilizadores SET email = LOWER(TRIM(email))");
        console.log(`Updated ${res.rowCount} users.`);
    } catch (err) {
        console.error("Error updating emails:", err);
    } finally {
        pool.end();
    }
}

lowerEmails();
