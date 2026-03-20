const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { successResponse } = require('../utils/helpers');

// ─── @GET /api/cart ───────────────────────────────────────────────────────────
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name image price unit isAvailable stock'
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  return successResponse(res, 200, 'Cart fetched', { cart });
});

// ─── @POST /api/cart/add ──────────────────────────────────────────────────────
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!product.isAvailable) {
    res.status(400);
    throw new Error('Product is not available');
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units available`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      res.status(400);
      throw new Error(`Cannot add more. Only ${product.stock} units available`);
    }
    existingItem.quantity = newQty;
    existingItem.price = product.price; // update price snapshot
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
    });
  }

  await cart.save();
  await cart.populate('items.product', 'name image price unit isAvailable stock');

  return successResponse(res, 200, 'Item added to cart', { cart });
});

// ─── @PUT /api/cart/update ────────────────────────────────────────────────────
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (quantity > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} units available`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name image price unit isAvailable stock');

  return successResponse(res, 200, 'Cart updated', { cart });
});

// ─── @DELETE /api/cart/remove/:productId ─────────────────────────────────────
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  await cart.populate('items.product', 'name image price unit isAvailable stock');

  return successResponse(res, 200, 'Item removed from cart', { cart });
});

// ─── @DELETE /api/cart/clear ──────────────────────────────────────────────────
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.couponCode = undefined;
    cart.discount = 0;
    await cart.save();
  }

  return successResponse(res, 200, 'Cart cleared');
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
