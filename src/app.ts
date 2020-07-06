import express from 'express';
import p from 'path';

import { getUniqueRandomHash } from '@/core/utils';
import redis from '@/core/redis';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// For kubernetes
app.get('/healthz', (req, res) => {
  res.send('OK');
});

// For test
app.post('/ping', (req, res) => {
  res.send('Pong !!');
});

app.post('/upload/text', async (req, res, next) => {
  const { path, text } = req.body;
  if (!path || !text) {
    return res.status(500).send('Invalid url');
  }

  try {
    const { namespace, password } = await getUniqueRandomHash();
    redis.hmset(namespace, { [p.resolve('/' + path)]: text, password });

    res.json({ namespace, password });
  } catch (err) {
    next(err);
  }
});

app.get('/download/:namespace/:path(*)', async (req, res, next) => {
  try {
    const { namespace, path } = req.params;
    const findPath = p.resolve('/' + path);

    const texts = await redis.hmget(namespace, findPath);

    if (!texts[findPath]) {
      res.status(404);
    }

    res.send(texts[findPath]);
  } catch (err) {
    next(err);
  }
});

app.use(function (err, req, res, next) {
  console.error(err.stack, err, res, next);
  res.status(500).send(process.env.NODE_ENV === 'test' ? JSON.stringify(err.stack) : '');
});

export default app;
