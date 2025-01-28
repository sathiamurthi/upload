const express = require('express');
const uploadRoutes = require('./routes/upload.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 