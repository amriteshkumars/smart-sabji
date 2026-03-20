const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { successResponse } = require('../utils/helpers');

// ─── @GET /api/admin/dashboard ────────────────────────────────────────────────
const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    totalOrders,
    totalProducts,
    monthOrders,
    lastMonthOrders,
    recentOrders,
    ordersByStatus,
    topProducts,
    lowStockProducts,
    monthRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.find({ createdAt: { $gte: startOfMonth } }),
    Order.find({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email'),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
    Product.find({ stock: { $lte: 10 }, isAvailable: true }).select('name stock unit'),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  const totalRevenue = (await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]))[0]?.total || 0;

  const currentMonthRevenue = monthRevenue[0]?.total || 0;
  const lastMonthRevenue = lastMonthOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const revenueGrowth = lastMonthRevenue > 0
    ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : 0;

  return successResponse(res, 200, 'Dashboard data', {
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: +totalRevenue.toFixed(2),
      monthOrders: monthOrders.length,
      monthRevenue: +currentMonthRevenue.toFixed(2),
      revenueGrowth: Number(revenueGrowth),
    },
    recentOrders,
    ordersByStatus,
    topProducts,
    lowStockProducts,
  });
});

// ─── @GET /api/admin/orders ───────────────────────────────────────────────────
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email phone'),
    Order.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'Orders fetched', {
    orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// ─── @PUT /api/admin/orders/:id/status ────────────────────────────────────────
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    order.isPaid = order.paymentMethod === 'Online' ? true : order.isPaid;
  }

  await order.save();
  return successResponse(res, 200, 'Order status updated', { order });
});

// ─── @GET /api/admin/users ────────────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-password'),
    User.countDocuments({ role: 'user' }),
  ]);

  return successResponse(res, 200, 'Users fetched', {
    users,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// ─── @PUT /api/admin/users/:id/toggle ────────────────────────────────────────
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = !user.isActive;
  await user.save();
  return successResponse(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, {
    user: { _id: user._id, name: user.name, email: user.email, isActive: user.isActive },
  });
});

module.exports = {
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  toggleUserStatus,
};
