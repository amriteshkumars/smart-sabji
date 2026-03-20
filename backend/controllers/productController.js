const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { successResponse } = require('../utils/helpers');

// ─── @GET /api/products ───────────────────────────────────────────────────────
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    minPrice,
    maxPrice,
    sort = 'createdAt',
    order = 'desc',
    featured,
    available,
  } = req.query;

  const filter = {};

  // Search
  if (search) {
    filter.$text = { $search: search };
  }

  // Category
  if (category) {
    filter.category = category;
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Featured
  if (featured === 'true') {
    filter.isFeatured = true;
  }

  // Availability
  if (available === 'true') {
    filter.isAvailable = true;
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'Products fetched', {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// ─── @GET /api/products/:id ───────────────────────────────────────────────────
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  return successResponse(res, 200, 'Product fetched', { product });
});

// ─── @GET /api/products/featured ─────────────────────────────────────────────
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isAvailable: true })
    .limit(8)
    .lean();

  return successResponse(res, 200, 'Featured products fetched', { products });
});

// ─── @GET /api/products/categories ───────────────────────────────────────────
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  return successResponse(res, 200, 'Categories fetched', { categories });
});

// ─── @POST /api/products (Admin) ──────────────────────────────────────────────
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  return successResponse(res, 201, 'Product created', { product });
});

// ─── @PUT /api/products/:id (Admin) ──────────────────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  return successResponse(res, 200, 'Product updated', { product });
});

// ─── @DELETE /api/products/:id (Admin) ────────────────────────────────────────
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  return successResponse(res, 200, 'Product deleted');
});

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
