import Medication from "../models/medication.model";
import Order from "../models/order.model";
import Pharmacy from "../models/pharmacy.model";
import Vendor from "../models/vendor.model";
import mongoose from "mongoose";
import { io } from "../socket";
import { OrderDocument } from "../types";

// Define order status types for type safety
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export async function createOrder(pharmacyId: string, orderData: any) {
  const { vendorId, items, paymentMethod, deliveryInfo } = orderData;

  // Check if pharmacy exists
  const pharmacy = await Pharmacy.findById(pharmacyId);
  if (!pharmacy || pharmacy.role !== 'pharmacy') {
    throw new Error('Pharmacy not found');
  }

  // Check if vendor exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor || vendor.role !== 'vendor') {
    throw new Error('Vendor not found');
  }

  // Validate items and calculate prices
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const medication = await Medication.findById(item.medicationId);
    if (!medication) {
      throw new Error(`Medication with ID ${item.medicationId} not found`);
    }

    if (medication.vendorId.toString() !== vendorId) {
      throw new Error(`Medication with ID ${item.medicationId} does not belong to the specified vendor`);
    }

    if (medication.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${medication.name}`);
    }

    const unitPrice = medication.discountPrice || medication.price;
    const totalPrice = unitPrice * item.quantity;

    orderItems.push({
      medicationId: medication._id,
      name: medication.name,
      quantity: item.quantity,
      unitPrice,
      totalPrice
    });

    subtotal += totalPrice;

    // Update stock
    medication.stock -= item.quantity;
    await medication.save();

    // Check if stock is low
    if (medication.stock < 10) {
      // Notify vendor about low stock
      io.to(`vendor-${vendorId}`).emit('stockAlert', {
        medicationId: medication._id,
        name: medication.name,
        currentStock: medication.stock
      });
    }
  }

  // Calculate tax (assuming 5% tax rate)
  const taxRate = 0.05;
  const tax = subtotal * taxRate;

  // Calculate delivery fee (assuming flat fee)
  const deliveryFee = 5.0;

  // Calculate total
  const total = subtotal + tax + deliveryFee;

  // Create order with explicit status type
  const order = new Order({
    pharmacyId,
    vendorId,
    items: orderItems,
    subtotal,
    tax,
    deliveryFee,
    total,
    paymentMethod,
    status: 'pending' as OrderStatus,
    paymentStatus: 'pending' as PaymentStatus,
    deliveryInfo
  });

  await order.save();

  // Notify vendor about new order
  io.to(`vendor-${vendorId}`).emit('newOrder', {
    orderId: order._id,
    pharmacyName: pharmacy.businessName,
    total: order.total,
    items: order.items.length
  });

  return order;
}

export async function getOrders(userId: string, role: string, query: any = {}) {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    startDate,
    endDate,
    sort = 'createdAt',
    order = 'desc'
  } = query;

  const filters: any = {};

  // Filter by user role
  if (role === 'vendor') {
    filters.vendorId = userId;
  } else if (role === 'pharmacy') {
    filters.pharmacyId = userId;
  }

  // Add filters if provided
  if (status) {
    filters.status = status;
  }

  if (paymentStatus) {
    filters.paymentStatus = paymentStatus;
  }

  if (startDate) {
    filters.createdAt = { $gte: new Date(startDate) };
  }

  if (endDate) {
    filters.createdAt = { ...filters.createdAt, $lte: new Date(endDate) };
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Sort configuration
  const sortOptions: any = {};
  sortOptions[sort] = order === 'desc' ? -1 : 1;

  // Execute query with proper population
  const orders = await Order.find(filters)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate({
      path: 'vendorId',
      model: 'User',
      select: 'businessName email role'
    })
    .populate({
      path: 'pharmacyId',
      model: 'User',
      select: 'businessName email role'
    });

  const total = await Order.countDocuments(filters);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
}

export async function getOrderById(orderId: string, userId: string, role: string) {
  // Find order
  const order = await Order.findById(orderId)
    .populate({
      path: 'vendorId',
      model: 'User',
      select: 'businessName email phone address role'
    })
    .populate({
      path: 'pharmacyId',
      model: 'User',
      select: 'businessName email phone address role'
    });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check authorization
  if (
    (role === 'vendor' && order.vendorId.toString() !== userId) ||
    (role === 'pharmacy' && order.pharmacyId.toString() !== userId)
  ) {
    throw new Error('Not authorized to access this order');
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  vendorId: string,
  status: OrderStatus
) {
  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if vendor owns order
  if (order.vendorId.toString() !== vendorId) {
    throw new Error('Not authorized to update this order');
  }

  // Update status
  order.status = status;

  // If delivered, update delivery time
  if (status === 'delivered') {
    order.deliveryInfo.actualDeliveryTime = new Date();
  }

  await order.save();

  // Notify pharmacy about status update
  io.to(`pharmacy-${order.pharmacyId}`).emit('orderStatusUpdated', {
    orderId: order._id,
    status: order.status
  });

  return order;
}

export async function cancelOrder(orderId: string, userId: string, role: string) {
  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Check authorization
  if (
    (role === 'vendor' && order.vendorId.toString() !== userId) ||
    (role === 'pharmacy' && order.pharmacyId.toString() !== userId)
  ) {
    throw new Error('Not authorized to cancel this order');
  }

  // Check if order can be cancelled
  if (['delivered', 'cancelled'].includes(order.status)) {
    throw new Error(`Cannot cancel order in ${order.status} status`);
  }

  // Update status
  order.status = 'cancelled' as OrderStatus;
  await order.save();

  // Restore stock
  for (const item of order.items) {
    const medication = await Medication.findById(item.medicationId);
    if (medication) {
      medication.stock += item.quantity;
      await medication.save();
    }
  }

  // Notify about cancellation
  const targetRoom = role === 'vendor'
    ? `pharmacy-${order.pharmacyId}`
    : `vendor-${order.vendorId}`;

  io.to(targetRoom).emit('orderCancelled', {
    orderId: order._id,
    cancelledBy: role
  });

  return order;
}

export async function updateDeliveryStatus(
  orderId: string,
  vendorId: string,
  status: OrderStatus
) {
  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if vendor owns order
  if (order.vendorId.toString() !== vendorId) {
    throw new Error('Not authorized to update this order');
  }

  // Update order status based on delivery status
  if (status === 'out_for_delivery') {
    order.status = status;
  } else if (status === 'delivered') {
    order.status = status;
    order.deliveryInfo.actualDeliveryTime = new Date();
  }

  await order.save();

  // Notify pharmacy about delivery status update
  io.to(`pharmacy-${order.pharmacyId}`).emit('orderStatusUpdated', {
    orderId: order._id,
    status: order.status
  });

  return order;
}

export async function updateDeliveryLocation(
  orderId: string,
  vendorId: string,
  location: { latitude: number; longitude: number }
) {
  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if vendor owns order
  if (order.vendorId.toString() !== vendorId) {
    throw new Error('Not authorized to update this order');
  }

  // Update delivery location
  if (!order.deliveryInfo.currentLocation) {
    order.deliveryInfo.currentLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      updatedAt: new Date()
    };
  } else {
    order.deliveryInfo.currentLocation.latitude = location.latitude;
    order.deliveryInfo.currentLocation.longitude = location.longitude;
    order.deliveryInfo.currentLocation.updatedAt = new Date();
  }

  await order.save();

  // Notify pharmacy about delivery location update
  io.to(`pharmacy-${order.pharmacyId}`).emit('deliveryLocationUpdated', {
    orderId: order._id,
    location: order.deliveryInfo.currentLocation
  });

  return order;
}

export async function getDeliveryTracking(orderId: string, userId: string, role: string) {
  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Check authorization
  if (
    (role === 'vendor' && order.vendorId.toString() !== userId) ||
    (role === 'pharmacy' && order.pharmacyId.toString() !== userId)
  ) {
    throw new Error('Not authorized to access this order');
  }

  return {
    orderId: order._id,
    status: order.status,
    deliveryInfo: {
      estimatedDeliveryTime: order.deliveryInfo.estimatedDeliveryTime,
      actualDeliveryTime: order.deliveryInfo.actualDeliveryTime,
      deliveryPersonName: order.deliveryInfo.deliveryPersonName,
      deliveryPersonPhone: order.deliveryInfo.deliveryPersonPhone,
      currentLocation: order.deliveryInfo.currentLocation,
    },
    destination: order.deliveryInfo.address
  };
}

export async function getPharmacyOrders(pharmacyId: string, query: any = {}) {
  // Check if pharmacy exists
  const pharmacy = await Pharmacy.findById(pharmacyId);
  if (!pharmacy || pharmacy.role !== 'pharmacy') {
    throw new Error('Pharmacy not found');
  }

  // Get orders
  return getOrders(pharmacyId, 'pharmacy', query);
}

export async function getVendorOrders(vendorId: string, query: any = {}) {
  // Check if vendor exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor || vendor.role !== 'vendor') {
    throw new Error('Vendor not found');
  }

  // Get orders
  return getOrders(vendorId, 'vendor', query);
}

export async function updatePaymentStatus(
  orderId: string,
  status: PaymentStatus
) {
  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Update payment status
  order.paymentStatus = status;
  await order.save();

  // Notify about payment status update
  io.to(`vendor-${order.vendorId}`).emit('paymentStatusUpdated', {
    orderId: order._id,
    paymentStatus: order.paymentStatus
  });

  io.to(`pharmacy-${order.pharmacyId}`).emit('paymentStatusUpdated', {
    orderId: order._id,
    paymentStatus: order.paymentStatus
  });

  return order;
}

export async function assignDeliveryPerson(
  orderId: string,
  vendorId: string,
  deliveryPersonInfo: {
    id: string;
    name: string;
    phone: string;
  }
) {
  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if vendor owns order
  if (order.vendorId.toString() !== vendorId) {
    throw new Error('Not authorized to update this order');
  }

  // Update delivery person info
  order.deliveryInfo.deliveryPersonId = deliveryPersonInfo.id;
  order.deliveryInfo.deliveryPersonName = deliveryPersonInfo.name;
  order.deliveryInfo.deliveryPersonPhone = deliveryPersonInfo.phone;

  await order.save();

  // Notify pharmacy about delivery person assignment
  io.to(`pharmacy-${order.pharmacyId}`).emit('deliveryPersonAssigned', {
    orderId: order._id,
    deliveryPerson: {
      name: deliveryPersonInfo.name,
      phone: deliveryPersonInfo.phone
    }
  });

  return order;
}

export async function updateEstimatedDeliveryTime(
  orderId: string,
  vendorId: string,
  estimatedTime: Date
) {
  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if vendor owns order
  if (order.vendorId.toString() !== vendorId) {
    throw new Error('Not authorized to update this order');
  }

  // Update estimated delivery time
  order.deliveryInfo.estimatedDeliveryTime = estimatedTime;
  await order.save();

  // Notify pharmacy about updated estimated time
  io.to(`pharmacy-${order.pharmacyId}`).emit('estimatedDeliveryTimeUpdated', {
    orderId: order._id,
    estimatedDeliveryTime: order.deliveryInfo.estimatedDeliveryTime
  });

  return order;
}

export async function getOrderAnalytics(userId: string, role: string) {
  const filters: any = {};

  // Filter by user role
  if (role === 'vendor') {
    filters.vendorId = userId;
  } else if (role === 'pharmacy') {
    filters.pharmacyId = userId;
  }

  // Get total orders
  const totalOrders = await Order.countDocuments(filters);

  // Get orders by status
  const ordersByStatus = await Order.aggregate([
    { $match: filters },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get orders by payment status
  const ordersByPaymentStatus = await Order.aggregate([
    { $match: filters },
    { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
  ]);

  // Get total revenue (for vendor) or expenditure (for pharmacy)
  const financialSummary = await Order.aggregate([
    { $match: { ...filters, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' },
        subtotal: { $sum: '$subtotal' },
        tax: { $sum: '$tax' },
        deliveryFee: { $sum: '$deliveryFee' }
      }
    }
  ]);

  // Get monthly order counts
  const monthlyOrders = await Order.aggregate([
    { $match: filters },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format monthly data
  const formattedMonthlyData = monthlyOrders.map(item => ({
    year: item._id.year,
    month: item._id.month,
    count: item.count,
    revenue: item.revenue
  }));

  return {
    totalOrders,
    ordersByStatus: ordersByStatus.reduce((acc: Record<string, number>, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    ordersByPaymentStatus: ordersByPaymentStatus.reduce((acc: Record<string, number>, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    financial: financialSummary.length > 0 ? financialSummary[0] : {
      total: 0,
      subtotal: 0,
      tax: 0,
      deliveryFee: 0
    },
    monthlyData: formattedMonthlyData
  };
}

export async function getTopSellingMedications(vendorId: string) {
  // Aggregate to find top selling medications for a vendor
  const topMedications = await Order.aggregate([
    { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.medicationId',
        medicationName: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.totalPrice' },
        orders: { $addToSet: '$_id' }
      }
    },
    {
      $project: {
        medicationId: '$_id',
        medicationName: 1,
        totalQuantity: 1,
        totalRevenue: 1,
        orderCount: { $size: '$orders' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 }
  ]);

  return topMedications;
}

export async function bulkUpdateOrders(orderIds: string[], updateData: Partial<OrderDocument>) {
  // Remove fields that shouldn't be updated in bulk
  const { _id, pharmacyId, vendorId, items, ...safeUpdateData } = updateData;

  // Update multiple orders
  const result = await Order.updateMany(
    { _id: { $in: orderIds } },
    { $set: safeUpdateData }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    acknowledged: result.acknowledged
  };
}

export async function searchOrders(searchTerm: string, userId: string, role: string) {
  const filters: any = {};

  // Filter by user role
  if (role === 'vendor') {
    filters.vendorId = userId;
  } else if (role === 'pharmacy') {
    filters.pharmacyId = userId;
  }

  // This searches by order ID or items name
  const searchConditions = [
    { _id: { $regex: searchTerm, $options: 'i' } }, // If using string IDs
    { 'items.name': { $regex: searchTerm, $options: 'i' } }
  ];

  // Execute query
  const orders = await Order.find({
    ...filters,
    $or: searchConditions
  })
    .limit(20)
    .sort({ createdAt: -1 })
    .populate({
      path: 'vendorId',
      model: 'User',
      select: 'businessName'
    })
    .populate({
      path: 'pharmacyId',
      model: 'User',
      select: 'businessName'
    });

  return orders;
}