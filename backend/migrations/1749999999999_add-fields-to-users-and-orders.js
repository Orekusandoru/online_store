export const up = (pgm) => {
  // Додаємо поля до users
  pgm.addColumns('users', {
    phone: { type: 'varchar(30)' },
    address: { type: 'varchar(255)' }
  });

  // Додаємо поля до orders
  pgm.addColumns('orders', {
    name: { type: 'varchar(100)' },
    phone: { type: 'varchar(30)' },
    address: { type: 'varchar(255)' }
  });
};

export const down = (pgm) => {
  pgm.dropColumns('users', ['phone', 'address']);
  pgm.dropColumns('orders', ['name', 'phone', 'address']);
};
