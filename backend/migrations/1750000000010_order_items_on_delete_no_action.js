export const up = (pgm) => {

  pgm.dropConstraint('order_items', 'order_items_product_id_fkey');

  pgm.addConstraint('order_items', 'order_items_product_id_fkey', {
    foreignKeys: {
      columns: 'product_id',
      references: 'products(id)',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  });
};

export const down = (pgm) => {

  pgm.dropConstraint('order_items', 'order_items_product_id_fkey');
  pgm.addConstraint('order_items', 'order_items_product_id_fkey', {
    foreignKeys: {
      columns: 'product_id',
      references: 'products(id)',
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION',
    },
  });
};
