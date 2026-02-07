const express = require("express")
const cors = require("cors")
const Database = require("better-sqlite3")
const path = require("path")

const app = express()
app.use(cors())
app.use(express.json())

// Create database file
const dbPath = path.join(__dirname, "stockforge.db")
const db = new Database(dbPath)

// Create tables
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)
`).run()

db.prepare(`
CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  qty INTEGER
)
`).run()

// Create default admin
const admin = db.prepare("SELECT * FROM users WHERE username = ?").get("admin")
if (!admin) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    .run("admin", "admin123")
}

// ---------- ROUTES ----------

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body

  const user = db
    .prepare("SELECT * FROM users WHERE username = ? AND password = ?")
    .get(username, password)

  if (!user) {
    return res.status(401).json({ error: "Invalid login" })
  }

  res.json({ success: true })
})

// GET MATERIALS
app.get("/materials", (req, res) => {
  const rows = db.prepare("SELECT * FROM materials").all()
  res.json(rows)
})

// ADD MATERIAL
app.post("/materials", (req, res) => {
  const { name, qty } = req.body
  db.prepare("INSERT INTO materials (name, qty) VALUES (?, ?)").run(name, qty)
  res.json({ success: true })
})

// ---------- START SERVER ----------
const PORT = 3000
app.listen(PORT, () => {
  console.log("StockForge server running on port " + PORT)
})
