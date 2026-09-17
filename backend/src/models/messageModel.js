import { pool } from "../config/db.js";

export const MessageModel = {
  async create(conversationId, role, content) {
    const result = await pool.query(
      `INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *`,
      [conversationId, role, content]
    );
    return result.rows[0];
  },
  async listByConversation(conversationId) {
    const result = await pool.query(
      `SELECT id, role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [conversationId]
    );
    return result.rows;
  },
};
