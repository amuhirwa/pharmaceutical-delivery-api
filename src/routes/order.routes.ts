import * as orderController from "../controllers/order.controller";
import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

// src/routes/order.routes.ts

import {
  orderSchema,
  updateOrderStatusSchema,
  updateDeliveryLocationSchema
} from '../utils/validation.utils';

const router = Router();

// Create middleware wrapper functions to fix type issues
const auth = (req: Request, res: Response, next: NextFunction): void => {
  authMiddleware(req, res, next);
  // Don't call next() here - let authMiddleware call it
};

const authVendor = (req: Request, res: Response, next: NextFunction): void => {
  authMiddleware(req, res, (err?: any) => {
    if (err || res.headersSent) return; // Stop if errors or response sent
    authorize('vendor')(req, res, next);
  });
};

const authPharmacy = (req: Request, res: Response, next: NextFunction): void => {
  authMiddleware(req, res, (err?: any) => {
    if (err || res.headersSent) return; // Stop if errors or response sent
    authorize('pharmacy')(req, res, next);
  });
};

const authAdmin = (req: Request, res: Response, next: NextFunction): void => {
  authMiddleware(req, res, (err?: any) => {
    if (err || res.headersSent) return; // Stop if errors or response sent
    authorize('admin')(req, res, next);
  });
};

// Fixed route ordering - more specific routes first
// Analytics endpoints
router.get('/analytics', auth, (req: Request, res: Response) => {
  orderController.getOrderAnalytics(req, res);
});

// Search orders
router.get('/search', auth, (req: Request, res: Response) => {
  orderController.searchOrders(req, res);
});

// Bulk update orders (admin only)
router.post(
  '/bulk-update',
  authAdmin,
  (req: Request, res: Response) => {
    orderController.bulkUpdateOrders(req, res);
  }
);

// Get pharmacy orders (admin/self only)
router.get('/pharmacy/:id', auth, (req: Request, res: Response) => {
  orderController.getPharmacyOrders(req, res);
});

// Get vendor orders (admin/self only)
router.get('/vendor/:id', auth, (req: Request, res: Response) => {
  orderController.getVendorOrders(req, res);
});

// Get top selling medications (vendor/admin)
router.get('/vendor/:id/top-selling', auth, (req: Request, res: Response) => {
  orderController.getTopSellingMedications(req, res);
});

// Order-specific routes
// Create a new order (pharmacy only)
router.post('/',
  authPharmacy,
  (req: Request, res: Response, next: NextFunction) => {
    validate(orderSchema)(req, res, next);
  },
  (req: Request, res: Response) => {
    orderController.createOrder(req, res);
  }
);

// Get orders (filtered by user role)
router.get('/', auth, (req: Request, res: Response) => {
  orderController.getOrders(req, res);
});

// Get order by ID
router.get('/:id', auth, (req: Request, res: Response) => {
  orderController.getOrderById(req, res);
});

// Update order status (vendor only)
router.put(
  '/:id/status',
  authVendor,
  (req: Request, res: Response, next: NextFunction) => {
    validate(updateOrderStatusSchema)(req, res, next);
  },
  (req: Request, res: Response) => {
    orderController.updateOrderStatus(req, res);
  }
);

// Cancel order
router.put('/:id/cancel', auth, (req: Request, res: Response) => {
  orderController.cancelOrder(req, res);
});

// Update delivery status (vendor only)
router.put(
  '/:id/delivery/status',
  authVendor,
  (req: Request, res: Response) => {
    orderController.updateDeliveryStatus(req, res);
  }
);

// Update delivery location (vendor only)
router.put(
  '/:id/delivery/location',
  authVendor,
  (req: Request, res: Response, next: NextFunction) => {
    validate(updateDeliveryLocationSchema)(req, res, next);
  },
  (req: Request, res: Response) => {
    orderController.updateDeliveryLocation(req, res);
  }
);

// Get delivery tracking info
router.get('/:id/delivery/tracking', auth, (req: Request, res: Response) => {
  orderController.getDeliveryTracking(req, res);
});

// Update payment status (admin only)
router.put(
  '/:id/payment',
  authAdmin,
  (req: Request, res: Response) => {
    orderController.updatePaymentStatus(req, res);
  }
);

// Assign delivery person (vendor only)
router.put(
  '/:id/delivery/person',
  authVendor,
  (req: Request, res: Response) => {
    orderController.assignDeliveryPerson(req, res);
  }
);

// Update estimated delivery time (vendor only)
router.put(
  '/:id/delivery/estimated-time',
  authVendor,
  (req: Request, res: Response) => {
    orderController.updateEstimatedDeliveryTime(req, res);
  }
);

export default router;