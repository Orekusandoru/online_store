export const up = (pgm) => {
  pgm.addColumn('orders', {
    payment_type: { type: 'varchar(30)' }
  });
};

export const down = (pgm) => {
  pgm.dropColumn('orders', 'payment_type');
};
