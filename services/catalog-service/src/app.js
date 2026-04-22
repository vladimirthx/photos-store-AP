const express = require('express');
const cors = require('cors');

const catalogRoutes = require('./routes/catalogRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/catalog', catalogRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Catalog Service running on port ${PORT}`);
});