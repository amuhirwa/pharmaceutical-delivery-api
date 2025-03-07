import * as orderService from "../services/order.service";
import { Request, Response } from "express";

// src/controllers/order.controller.ts

export function handleControllerError(res: Response, error: any): Response {
  console.error('Error:', error);

  if (res.headersSent) {
    return res;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  return res.status(statusCode).json({ message });
}


export async function createOrder(req: Request, res: Response) {
  // Check if headers have been sent already (defensive)
  if (res.headersSent) {
    console.warn('Headers already sent before order creation logic');
    return;
  }

  try {
    // Check for user authentication
    const pharmacyId = req.user?.userId;

    if (!pharmacyId) {
      if (!res.headersSent) {
        res.status(401).json({ message: 'Authentication required' });
      }
      return;
    }

    // Create the order
    const order = await orderService.createOrder(pharmacyId, req.body);

    // Send response
    if (!res.headersSent) {
      res.status(201).json(order);
    }
  } catch (error) {
    console.error('Error creating order:', error);

    if (!res.headersSent) {
      const message = error instanceof Error ? error.message : 'Error creating order';
      res.status(500).json({ message });
    }
  }
}

export async function getOrders(req: Request, res: Response) {
  try {
    if (!req.user?.userId || !req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const orders = await orderService.getOrders(
      req.user.userId,
      req.user.role,
      req.query
    );
    return res.status(200).json(orders);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    if (!req.user?.userId || !req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await orderService.getOrderById(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    return res.status(200).json(order);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.user.userId,
      req.body.status
    );
    return res.status(200).json(order);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function cancelOrder(req: Request, res: Response) {
  try {
    if (!req.user?.userId || !req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await orderService.cancelOrder(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    return res.status(200).json(order);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function updateDeliveryStatus(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await orderService.updateDeliveryStatus(
      req.params.id,
      req.user.userId,
      req.body.status
    );
    return res.status(200).json(order);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function updateDeliveryLocation(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await orderService.updateDeliveryLocation(
      req.params.id,
      req.user.userId,
      req.body
    );
    return res.status(200).json(order);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function getDeliveryTracking(req: Request, res: Response) {
  try {
    if (!req.user?.userId || !req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const tracking = await orderService.getDeliveryTracking(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    return res.status(200).json(tracking);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function getPharmacyOrders(req: Request, res: Response) {
  try {
    if (!req.user?.userId || !req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin can view any pharmacy's orders, pharmacy can only view their own
    if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const orders = await orderService.getPharmacyOrders(
      req.params.id,
      req.query
    );
    return res.status(200).json(orders);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function getVendorOrders(req: Request, res: Response) {
  try {
    if (!req.user?.userId || !req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin can view any vendor's orders, vendor can only view their own
    if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const orders = await orderService.getVendorOrders(
      req.params.id,
      req.query
    );
    return res.status(200).json(orders);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function updatePaymentStatus(req: Request, res: Response) {
  try {
    if (!req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Only admin can update payment status for now
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const order = await orderService.updatePaymentStatus(
      req.params.id,
      req.body.paymentStatus
    );
    return res.status(200).json(order);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function assignDeliveryPerson(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await orderService.assignDeliveryPerson(
      req.params.id,
      req.user.userId,
      req.body
    );
    return res.status(200).json(order);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function updateEstimatedDeliveryTime(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const order = await orderService.updateEstimatedDeliveryTime(
      req.params.id,
      req.user.userId,
      new Date(req.body.estimatedTime)
    );
    return res.status(200).json(order);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function getOrderAnalytics(req: Request, res: Response) {
  try {
    if (!req.user?.userId || !req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const analytics = await orderService.getOrderAnalytics(
      req.user.userId,
      req.user.role
    );
    return res.status(200).json(analytics);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function getTopSellingMedications(req: Request, res: Response) {
  try {
    if (!req.user?.userId || !req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin can view any vendor's top medications, vendor can only view their own
    if (
      req.params.id &&
      req.user.role !== 'admin' &&
      req.user.userId !== req.params.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const vendorId = req.params.id || req.user.userId;
    const topMedications = await orderService.getTopSellingMedications(vendorId);
    return res.status(200).json(topMedications);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function bulkUpdateOrders(req: Request, res: Response) {
  try {
    if (!req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Only admin can perform bulk updates
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const result = await orderService.bulkUpdateOrders(
      req.body.orderIds,
      req.body.updateData
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function searchOrders(req: Request, res: Response) {
  try {
    if (!req.user?.userId || !req.user?.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const searchTerm = req.query.q as string;
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const orders = await orderService.searchOrders(
      searchTerm,
      req.user.userId,
      req.user.role
    );
    return res.status(200).json(orders);
  } catch (error) {
    return handleControllerError(res, error);
  }
}