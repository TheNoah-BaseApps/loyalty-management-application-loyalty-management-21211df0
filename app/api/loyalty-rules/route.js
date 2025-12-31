/**
 * @swagger
 * /api/loyalty-rules:
 *   get:
 *     summary: Get all loyalty rules
 *     tags: [Loyalty Rules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create loyalty rule
 *     tags: [Loyalty Rules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Rule created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { generateRuleId } from '@/lib/utils';

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
      `SELECT * FROM loyalty_rules ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/loyalty-rules:', error);
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
      rule_name, product_id, product_name, rule_type, rule_condition,
      point_value, start_date, end_date, applicable_tiers, max_points,
      min_transaction, frequency, is_active
    } = body;

    if (!rule_name || !rule_type || !point_value || !start_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const ruleId = generateRuleId();

    const result = await query(
      `INSERT INTO loyalty_rules (
        rule_id, product_id, product_name, rule_name, rule_type, rule_condition,
        point_value, start_date, end_date, applicable_tiers, max_points,
        min_transaction, frequency, is_active, created_by, created_at, last_modified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *`,
      [
        ruleId, product_id, product_name, rule_name, rule_type, rule_condition,
        point_value, start_date, end_date, applicable_tiers || 'all', max_points,
        min_transaction, frequency || 'unlimited', is_active ?? true, authResult.user.userId
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Loyalty rule created successfully',
        data: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/loyalty-rules:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}