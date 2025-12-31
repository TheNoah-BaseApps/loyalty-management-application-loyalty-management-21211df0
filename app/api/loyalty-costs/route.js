/**
 * @swagger
 * /api/loyalty-costs:
 *   get:
 *     summary: Get all loyalty costs
 *     tags: [Loyalty Costs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create loyalty cost
 *     tags: [Loyalty Costs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Cost created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { generateCostId } from '@/lib/utils';

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
      `SELECT * FROM loyalty_costs ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/loyalty-costs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      cost_name, product_id, product_name, points_required, points_cost,
      monetary_value, cost_type, validity_period, start_date, end_date,
      customer_segment, redemption_limit, cost_status, channel_availability,
      terms_conditions, processing_fee, stock_quantity, minimum_balance,
      fulfillment_type, partner_code
    } = body;

    if (!cost_name || !product_id || !product_name || !points_required || !monetary_value || !start_date || !stock_quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const costId = generateCostId();

    const result = await query(
      `INSERT INTO loyalty_costs (
        cost_id, cost_name, product_id, product_name, points_required, points_cost,
        monetary_value, cost_type, validity_period, start_date, end_date,
        customer_segment, redemption_limit, cost_status, channel_availability,
        terms_conditions, processing_fee, stock_quantity, minimum_balance,
        fulfillment_type, partner_code, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW())
      RETURNING *`,
      [
        costId, cost_name, product_id, product_name, points_required, points_cost || points_required,
        monetary_value, cost_type || 'product', validity_period, start_date, end_date,
        customer_segment || 'all', redemption_limit, cost_status || 'active', channel_availability || 'all',
        terms_conditions, processing_fee || 0, stock_quantity, minimum_balance || 0,
        fulfillment_type || 'instant', partner_code, authResult.user.userId
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Loyalty cost created successfully',
        data: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/loyalty-costs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}