export const up = (pgm) => {
  pgm.addColumn('orders', {
    email: { type: 'varchar(100)' }
  });
  // Дозволити user_id бути NULL
  pgm.alterColumn('orders', 'user_id', { notNull: false });
};

export const down = (pgm) => {
  pgm.dropColumn('orders', 'email');
  // Повернути NOT NULL для user_id (якщо потрібно)
  pgm.alterColumn('orders', 'user_id', { notNull: true });
};
