import redis from '@/redis';
import moment from 'moment';
import { assert } from 'chai';

describe('Redis', () => {
  const testKey = 'testKey';
  const testValue = moment().toISOString();
  it('Miss', async () => {
    const result = await redis.get(testKey);

    assert.isNull(result);
  });

  it('Set', async () => {
    const result = await redis.set(testKey, testValue);

    assert.equal(result, 'OK');
  });

  it('Hit', async () => {
    const result = await redis.get(testKey);

    assert.equal(result, testValue);
  });
});
