const pool = require("../database.js");
async function createProduct(productData) {
  const [productResult] = await pool.query(
    "INSERT INTO products (category, title, description, price, texture, wash, place, note, story, main_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      productData.category,
      productData.title,
      productData.description,
      productData.price,
      productData.texture,
      productData.wash,
      productData.place,
      productData.note,
      productData.story,
      productData.main_image,
    ],
  );
  const productId = productResult.insertId;
  const colorInsertions = productData.colors.map((color) => {
    return pool.query("INSERT INTO product_colors (product_id, name, code) VALUES (?, ?, ?)", [
      productId,
      color.name,
      color.code,
    ]);
  });
  const variantInsertions = productData.variants.map((variant) => {
    return pool.query("INSERT INTO product_variants (product_id, color_code, size, stock) VALUES (?, ?, ?, ?)", [
      productId,
      variant.color_code,
      variant.size,
      variant.stock,
    ]);
  });
  const imageInsertions = productData.images.map((image) => {
    return pool.query("INSERT INTO product_images (product_id, image) VALUES (?, ?)", [productId, image]);
  });
  const sizeInsertions = productData.sizes.map((size) => {
    return pool.query("INSERT INTO product_sizes (product_id, size) VALUES (?, ?)", [productId, size]);
  });
  await Promise.all([...colorInsertions, ...variantInsertions, ...imageInsertions, ...sizeInsertions]);
  return productId;
}
async function getProductDetails(productId) {
  try {
    const query = `
    SELECT
      p.id,
      p.category,
      p.title,
      p.description,
      p.price,
      p.texture,
      p.wash,
      p.place,
      p.note,
      p.story,
      p.main_image,
      GROUP_CONCAT(DISTINCT pc.code) AS color_codes,
      GROUP_CONCAT(DISTINCT pc.name) AS color_names,
      GROUP_CONCAT(DISTINCT ps.size ORDER BY ps.id) AS sizes,
      GROUP_CONCAT(DISTINCT pv.color_code, '|', pv.size, '|', pv.stock) AS variants,
      GROUP_CONCAT(DISTINCT pi.image) AS images
    FROM
        stylish.products AS p
    LEFT JOIN stylish.product_colors AS pc ON
        p.id = pc.product_id
    LEFT JOIN stylish.product_sizes AS ps ON
        p.id = ps.product_id
    LEFT JOIN stylish.product_variants AS pv ON
        p.id = pv.product_id
    LEFT JOIN stylish.product_images AS pi ON
        p.id = pi.product_id
    WHERE
        p.id = ?
    GROUP BY
        p.id;
    `;
    const [productRows] = await pool.query(query, [productId]);
    if (productRows.length === 0) {
      return null;
    }
    const productRow = productRows[0];
    const productDetails = {
      id: productRow.id,
      category: productRow.category,
      title: productRow.title,
      description: productRow.description,
      price: productRow.price,
      texture: productRow.texture,
      wash: productRow.wash,
      place: productRow.place,
      note: productRow.note,
      story: productRow.story,
      main_image: productRow.main_image,
      colors: productRow.color_codes
        ? productRow.color_codes.split(",").map((code, index) => ({
            code,
            name: productRow.color_names.split(",")[index],
          }))
        : [],
      sizes: productRow.sizes ? productRow.sizes.split(",") : [],
      variants: productRow.variants
        ? productRow.variants.split(",").map((variantString) => {
            const [colorCode, size, stock] = variantString.split("|");
            return {
              color_code: colorCode,
              size,
              stock: parseInt(stock, 10),
            };
          })
        : [],
      images: productRow.images ? productRow.images.split(",") : [],
    };
    return productDetails;
  } catch (error) {
    console.error("getProductDetails Error", error);
    throw error;
  }
}
async function getAllProducts(page, pageSize) {
  try {
    const offset = page * pageSize;
    const query = `
        SELECT
          p.id,
          p.category,
          p.title,
          p.description,
          p.price,
          p.texture,
          p.wash,
          p.place,
          p.note,
          p.story,
          p.main_image,
          GROUP_CONCAT(DISTINCT pc.code) AS color_codes,
          GROUP_CONCAT(DISTINCT pc.name) AS color_names,
          GROUP_CONCAT(DISTINCT ps.size ORDER BY ps.id) AS sizes,
          GROUP_CONCAT(DISTINCT pv.color_code, '|', pv.size, '|', pv.stock) AS variants,
          GROUP_CONCAT(DISTINCT pi.image) AS images
        FROM
          stylish.products AS p
        LEFT JOIN stylish.product_colors AS pc ON
          p.id = pc.product_id
        LEFT JOIN stylish.product_sizes AS ps ON
          p.id = ps.product_id
        LEFT JOIN stylish.product_variants AS pv ON
          p.id = pv.product_id
        LEFT JOIN stylish.product_images AS pi ON
          p.id = pi.product_id
        GROUP BY
          p.id
        LIMIT ?, ?;
      `;
    const [productRows] = await pool.query(query, [offset, pageSize]);
    const nextPaging = productRows.length >= pageSize ? page + 1 : null;
    const products = [];
    for (const productRow of productRows) {
      const colors = productRow.color_codes
        ? productRow.color_codes.split(",").map((code, index) => ({
            code,
            name: productRow.color_names ? productRow.color_names.split(",")[index] : null,
          }))
        : [];
      const sizes = productRow.sizes ? productRow.sizes.split(",") : [];
      const variants = productRow.variants
        ? productRow.variants.split(",").map((variantString) => {
            const [colorCode, size, stock] = variantString.split("|");
            return {
              color_code: colorCode,
              size,
              stock: parseInt(stock, 10),
            };
          })
        : [];
      const images = productRow.images ? productRow.images.split(",") : [];
      const product = {
        id: productRow.id,
        category: productRow.category,
        title: productRow.title,
        description: productRow.description,
        price: productRow.price,
        texture: productRow.texture,
        wash: productRow.wash,
        place: productRow.place,
        note: productRow.note,
        story: productRow.story,
        main_image: productRow.main_image,
        colors,
        sizes,
        variants,
        images,
      };
      products.push(product);
    }
    return [products, nextPaging];
  } catch (error) {
    console.error("getAllProducts Error", error);
    throw error;
  }
}
async function getProductsByCategory(category, page, pageSize) {
  try {
    const offset = page * pageSize;
    const query = `
        SELECT
          p.id,
          p.category,
          p.title,
          p.description,
          p.price,
          p.texture,
          p.wash,
          p.place,
          p.note,
          p.story,
          p.main_image,
          GROUP_CONCAT(DISTINCT pc.code) AS color_codes,
          GROUP_CONCAT(DISTINCT pc.name) AS color_names,
          GROUP_CONCAT(DISTINCT ps.size ORDER BY ps.id) AS sizes,
          GROUP_CONCAT(DISTINCT pv.color_code, '|', pv.size, '|', pv.stock) AS variants,
          GROUP_CONCAT(DISTINCT pi.image) AS images
        FROM
          stylish.products AS p
        LEFT JOIN stylish.product_colors AS pc ON
          p.id = pc.product_id
        LEFT JOIN stylish.product_sizes AS ps ON
          p.id = ps.product_id
        LEFT JOIN stylish.product_variants AS pv ON
          p.id = pv.product_id
        LEFT JOIN stylish.product_images AS pi ON
          p.id = pi.product_id
        WHERE
          p.category = ?
        GROUP BY
          p.id
        LIMIT ?, ?;
      `;
    const [productRows] = await pool.query(query, [category, offset, pageSize]);
    const nextPaging = productRows.length >= pageSize ? page + 1 : null;
    const products = [];
    for (const productRow of productRows) {
      const colors = productRow.color_codes
        ? productRow.color_codes.split(",").map((code, index) => ({
            code,
            name: productRow.color_names ? productRow.color_names.split(",")[index] : null,
          }))
        : [];
      const sizes = productRow.sizes ? productRow.sizes.split(",") : [];
      const variants = productRow.variants
        ? productRow.variants.split(",").map((variantString) => {
            const [colorCode, size, stock] = variantString.split("|");
            return {
              color_code: colorCode,
              size,
              stock: parseInt(stock, 10),
            };
          })
        : [];
      const images = productRow.images ? productRow.images.split(",") : [];
      const product = {
        id: productRow.id,
        category: productRow.category,
        title: productRow.title,
        description: productRow.description,
        price: productRow.price,
        texture: productRow.texture,
        wash: productRow.wash,
        place: productRow.place,
        note: productRow.note,
        story: productRow.story,
        main_image: productRow.main_image,
        colors,
        sizes,
        variants,
        images,
      };
      products.push(product);
    }
    return [products, nextPaging];
  } catch (error) {
    console.error("getProductsByCategory Error", error);
    throw error;
  }
}
async function getSearchProducts(keyword, page, pageSize) {
  try {
    const offset = page * pageSize;
    const query = `
        SELECT
          p.id,
          p.category,
          p.title,
          p.description,
          p.price,
          p.texture,
          p.wash,
          p.place,
          p.note,
          p.story,
          p.main_image,
          GROUP_CONCAT(DISTINCT pc.code) AS color_codes,
          GROUP_CONCAT(DISTINCT pc.name) AS color_names,
          GROUP_CONCAT(DISTINCT ps.size ORDER BY ps.id) AS sizes,
          GROUP_CONCAT(DISTINCT pv.color_code, '|', pv.size, '|', pv.stock) AS variants,
          GROUP_CONCAT(DISTINCT pi.image) AS images
        FROM
          stylish.products AS p
        LEFT JOIN stylish.product_colors AS pc ON
          p.id = pc.product_id
        LEFT JOIN stylish.product_sizes AS ps ON
          p.id = ps.product_id
        LEFT JOIN stylish.product_variants AS pv ON
          p.id = pv.product_id
        LEFT JOIN stylish.product_images AS pi ON
          p.id = pi.product_id
        WHERE
          p.title LIKE ?
        GROUP BY
          p.id
        LIMIT ?, ?;
      `;
    const [productRows] = await pool.query(query, [`%${keyword}%`, offset, pageSize]);
    const nextPaging = productRows.length >= pageSize ? page + 1 : null;
    const products = [];
    for (const productRow of productRows) {
      const colors = productRow.color_codes
        ? productRow.color_codes.split(",").map((code, index) => ({
            code,
            name: productRow.color_names ? productRow.color_names.split(",")[index] : null,
          }))
        : [];
      const sizes = productRow.sizes ? productRow.sizes.split(",") : [];
      const variants = productRow.variants
        ? productRow.variants.split(",").map((variantString) => {
            const [colorCode, size, stock] = variantString.split("|");
            return {
              color_code: colorCode,
              size,
              stock: parseInt(stock, 10),
            };
          })
        : [];
      const images = productRow.images ? productRow.images.split(",") : [];
      const product = {
        id: productRow.id,
        category: productRow.category,
        title: productRow.title,
        description: productRow.description,
        price: productRow.price,
        texture: productRow.texture,
        wash: productRow.wash,
        place: productRow.place,
        note: productRow.note,
        story: productRow.story,
        main_image: productRow.main_image,
        colors,
        sizes,
        variants,
        images,
      };
      products.push(product);
    }
    return [products, nextPaging];
  } catch (error) {
    console.error("getProductsByCategoryAndPage Error", error);
    throw error;
  }
}
module.exports = {
  createProduct,
  getProductDetails,
  getAllProducts,
  getProductsByCategory,
  getSearchProducts,
};
