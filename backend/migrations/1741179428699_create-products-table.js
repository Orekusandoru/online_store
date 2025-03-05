export const up = (pgm) => {
    pgm.createTable('categories', {
      id: 'id',
      name: { type: 'varchar(100)', notNull: true, unique: true }
    });
  
    pgm.createTable('products', {
      id: 'id',
      name: { type: 'varchar(255)', notNull: true },
      description: { type: 'text' },
      price: { type: 'numeric', notNull: true },
      category_id: { type: 'integer', notNull: true, references: '"categories"(id)', onDelete: 'cascade' },
      image_url: { type: 'varchar(500)', notNull: true },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
  };
  
  export const down = (pgm) => {
    pgm.dropTable('products');
    pgm.dropTable('categories');
  };
  