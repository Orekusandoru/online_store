export const up = (pgm) => {
  pgm.addColumn('users', {
    name: { type: 'varchar(100)' }
  });
};

export const down = (pgm) => {
  pgm.dropColumn('users', 'name');
};
