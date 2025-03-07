import * as userController from "../controllers/user.controller";
import { Router } from "express";
import { authMiddleware, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { asyncHandler } from "../utils/async.utils";
import { changePasswordSchema, updateUserSchema } from "../utils/validation.utils";

// routes/user.routes.ts

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get current user profile
router.get('/me', asyncHandler(async (req, res, next) => {
    await userController.getCurrentUser(req, res, next);
}));

// Update current user profile
router.put('/me',
    validate(updateUserSchema),
    asyncHandler(async (req, res, next) => {
        await userController.updateCurrentUser(req, res, next);
    })
);

// Change password
router.post('/change-password',
    validate(changePasswordSchema),
    asyncHandler(async (req, res, next) => {
        await userController.changePassword(req, res, next);
    })
);

// Get all users (admin only)
router.get('/',
    authorize('admin'),
    asyncHandler(async (req, res, next) => {
        await userController.getAllUsers(req, res, next);
    })
);

export default router;