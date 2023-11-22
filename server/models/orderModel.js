const pool = require("../database.js");
async function saveCheckoutDetail(connection, order) {
  try {
    const orderQuery =
      "INSERT INTO stylish.orders (user_id, shipping_method, payment_method, subtotal, freight, total, recipient_name, recipient_phone, recipient_email, recipient_address, delivery_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const [orderResult] = await connection.query(orderQuery, [
      order.userId,
      order.shipping,
      order.payment,
      order.subtotal,
      order.freight,
      order.total,
      order.recipient.name,
      order.recipient.phone,
      order.recipient.email,
      order.recipient.address,
      order.recipient.time,
    ]);
    const orderId = orderResult.insertId;
    const orderItemQuery =
      "INSERT INTO stylish.order_items (order_id, product_id, name, price, color_code, color_name, size, qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    for (const item of order.list) {
      await connection.query(orderItemQuery, [
        orderId,
        item.id,
        item.name,
        item.price,
        item.color.code,
        item.color.name,
        item.size,
        item.qty,
      ]);
    }
    const getCreatedAtQuery = "SELECT created_at FROM stylish.orders WHERE order_id = ?";
    const [createdResult] = await connection.query(getCreatedAtQuery, [orderId]);
    const createdAt = createdResult[0].created_at;
    return [orderId, createdAt];
  } catch (error) {
    console.error("saveCheckoutDetail Error", error);
    throw error;
  }
}
async function checkProductStock(connection, productId, colorCode, size, qty) {
  try {
    const query = "SELECT stock FROM product_variants WHERE product_id = ? AND color_code = ? AND size = ?";
    const [results] = await connection.query(query, [productId, colorCode, size]);
    console.log(results);
    if (results.length > 0) {
      const currentStock = results[0].stock;
      return currentStock >= qty;
    } else {
      return false;
    }
  } catch (error) {
    console.error("checkProductStock Error", error);
    throw error;
  }
}
async function updateProductVariants(connection, productId, colorCode, size, qty) {
  try {
    const isStockAvailable = await checkProductStock(connection, productId, colorCode, size, qty);
    if (!isStockAvailable) {
      throw new Error("Not enough stock");
    }
    const query = "UPDATE product_variants SET stock = stock - ? WHERE product_id = ? AND color_code = ? AND size = ?";
    await connection.query(query, [qty, productId, colorCode, size]);
  } catch (error) {
    console.error("updateProductVariants Error", error);
    throw error;
  }
}
async function getOrderHistory(userId) {
  try {
    const query = `SELECT 
      o.order_id,
      o.user_id,
      o.shipping_method,
      o.payment_method,
      o.subtotal,
      o.freight,
      o.total,
      o.recipient_name,
      o.recipient_phone,
      o.recipient_email,
      o.recipient_address,
      o.delivery_time,
      o.created_at,
      GROUP_CONCAT(
          JSON_OBJECT(
              'item_id', oi.item_id,
              'product_id', oi.product_id,
              'name', oi.name,
              'price', oi.price,
              'color_name', oi.color_name,
              'color_code', oi.color_code,
              'size', oi.size,
              'qty', oi.qty
          )
      ) AS items
    FROM
      orders o
    JOIN
      order_items oi ON o.order_id = oi.order_id
    WHERE
      o.user_id = ?
    GROUP BY
      o.order_id;`;
    const [orderRows] = await pool.query(query, [1]);
    const ordersWithArrayItems = orderRows.map((order) => {
      return {
        ...order,
        items: JSON.parse(`[${order.items}]`),
      };
    });
    return ordersWithArrayItems;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  checkProductStock,
  saveCheckoutDetail,
  updateProductVariants,
  getOrderHistory,
};
