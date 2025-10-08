const mysql = require('mysql2');
const fs = require('fs');

// Create MySQL connection without specifying database
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
});

// Read the schema file
const schema = fs.readFileSync('schema.sql', 'utf8');

// Split the schema into individual statements
const statements = schema.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);

// Execute statements sequentially
let index = 0;
function executeNext() {
  if (index >= statements.length) {
    console.log('Database and tables created successfully');
    db.end();
    return;
  }
  const stmt = statements[index] + ';';
  db.query(stmt, (err, results) => {
    if (err) {
      console.error('Error executing statement:', stmt, err);
      db.end();
    } else {
      index++;
      executeNext();
    }
  });
}

executeNext();
