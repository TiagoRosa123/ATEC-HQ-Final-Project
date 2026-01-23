const pool = require('./db');

async function checkAreas() {
    try {
        const res = await pool.query('SELECT * FROM areas');
        console.log('Areas:', res.rows);
        pool.end();
    } catch (err) {
        console.error(err.message);
    }
}

checkAreas();
