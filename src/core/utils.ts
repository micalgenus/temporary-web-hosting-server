import crypto from 'crypto';
import redis from '@/core/redis';

interface RedisHash {
  namespace: string;
  password: string;
}

const slicePivot = 20;

const splitHash = (hash: string): RedisHash => {
  const namespace = hash.slice(0, slicePivot);
  const password = hash.slice(slicePivot);

  return { namespace, password };
};

export const getUniqueRandomHash = async (seed?: string) => {
  let hash: RedisHash;
  while (!hash) {
    hash = splitHash(
      crypto
        .createHash('sha256')
        .update(seed || Math.random().toString())
        .digest('hex'),
    );

    if (!seed) {
      if (await redis.exists(hash.namespace)) {
        hash = undefined;
      } else {
        redis.expire(hash.namespace, 60);
      }
    }
  }

  return hash;
};
