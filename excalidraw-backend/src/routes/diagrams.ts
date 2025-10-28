import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

// Helper to check room access
async function hasRoomAccess(userId: number, roomId: number, isAdmin: boolean): Promise<boolean> {
  if (isAdmin) return true;

  const result = await pool.query(
    'SELECT 1 FROM room_access WHERE user_id = $1 AND room_id = $2',
    [userId, roomId]
  );
  return result.rows.length > 0;
}

// Get diagrams in a room
router.get('/room/:roomId', async (req: AuthRequest, res: Response) => {
  const roomId = parseInt(req.params.roomId);
  const userId = req.user?.id!;
  const isAdmin = req.user?.role === 'admin';

  try {
    // Check access
    if (!await hasRoomAccess(userId, roomId, isAdmin)) {
      return res.status(403).json({ error: 'Access denied to this room' });
    }

    const result = await pool.query(
      'SELECT id, room_id, name, version, created_by, created_at, updated_at FROM diagrams WHERE room_id = $1 ORDER BY updated_at DESC',
      [roomId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get diagrams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single diagram
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const diagramId = parseInt(req.params.id);
  const userId = req.user?.id!;
  const isAdmin = req.user?.role === 'admin';

  try {
    const result = await pool.query(
      'SELECT d.*, r.id as room_id FROM diagrams d INNER JOIN rooms r ON d.room_id = r.id WHERE d.id = $1',
      [diagramId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    const diagram = result.rows[0];

    // Check access
    if (!await hasRoomAccess(userId, diagram.room_id, isAdmin)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(diagram);
  } catch (error) {
    console.error('Get diagram error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create diagram
router.post(
  '/',
  [
    body('roomId').isInt(),
    body('name').notEmpty().trim(),
    body('data').isObject(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { roomId, name, data } = req.body;
    const userId = req.user?.id!;
    const isAdmin = req.user?.role === 'admin';

    try {
      // Check access
      if (!await hasRoomAccess(userId, roomId, isAdmin)) {
        return res.status(403).json({ error: 'Access denied to this room' });
      }

      const result = await pool.query(
        'INSERT INTO diagrams (room_id, name, data, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
        [roomId, name, JSON.stringify(data), userId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create diagram error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update diagram
router.put(
  '/:id',
  [
    body('name').optional().trim(),
    body('data').optional().isObject(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const diagramId = parseInt(req.params.id);
    const { name, data } = req.body;
    const userId = req.user?.id!;
    const isAdmin = req.user?.role === 'admin';

    try {
      // Get diagram to check room access
      const existing = await pool.query(
        'SELECT room_id FROM diagrams WHERE id = $1',
        [diagramId]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Diagram not found' });
      }

      const roomId = existing.rows[0].room_id;

      // Check access
      if (!await hasRoomAccess(userId, roomId, isAdmin)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Build update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }

      if (data !== undefined) {
        updates.push(`data = $${paramCount++}`);
        values.push(JSON.stringify(data));
        updates.push(`version = version + 1`);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      values.push(diagramId);

      const result = await pool.query(
        `UPDATE diagrams SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update diagram error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete diagram
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const diagramId = parseInt(req.params.id);
  const userId = req.user?.id!;
  const isAdmin = req.user?.role === 'admin';

  try {
    // Get diagram to check room access
    const existing = await pool.query(
      'SELECT room_id FROM diagrams WHERE id = $1',
      [diagramId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    const roomId = existing.rows[0].room_id;

    // Check access
    if (!await hasRoomAccess(userId, roomId, isAdmin)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM diagrams WHERE id = $1', [diagramId]);

    res.json({ message: 'Diagram deleted successfully' });
  } catch (error) {
    console.error('Delete diagram error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
