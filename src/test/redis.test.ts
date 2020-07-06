import redis from '@/core/redis';
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

  it('Expire', async () => {
    const result = await redis.expire(testKey, 1);

    assert.isTrue(result);
    await new Promise((resolve) => setTimeout(() => resolve(null), 1000));
  });

  it('Exists', async () => {
    const result = await redis.exists(testKey);

    assert.isFalse(result);
  });

  describe('HMSET', async () => {
    it('key = undefined', async () => {
      try {
        await redis.hmset(undefined, { testKey });
        assert.fail('Error');
      } catch (err) {
        assert.equal(err.message, 'key is empty: undefined');
      }
    });
  });
});
