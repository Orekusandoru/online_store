export const up = (pgm) => {
    pgm.createTable('orders', {
      id: 'id',
      user_id: {
        type: 'integer',
        notNull: true,
        references: '"users"(id)',
        onDelete: 'cascade',
      },
      total_price: { type: 'numeric', notNull: true },
      status: {
        type: 'varchar(20)',
        notNull: true,
        default: 'pending',
      },
      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('current_timestamp'),
      },
      updated_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('current_timestamp'),
      },
    });
  
    pgm.createTable('order_items', {
      id: 'id',
      order_id: {
        type: 'integer',
        notNull: true,
        references: '"orders"(id)',
        onDelete: 'cascade',
      },
      product_id: {
        type: 'integer',
        notNull: true,
        references: '"products"(id)',
        onDelete: 'cascade',
      },
      quantity: { type: 'integer', notNull: true },
      price: { type: 'numeric', notNull: true }, 
    });
  };
  
  export const down = (pgm) => {
    pgm.dropTable('order_items');
    pgm.dropTable('orders');
  };
  