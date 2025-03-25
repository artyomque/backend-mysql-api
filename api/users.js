import mysql from "mysql2/promise";
import "dotenv/config";

export default async function handler(req, res) {
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
