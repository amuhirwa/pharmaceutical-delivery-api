import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.utils';

// Declare io as a global variable to be used across the application
let io: SocketIOServer;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

export function setupSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // In production, restrict to your app domains
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware for Socket.IO
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.role})`);
    
    // Join room based on user type and ID
    if (socket.role === 'vendor') {
      socket.join(`vendor-${socket.userId}`);
    } else if (socket.role === 'pharmacy') {
      socket.join(`pharmacy-${socket.userId}`);
    }
    
    // Handle delivery location updates
    socket.on('updateDeliveryLocation', (data) => {
      if (socket.role !== 'vendor') {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      io.to(`pharmacy-${data.pharmacyId}`).emit('deliveryLocationUpdated', {
        orderId: data.orderId,
        location: data.location
      });
    });
    
    // Handle order status updates
    socket.on('updateOrderStatus', (data) => {
      if (socket.role !== 'vendor') {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      io.to(`pharmacy-${data.pharmacyId}`).emit('orderStatusUpdated', {
        orderId: data.orderId,
        status: data.status
      });
    });
    
    // Handle order cancellations
    socket.on('cancelOrder', (data) => {
      const targetRoom = socket.role === 'vendor' 
        ? `pharmacy-${data.pharmacyId}`
        : `vendor-${data.vendorId}`;
      
      io.to(targetRoom).emit('orderCancelled', {
        orderId: data.orderId,
        cancelledBy: socket.role
      });
    });
    
    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId} (${socket.role})`);
    });
  });

  return io;
}

// Function to send real-time notification to specific user
export function sendNotificationToUser(userId: string, role: string, event: string, data: any) {
  const room = `${role}-${userId}`;
  io.to(room).emit(event, data);
}

// Function to broadcast to all users
export function broadcastToAll(event: string, data: any) {
  io.emit(event, data);
}

// Export io to use in other files
export { io };
