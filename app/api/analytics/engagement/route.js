/**
 * @swagger
 * /api/analytics/engagement:
 *   get:
 *     summary: Get member engagement metrics
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

    const activeMembersResult = await query(
      `SELECT COUNT(*) as count FROM members WHERE status = 'active'`
    );

    const avgPointsResult = await query(
      `SELECT AVG(available_points) as avg FROM members WHERE status = 'active'`
    );

    const transactions30dResult = await query(
      `SELECT COUNT(*) as count FROM point_transactions 
       WHERE transaction_date >= NOW() - INTERVAL '30 days'`
    );

    const membersByTierResult = await query(
      `SELECT current_tier as tier, COUNT(*) as count
       FROM members WHERE status = 'active'
       GROUP BY current_tier`
    );

    const totalMembers = parseInt(activeMembersResult.rows[0]?.count || 0);
    const transactions30d = parseInt(transactions30dResult.rows[0]?.count || 0);
    const engagementRate = totalMembers > 0 ? (transactions30d / totalMembers) * 100 : 0;

    const membersByTier = membersByTierResult.rows.map(row => ({
      tier: row.tier,
      count: parseInt(row.count),
      percentage: totalMembers > 0 ? ((parseInt(row.count) / totalMembers) * 100).toFixed(1) : 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        activeMembers: totalMembers,
        avgPointsBalance: Math.round(parseFloat(avgPointsResult.rows[0]?.avg || 0)),
        transactions30d,
        engagementRate: engagementRate.toFixed(1),
        membersByTier
      }
    });
  } catch (error) {
    console.error('Error in GET /api/analytics/engagement:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}