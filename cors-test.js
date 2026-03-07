const express = require('express');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: [
    'https://nekxuz.in',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

console.log("Initializing CORS with options:", corsOptions);
app.use(cors(corsOptions));

app.get('/test', (req, res) => {
  console.log("GET /test called");
  res.json({ message: 'CORS is working!' });
});

app.listen(3000, () => {
  console.log("CORS test server running on port 3000");
});
