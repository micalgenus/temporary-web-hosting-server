import chai from 'chai';
import chaiHttp from 'chai-http';
import { Response } from 'superagent';

import app from '@/app';

chai.use(chaiHttp);

interface ChaiRequest {
  header?: { [key: string]: string };
  body?: { [key: string]: any };
}

export const postRequest = async (path: string, { header, body }: ChaiRequest = {}) => {
  const request = chai.request(app).post(path);

  if (header) {
    for (const [key, value] of Object.entries(header)) {
      request.set(key, value);
    }
  }

  if (body) {
    request.send(body);
  }

  return new Promise<Response>((resolve, reject) => {
    request.end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};
