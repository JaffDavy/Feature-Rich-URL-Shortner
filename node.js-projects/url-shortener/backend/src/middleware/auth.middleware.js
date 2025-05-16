import jwt from 'jsonwebtoken';
import { findUserById } from '../models/users.model.js';
import { logger } from '../utils/logger.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - No token provided' 
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await findUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Unauthorized - User no longer exists' 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      logger.error(`Authentication error: ${error.message}`);
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - Invalid token' 
      });
    }
  } catch (error) {
    next(error);
  }
};
