import express from 'express';
import p from 'path';
import multer from 'multer';

import { getUniqueRandomHash } from '@/core/utils';
import redis from '@/core/redis';

const app = express();
const upload = multer({});

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
    redis.hmset(namespace, { [p.resolve('/' + path)]: text, password, type: 'text' });

    res.json({ namespace, password });
  } catch (err) {
    next(err);
  }
});

app.post('/upload/file', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    res.status(500).send('Invalid file');
  }

  try {
    const { namespace, password } = await getUniqueRandomHash();
    await redis.hmset(namespace, { [p.resolve('/' + req.file.originalname)]: req.file.buffer.toString('base64'), password, type: 'file' });

    res.json({ namespace, password });
  } catch (err) {
    next(err);
  }
});

app.get('/download/:namespace/:path(*)', async (req, res, next) => {
  try {
    const { namespace, path } = req.params;
    const findPath = p.resolve('/' + path);

    const texts = await redis.hmget(namespace, findPath, 'type');
    const { type } = texts;

    if (!texts[findPath]) {
      res.status(404);
    }

    let text = texts[findPath];
    switch (type) {
      case 'text':
        break;
      case 'file':
        text = new Buffer(text, 'base64').toString('ascii');
        break;
      default:
        throw new Error('Invalid item');
    }

    res.send(text);
  } catch (err) {
    next(err);
  }
});

app.use(function (err, req, res, next) {
  res.status(500).send(process.env.NODE_ENV === 'test' ? JSON.stringify(err.stack) : '');
});

export default app;
