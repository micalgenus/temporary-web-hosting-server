import express from 'express';

const app = express();

// For kubernetes
app.get('/healthz', (req, res) => {
  res.send('OK');
});

// For test
app.post('/ping', (req, res) => {
  res.send('Pong !!');
});

export default app;
