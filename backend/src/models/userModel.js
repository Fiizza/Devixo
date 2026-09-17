import { pool } from "../config/db.js";

export const UserModel = {
  async create({ name, email, hashedPassword, verificationToken, verificationExpires }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, verification_token, verification_token_expires)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, avatar_url, is_verified, created_at`,
      [name, email, hashedPassword, verificationToken, verificationExpires]
    );
    return result.rows[0];
  },
  async findByEmail(email) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0];
  },
  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, email, avatar_url, is_verified, created_at FROM users WHERE id = $1`, [id]
    );
    return result.rows[0];
  },
  async updateProfile(id, { name, avatar_url }) {
    const result = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url)
       WHERE id = $3 RETURNING id, name, email, avatar_url, created_at`,
      [name, avatar_url, id]
    );
    return result.rows[0];
  },
  async findByVerificationToken(token) {
    const result = await pool.query(`SELECT * FROM users WHERE verification_token = $1`, [token]);
    return result.rows[0];
  },
  async markVerified(id) {
    const result = await pool.query(
      `UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL
       WHERE id = $1 RETURNING id, name, email, avatar_url, is_verified, created_at`, [id]
    );
    return result.rows[0];
  },
  async setVerificationToken(id, token, expires) {
    const result = await pool.query(
      `UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3
       RETURNING id, name, email`, [token, expires, id]
    );
    return result.rows[0];
  },
};
