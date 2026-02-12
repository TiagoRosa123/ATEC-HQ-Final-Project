const pool = require('./db');

async function debugUser() {
    try {
        const res = await pool.query("SELECT * FROM utilizadores WHERE email = 'tiago.formador@atec.pt'");
        if (res.rows.length > 0) {
            console.log("User found:");
            console.log(JSON.stringify(res.rows[0], null, 2));
        } else {
            console.log("User NOT found!");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

debugUser();
