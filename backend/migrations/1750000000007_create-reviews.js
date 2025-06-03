export const up = (pgm) => {
  pgm.createTable('reviews', {
    id: 'id',
    product_id: { type: 'integer', notNull: true, references: 'products(id)', onDelete: 'cascade' },
    user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'cascade' },
    rating: { type: 'integer', notNull: true },
    comment: { type: 'text', notNull: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });
  pgm.addConstraint('reviews', 'unique_review_per_user_product', {
    unique: ['product_id', 'user_id']
  });
};

export const down = (pgm) => {
  pgm.dropTable('reviews');
};
