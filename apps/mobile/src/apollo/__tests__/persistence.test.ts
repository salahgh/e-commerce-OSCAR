import AsyncStorage from '@react-native-async-storage/async-storage';
import { gql, InMemoryCache } from '@apollo/client';
import { createPersistor, CACHE_KEY } from '../persistence';

const PING = gql`
  query Ping {
    ping
  }
`;

beforeEach(async () => {
  await AsyncStorage.clear();
});

function cacheWithData(): InMemoryCache {
  const cache = new InMemoryCache();
  cache.writeQuery({ query: PING, data: { ping: 'pong' } });
  return cache;
}

describe('createPersistor', () => {
  it('round-trips the cache through persist() then restore()', async () => {
    const source = cacheWithData();
    await createPersistor(source).persist();

    const target = new InMemoryCache();
    await createPersistor(target).restore();

    expect(target.readQuery({ query: PING })).toEqual({ ping: 'pong' });
  });

  it('restore() is a no-op when nothing is stored', async () => {
    const cache = new InMemoryCache();
    await expect(createPersistor(cache).restore()).resolves.toBeUndefined();
    expect(cache.readQuery({ query: PING })).toBeNull();
  });

  it('restore() swallows corrupt stored JSON', async () => {
    await AsyncStorage.setItem(CACHE_KEY, '{not valid json');
    const cache = new InMemoryCache();
    await expect(createPersistor(cache).restore()).resolves.toBeUndefined();
  });

  it('purge() removes the persisted snapshot', async () => {
    const source = cacheWithData();
    const persistor = createPersistor(source);
    await persistor.persist();
    await persistor.purge();

    const target = new InMemoryCache();
    await createPersistor(target).restore();
    expect(target.readQuery({ query: PING })).toBeNull();
  });
});
