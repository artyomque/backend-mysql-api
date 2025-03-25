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
      res.status(500).json({ error: "Ошибка БД" });
    } finally {
      await connection.end();
    }
  } else {
    res.status(405).end();
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

      if (name) {
        updates.push("name = ?");
        values.push(name);
      }

      if (jobTitle) {
        updates.push("jobTitle = ?");
        values.push(jobTitle);
      }

      if (department) {
        updates.push("department = ?");
        values.push(department);
      }

      if (company) {
        updates.push("company = ?");
        values.push(company);
      }

      const sql = `UPDATE User SET ${updates.join(", ")} WHERE id = ?`;
      values.push(id);

      await connection.execute(sql, values);
      res.status(200).json({ message: "успешно обновили данные пользователя" });
    } catch (e) {
      console.error("PATCH error:", error);
      res.status(500).json({ error: "не удалось обновить данные пользователя" });
    }
  }
}
