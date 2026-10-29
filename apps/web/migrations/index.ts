import * as migration_20260812_101916 from './20260812_101916';
import * as migration_20261029_095603_policies_sections from './20261029_095603_policies_sections';

export const migrations = [
  {
    up: migration_20260812_101916.up,
    down: migration_20260812_101916.down,
    name: '20260812_101916',
  },
  {
    up: migration_20261029_095603_policies_sections.up,
    down: migration_20261029_095603_policies_sections.down,
    name: '20261029_095603_policies_sections'
  },
];
