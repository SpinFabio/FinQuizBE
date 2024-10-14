import express from 'express';
import mysql from 'mysql2/promise';

// Crea l'app Express
const app = express();
const port = 3000;

// Connessione al database MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test'
};

async function connectToDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('Connesso al database MySQL!');
  return connection;
}

app.get('/', async (req, res) => {
  const connection = await connectToDatabase();
  const [rows] = await connection.query('SELECT * FROM users');
  res.json(rows);
});

app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
