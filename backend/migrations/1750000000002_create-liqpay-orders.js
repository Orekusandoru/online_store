exports.up = (pgm) => {
  pgm.createTable("liqpay_orders", {
    id: "id",
    order_id: { type: "integer", notNull: true, references: "orders(id)", onDelete: "cascade" },
    liqpay_order_id: { type: "varchar(64)", notNull: true, unique: true },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });
  pgm.addConstraint("liqpay_orders", "liqpay_orders_order_id_unique", {
    unique: ["order_id"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("liqpay_orders");
};
