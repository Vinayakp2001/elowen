import * as migration_20260812_101916 from './20260812_101916';

export const migrations = [
  {
    up: migration_20260812_101916.up,
    down: migration_20260812_101916.down,
    name: '20260812_101916'
  },
];
