export const up = (pgm) => {
  pgm.addColumns('products', {
    rating: { type: 'numeric(3,2)', notNull: false, default: 0 },
    rating_count: { type: 'integer', notNull: false, default: 0 },
    popularity: { type: 'integer', notNull: false, default: 0 }
  });
};

export const down = (pgm) => {
  pgm.dropColumns('products', ['rating', 'rating_count', 'popularity']);
};
