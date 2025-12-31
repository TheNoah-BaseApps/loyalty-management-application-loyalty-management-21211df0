/**
 * @swagger
 * /api/redemptions:
 *   get:
 *     summary: Get redemptions
 *     tags: [Redemptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Process redemption
 *     tags: [Redemptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Redemption processed
 */

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
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

    const result = await query(
      `SELECT r.*, m.member_number, lc.cost_name
       FROM redemptions r
       LEFT JOIN members m ON r.member_id = m.id
       LEFT JOIN loyalty_costs lc ON r.cost_id = lc.id
       ORDER BY r.redemption_date DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/redemptions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const client = await getClient();

  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { member_id, cost_id, channel = 'online' } = body;

    if (!member_id || !cost_id) {
      return NextResponse.json(
        { success: false, error: 'Member ID and Cost ID are required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const costResult = await client.query(
      'SELECT * FROM loyalty_costs WHERE id = $1 FOR UPDATE',
      [cost_id]
    );

    if (costResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Reward not found' },
        { status: 404 }
      );
    }

    const cost = costResult.rows[0];

    if (cost.cost_status !== 'active') {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Reward is not active' },
        { status: 400 }
      );
    }

    if (cost.stock_quantity <= 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Reward is out of stock' },
        { status: 400 }
      );
    }

    const memberResult = await client.query(
      'SELECT * FROM members WHERE id = $1 FOR UPDATE',
      [member_id]
    );

    if (memberResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    const member = memberResult.rows[0];

    if (member.available_points < cost.points_required) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Insufficient points' },
        { status: 400 }
      );
    }

    const newAvailablePoints = member.available_points - cost.points_required;

    await client.query(
      'UPDATE members SET available_points = $1 WHERE id = $2',
      [newAvailablePoints, member_id]
    );

    await client.query(
      'UPDATE loyalty_costs SET stock_quantity = stock_quantity - 1, updated_at = NOW() WHERE id = $1',
      [cost_id]
    );

    const redemptionResult = await client.query(
      `INSERT INTO redemptions (
        member_id, cost_id, points_redeemed, monetary_value, redemption_date,
        fulfillment_status, channel, partner_code, created_at
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, NOW())
      RETURNING *`,
      [
        member_id,
        cost_id,
        cost.points_required,
        cost.monetary_value,
        'pending',
        channel,
        cost.partner_code
      ]
    );

    await client.query(
      `INSERT INTO point_transactions (
        member_id, transaction_type, points, balance_after, cost_id,
        transaction_date, description, reference_number, created_at
      ) VALUES ($1, 'redemption', $2, $3, $4, NOW(), $5, $6, NOW())`,
      [
        member_id,
        -cost.points_required,
        newAvailablePoints,
        cost_id,
        `Redeemed: ${cost.cost_name}`,
        `RED-${Date.now()}`
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        message: 'Redemption processed successfully',
        data: redemptionResult.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/redemptions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}