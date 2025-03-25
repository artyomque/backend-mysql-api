import mysql from "mysql2/promise";
import "dotenv/config";

export default async function handler(req, res) {
  const allowedOrigins = ["https://users-panel-react.vercel.app", "http://localhost:5173"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    try {
      const [rows] = await connection.execute("SELECT * FROM User LIMIT 50");
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    } finally {
      await connection.end();
    }
  } else {
    res.status(405).end();
  }
}
