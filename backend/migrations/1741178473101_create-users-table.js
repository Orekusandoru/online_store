export const up = (pgm) => {
    pgm.createTable('users', {
      id: 'id',
      email: { type: 'varchar(255)', notNull: true, unique: true },
      password: { type: 'text', notNull: true },
      role: { type: 'varchar(50)', notNull: true, default: pgm.func("'user'")},
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
  };
  
  export const down = (pgm) => {
    pgm.dropTable('users');
  };
  