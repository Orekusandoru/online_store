export const up = (pgm) => {
  pgm.createTable("favorites", {
    id: "id",
    user_id: { type: "integer", notNull: true, references: "users(id)", onDelete: "cascade" },
    product_id: { type: "integer", notNull: true, references: "products(id)", onDelete: "cascade" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });
  pgm.addConstraint("favorites", "favorites_user_product_unique", {
    unique: ["user_id", "product_id"],
  });
};

export const down = (pgm) => {
  pgm.dropTable("favorites");
};
