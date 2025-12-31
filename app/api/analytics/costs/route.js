/**
 * @swagger
 * /api/analytics/costs:
 *   get:
 *     summary: Get program cost analytics
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

    const totalCostResult = await query(
      `SELECT SUM(monetary_value) as total FROM redemptions`
    );

    const pointsIssuedResult = await query(
      `SELECT SUM(points) as total FROM point_transactions WHERE transaction_type = 'accrual'`
    );

    const pointsRedeemedResult = await query(
      `SELECT SUM(ABS(points)) as total FROM point_transactions WHERE transaction_type = 'redemption'`
    );

    const costByTypeResult = await query(
      `SELECT lc.cost_type as type, SUM(r.monetary_value) as total
       FROM redemptions r
       JOIN loyalty_costs lc ON r.cost_id = lc.id
       GROUP BY lc.cost_type`
    );

    const totalCost = parseFloat(totalCostResult.rows[0]?.total || 0);
    const pointsIssued = parseInt(pointsIssuedResult.rows[0]?.total || 0);
    const pointsRedeemed = parseInt(pointsRedeemedResult.rows[0]?.total || 0);
    const redemptionRate = pointsIssued > 0 ? (pointsRedeemed / pointsIssued) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalCost,
        pointsIssued,
        pointsRedeemed,
        redemptionRate,
        costByType: costByTypeResult.rows
      }
    });
  } catch (error) {
    console.error('Error in GET /api/analytics/costs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}