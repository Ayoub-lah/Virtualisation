const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");

const app  = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let db;

function connectWithRetry() {
  db = mysql.createConnection({
    host:     process.env.DB_HOST     || "db",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "rootpassword",
    database: process.env.DB_NAME     || "bigdata_db",
  });
  db.connect((err) => {
    if (err) {
      console.error("[ERROR] MySQL connection failed — retry in 5s...", err.message);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log("[OK] MySQL connected — bigdata_db");
      initDB();
    }
  });
  db.on("error", (err) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      connectWithRetry();
    } else {
      throw err;
    }
  });
}

function initDB() {
  const sql = `
    CREATE TABLE IF NOT EXISTS donnees (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      nom         VARCHAR(255) NOT NULL,
      valeur      FLOAT        NOT NULL,
      categorie   VARCHAR(100) NOT NULL,
      date_ajout  DATETIME     DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("[ERROR] initDB:", err);
    else      console.log("[OK] Table donnees ready");
  });
}

connectWithRetry();

app.get("/api/status", (req, res) => {
  res.json({ status: "OK", message: "API Big Data fonctionne", timestamp: new Date().toISOString() });
});

app.get("/api/donnees", (req, res) => {
  db.query("SELECT * FROM donnees ORDER BY date_ajout DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/donnees", (req, res) => {
  const { nom, valeur, categorie } = req.body;
  if (!nom || !valeur || !categorie) {
    return res.status(400).json({ error: "nom, valeur et categorie requis" });
  }
  db.query(
    "INSERT INTO donnees (nom, valeur, categorie) VALUES (?, ?, ?)",
    [nom, valeur, categorie],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, nom, valeur, categorie });
    }
  );
});

app.delete("/api/donnees/:id", (req, res) => {
  db.query("DELETE FROM donnees WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Donnee supprimee" });
  });
});

app.listen(PORT, () => {
  console.log(`[OK] Backend Node.js listening on port ${PORT}`);
});
