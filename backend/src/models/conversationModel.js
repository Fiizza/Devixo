import { pool } from "../config/db.js";

export const ConversationModel = {
  async create(userId, title = "New Chat") {
    const result = await pool.query(
      `INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *`, [userId, title]
    );
    return result.rows[0];
  },
  async listByUser(userId) {
    const result = await pool.query(
      `SELECT id, title, created_at, updated_at FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );
    return result.rows;
  },
  async findById(id, userId) {
    const result = await pool.query(`SELECT * FROM conversations WHERE id = $1 AND user_id = $2`, [id, userId]);
    return result.rows[0];
  },
  async touch(id) {
    await pool.query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [id]);
  },
  async updateTitle(id, title) {
    await pool.query(`UPDATE conversations SET title = $1 WHERE id = $2`, [title, id]);
  },
  async delete(id, userId) {
    await pool.query(`DELETE FROM conversations WHERE id = $1 AND user_id = $2`, [id, userId]);
  },
};