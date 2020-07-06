import redis from 'redis';
import redisMock from 'redis-mock';
import _ from 'lodash';

interface RedisOption {
  host?: string;
  port: number;
  inMemory?: boolean;
}

const MAX_SECONDS = 60 * 60 * 6; // 6 hours

const getExpireSeconds = (seconds: number): number => {
  // return 0 < seconds < MAX_SECONDS
  return Math.min(Math.max(0, seconds), MAX_SECONDS);
};

class RedisClient {
  private client: redis.RedisClient;

  constructor({ host, port, inMemory }: RedisOption = { port: 6379 }) {
    const redisOption = {};

    this.client = (inMemory ? redisMock : redis).createClient(port, host, redisOption) as redis.RedisClient;
  }

  public async expire(key: string, seconds: number = 0) {
    return new Promise<boolean>((resolve, rejects) => {
      this.client.expire(key, getExpireSeconds(seconds), (err, reply) => {
        if (err) {
          rejects(err);
        } else {
          resolve(!!reply);
        }
      });
    });
  }

  public async exists(key: string): Promise<boolean> {
    return new Promise<boolean>((resolve, rejects) => {
      this.client.exists(key, (err, reply) => {
        if (err) {
          rejects(err);
        } else {
          resolve(!!reply);
        }
      });
    });
  }

  public async set(key: string, value: string): Promise<'OK'> {
    return new Promise<'OK'>((resolve, rejects) => {
      this.client.set(key, value, (err, reply) => {
        if (err) {
          rejects(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  public async get(key: string): Promise<string | null> {
    return new Promise<string | null>((resolve, rejects) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          // rejects(err);
          console.error(err);
          resolve(null);
        } else {
          resolve(reply);
        }
      });
    });
  }

  public async hmset(key: string, data: { [field: string]: string }, expireSeconds: number = MAX_SECONDS): Promise<'OK'> {
    if (!key) {
      throw new Error('key is empty: ' + key);
    }
    return new Promise<'OK'>((resolve, rejects) => {
      this.client.hmset(
        key,
        _.flatten(Object.entries(data)),
        (async (err: any, reply: 'OK' | undefined) => {
          if (err) {
            rejects(err);
          } else {
            await this.expire(key, expireSeconds);
            resolve(reply);
          }
        }).bind(this),
      );
    });
  }

  public async hmget<T extends { [item: string]: string }>(key: string, ...items: Array<keyof T>): Promise<T> {
    return new Promise<T>((resolve, rejects) => {
      this.client.hmget(key, ...(items as string[]), async (err, reply) => {
        if (err) {
          // rejects(err)
          resolve(null);
        } else {
          const result: any = {};
          for (const index in reply) {
            result[items[index]] = reply[index];
          }
          resolve(result);
        }
      });
    });
  }

  public async hgetall<T extends { [item: string]: any }>(key: string): Promise<T> {
    return new Promise<T>((resolve, rejects) => {
      this.client.hgetall(key, async (err, reply) => {
        if (err) {
          // rejects(err)
          resolve(null);
        } else {
          resolve(reply as T);
        }
      });
    });
  }
}

export default new RedisClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || (6379).toString(), 10),
  inMemory: process.env.NODE_ENV === 'test',
});
