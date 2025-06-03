export const up = (pgm) => {
  pgm.createTable('archived_products', {
    id: { type: 'integer', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    price: { type: 'numeric', notNull: true },
    category_id: { type: 'integer', notNull: true },
    image_url: { type: 'varchar(500)', notNull: true },
    created_at: { type: 'timestamp', notNull: true },
    updated_at: { type: 'timestamp', notNull: true },
    rating: { type: 'numeric(3,2)' },
    rating_count: { type: 'integer' },
    popularity: { type: 'integer' },
    screen_size: { type: 'numeric' },
    resolution: { type: 'varchar(32)' },
    ram: { type: 'integer' },
    storage: { type: 'integer' },
    processor: { type: 'varchar(64)' },
    battery: { type: 'integer' },
    refresh_rate: { type: 'integer' },
    archived_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') }
  });
};

export const down = (pgm) => {
  pgm.dropTable('archived_products');
};
