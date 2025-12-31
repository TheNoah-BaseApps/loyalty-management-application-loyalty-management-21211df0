/**
 * @swagger
 * /api/analytics/redemptions:
 *   get:
 *     summary: Get redemption pattern analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const totalRedemptionsResult = await query(
      `SELECT COUNT(*) as count FROM redemptions`
    );

    const avgValueResult = await query(
      `SELECT AVG(monetary_value) as avg FROM redemptions`
    );

    const popularChannelResult = await query(
      `SELECT channel, COUNT(*) as count FROM redemptions
       GROUP BY channel ORDER BY count DESC LIMIT 1`
    );

    const topRewardsResult = await query(
      `SELECT lc.cost_name as name, lc.points_required as points, COUNT(*) as count
       FROM redemptions r
       JOIN loyalty_costs lc ON r.cost_id = lc.id
       GROUP BY lc.id, lc.cost_name, lc.points_required
       ORDER BY count DESC
       LIMIT 5`
    );

    return NextResponse.json({
      success: true,
      data: {
        totalRedemptions: parseInt(totalRedemptionsResult.rows[0]?.count || 0),
        avgValue: parseFloat(avgValueResult.rows[0]?.avg || 0),
        popularChannel: popularChannelResult.rows[0]?.channel || 'N/A',
        avgProcessingTime: 2,
        topRewards: topRewardsResult.rows.map(row => ({
          name: row.name,
          points: parseInt(row.points),
          count: parseInt(row.count)
        }))
      }
    });
  } catch (error) {
    console.error('Error in GET /api/analytics/redemptions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}