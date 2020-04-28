import express from 'express';

const app = express();

app.post('/ping', (req, res) => {
  res.send('Pong !!');
});

export default app;
