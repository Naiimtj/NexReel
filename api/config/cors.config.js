const cors = require("cors");

module.exports = cors({
  origin: ['http://127.0.0.1:5173' ,'http://127.0.0.1:5172','http://localhost:3000','http://127.0.0.1:3000'],
  credentials: true,
});
