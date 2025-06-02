export const up = (pgm) => {
  pgm.createTable("carts", {
    id: "id",
    user_id: { type: "integer", references: "users(id)", onDelete: "cascade" },
    items: { type: "jsonb", notNull: true, default: pgm.func("jsonb_build_array()") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });
  pgm.addConstraint("carts", "carts_user_id_unique", {
    unique: ["user_id"],
  });
};

export const down = (pgm) => {
  pgm.dropTable("carts");
};
