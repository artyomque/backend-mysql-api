import express from "express";
import mysql from "mysql2/promise";

export default async function handler(req, res) {
  const app = express();

  app.get("/api/data", async (req, res) => {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    try {
      const [rows] = await connection.execute("SELECT * FROM users LIMIT 50");
      res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Database query failed" });
    } finally {
      connection.end();
    }
  });

  app(req, res);
}
