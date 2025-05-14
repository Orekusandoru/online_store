export const up = (pgm) => {
  // pgm.addColumn('orders', { email: { type: 'varchar(100)' } }); // вже існує, не додаємо!
  pgm.alterColumn('orders', 'user_id', { notNull: false });
};

export const down = (pgm) => {
  // pgm.dropColumn('orders', 'email'); // не видаляємо, бо не додавали тут
  pgm.alterColumn('orders', 'user_id', { notNull: true });
};
