import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/connection';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

// Get user's accessible rooms
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Admins see all rooms, users see only their accessible rooms
    const query = req.user?.role === 'admin'
      ? 'SELECT r.* FROM rooms r ORDER BY r.created_at DESC'
      : `SELECT r.* FROM rooms r 
         INNER JOIN room_access ra ON r.id = ra.room_id 
         WHERE ra.user_id = $1 
         ORDER BY r.created_at DESC`;

    const result = req.user?.role === 'admin'
      ? await pool.query(query)
      : await pool.query(query, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create room (admin only)
router.post(
  '/',
  requireAdmin,
  [
    body('name').notEmpty().trim(),
    body('description').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    const createdBy = req.user?.id;

    try {
      const result = await pool.query(
        'INSERT INTO rooms (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
        [name, description || null, createdBy]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Grant user access to room (admin only)
router.post(
  '/:roomId/access',
  requireAdmin,
  [body('userId').isInt()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const roomId = parseInt(req.params.roomId);
    const { userId } = req.body;

    try {
      await pool.query(
        'INSERT INTO room_access (user_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, roomId]
      );

      res.json({ message: 'Access granted successfully' });
    } catch (error) {
      console.error('Grant access error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Revoke user access from room (admin only)
router.delete(
  '/:roomId/access/:userId',
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    const roomId = parseInt(req.params.roomId);
    const userId = parseInt(req.params.userId);

    try {
      await pool.query(
        'DELETE FROM room_access WHERE user_id = $1 AND room_id = $2',
        [userId, roomId]
      );

      res.json({ message: 'Access revoked successfully' });
    } catch (error) {
      console.error('Revoke access error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get users with access to a room (admin only)
router.get(
  '/:roomId/users',
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    const roomId = parseInt(req.params.roomId);

    try {
      const result = await pool.query(
        `SELECT u.id, u.email, u.full_name, u.role 
         FROM users u 
         INNER JOIN room_access ra ON u.id = ra.user_id 
         WHERE ra.room_id = $1`,
        [roomId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get room users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete room (admin only)
router.delete(
  '/:id',
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    const roomId = parseInt(req.params.id);

    try {
      const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING id', [roomId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Delete room error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
