const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { successResponse } = require('../utils/helpers');

const DELIVERY_THRESHOLD = 200; // Free delivery above ₹200
const DELIVERY_FEE = 30;

// ─── @POST /api/orders ────────────────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'COD', notes } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error('Shipping address is required');
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product'
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Validate stock and build order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isAvailable) {
      res.status(400);
      throw new Error(`Product "${product?.name || item.product}" is no longer available`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock}`
      );
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
      unit: product.unit,
    });
  }

  // Calculate totals
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const deliveryPrice = itemsPrice >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const totalPrice = itemsPrice + deliveryPrice - (cart.discount || 0);

  // Estimated delivery: next day
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);

  // Create order
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: +itemsPrice.toFixed(2),
    deliveryPrice,
    discount: cart.discount || 0,
    totalPrice: +totalPrice.toFixed(2),
    estimatedDelivery,
    notes,
  });

  // Deduct stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  cart.items = [];
  cart.discount = 0;
  cart.couponCode = undefined;
  await cart.save();

  return successResponse(res, 201, 'Order placed successfully', { order });
});

// ─── @GET /api/orders/myorders ────────────────────────────────────────────────
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments({ user: req.user._id }),
  ]);

  return successResponse(res, 200, 'Orders fetched', {
    orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// ─── @GET /api/orders/:id ─────────────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // User can only view their own orders, admin can view all
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Access denied');
  }

  return successResponse(res, 200, 'Order fetched', { order });
});

// ─── @PUT /api/orders/:id/cancel ─────────────────────────────────────────────
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }

  if (['Delivered', 'Out for Delivery', 'Cancelled'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order in "${order.status}" status`);
  }

  // Restore stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.status = 'Cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by user';
  await order.save();

  return successResponse(res, 200, 'Order cancelled', { order });
});

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
