const pool = require("../database.js");
async function getUserByEmail(email) {
  const query = "SELECT email FROM users WHERE email = ?";
  const [userRows] = await pool.query(query, [email]);
  return userRows[0] || null;
}
async function createUser(name, email, password) {
  const query = "INSERT INTO users (provider, name, email, password, picture, role) VALUES (?, ?, ?, ?, ?, ?)";
  const [userRows] = await pool.query(query, ["native", name, email, password, "", "user"]);
  const id = userRows.insertId;
  return {
    id: id,
    provider: "native",
    name: name,
    email: email,
    picture: "",
  };
}
async function getUserPassword(email) {
  const query = "SELECT password FROM users WHERE email = ?";
  const [userRows] = await pool.query(query, [email]);
  return userRows[0].password || null;
}
async function authenticateUser(email) {
  const query = "SELECT id, provider, name, email, picture, role FROM users WHERE email = ?";
  const [userRows] = await pool.query(query, [email]);
  return userRows[0] || null;
}
async function getUserProfile(userId) {
  const query = "SELECT provider, name, email, picture FROM users WHERE id = ?";
  const [userRows] = await pool.query(query, [userId]);
  return userRows[0] || null;
}
module.exports = {
  getUserByEmail,
  createUser,
  authenticateUser,
  getUserProfile,
  getUserPassword,
};
