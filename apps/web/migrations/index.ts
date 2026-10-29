import * as migration_20260812_101916 from './20260812_101916';
import * as migration_20261029_095603_policies_sections from './20261029_095603_policies_sections';
import * as migration_20261029_111316_add_products_cod_available from './20261029_111316_add_products_cod_available';

export const migrations = [
  {
    up: migration_20260812_101916.up,
    down: migration_20260812_101916.down,
    name: '20260812_101916',
  },
  {
    up: migration_20261029_095603_policies_sections.up,
    down: migration_20261029_095603_policies_sections.down,
    name: '20261029_095603_policies_sections',
  },
  {
    up: migration_20261029_111316_add_products_cod_available.up,
    down: migration_20261029_111316_add_products_cod_available.down,
    name: '20261029_111316_add_products_cod_available'
  },
];
