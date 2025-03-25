import mysql from "mysql2/promise";
import "dotenv/config";

export default async function handler(req, res) {
  const allowedOrigins = ["https://users-panel-react.vercel.app", "http://localhost:5173"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { page = 1, limit = 20 } = req.body;
    const offset = (page - 1) * limit;

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    try {
      const [rows] = await connection.execute("SELECT * FROM User LIMIT ? OFFSET ?", [
        limit,
        offset,
      ]);

      const [countResult] = await connection.execute("SELECT COUNT(*) as total FROM User");
      const total = countResult[0].total;
      const hasMore = offset + limit < total;

      console.log("page:", page, "limit:", limit, "offset:", offset);

      res.status(200).json({ users: rows, hasMore });
    } catch (error) {
      res.status(500).json({ error: "Ошибка БД" });
    } finally {
      await connection.end();
    }
  }

  if (req.method === "PATCH") {
    const { id, name, jobTitle, department, company } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Необходим ID пользователя" });
    }

    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      });

      const updates = [];
      const values = [];

      updates.push("name = ?", "jobTitle = ?", "department = ?", "company = ?");
      values.push(name, jobTitle, department, company);

      const sql = `UPDATE User SET ${updates.join(", ")} WHERE id = ?`;
      values.push(id);

      await connection.execute(sql, values);
      res.status(200).json({ message: "успешно обновили данные пользователя" });
    } catch (e) {
      console.error("PATCH error:", error);
      res.status(500).json({ error: "не удалось обновить данные пользователя" });
    } finally {
      if (connection) await connection.end();
    }
  }
  res.status(405).end();
}
