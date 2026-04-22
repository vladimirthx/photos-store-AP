const jwt = require('jsonwebtoken');

const login = (username, password) => {
  // Simulación (luego va DB)
  if (username === "admin" && password === "1234") {
    const token = jwt.sign(
      { user: username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token;
  }

  return null;
};

module.exports = {
  login
};