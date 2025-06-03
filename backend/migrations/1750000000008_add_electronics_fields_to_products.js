export const up = (pgm) => {
  pgm.addColumns('products', {
    screen_size: { type: 'numeric', notNull: false },
    resolution: { type: 'varchar(32)', notNull: false },
    ram: { type: 'integer', notNull: false },
    storage: { type: 'integer', notNull: false },
    processor: { type: 'varchar(64)', notNull: false },
    battery: { type: 'integer', notNull: false },
    refresh_rate: { type: 'integer', notNull: false },
  });
};

export const down = (pgm) => {
  pgm.dropColumns('products', [
    'screen_size',
    'resolution',
    'ram',
    'storage',
    'processor',
    'battery',
    'refresh_rate',
  ]);
};
