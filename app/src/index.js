const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'DevOps platform service running' });
});

res.status(500).json({ status: 'broken' });

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Service listening on port ${port}`);
  });
}

module.exports = app;
