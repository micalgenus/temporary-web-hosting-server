import redis from 'redis';
import redisMock from 'redis-mock';

interface RedisOption {
  host?: string;
  port: number;
  inMemory?: boolean;
}

class RedisClient {
  private client: redis.RedisClient;

  constructor({ host, port, inMemory }: RedisOption = { port: 6379 }) {
    const redisOption = {};

    this.client = (inMemory ? redisMock : redis).createClient(port, host, redisOption) as redis.RedisClient;
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
          rejects(err);
        } else {
          resolve(reply);
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
