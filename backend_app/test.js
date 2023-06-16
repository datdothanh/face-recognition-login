const crypto = require("crypto");

// Generate a random key for JWT with a length of 50 to 60 characters
const tokenKey = crypto.randomBytes(32).toString("base64").slice(0, 60);

console.log(tokenKey);

const privateKey = crypto.randomBytes(16).toString("hex");

console.log(privateKey);
