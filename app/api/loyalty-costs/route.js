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
      console.error('Authentication failed in GET /api/loyalty-costs:', authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT * FROM loyalty_costs ORDER BY created_at DESC`
    );

    if (!result || !result.rows) {
      console.error('Invalid database response in GET /api/loyalty-costs');
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve loyalty costs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/loyalty-costs:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Internal server error while fetching loyalty costs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      console.error('Authentication failed in POST /api/loyalty-costs:', authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error in POST /api/loyalty-costs:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const {
      cost_name, product_id, product_name, points_required, points_cost,
      monetary_value, cost_type, validity_period, start_date, end_date,
      customer_segment, redemption_limit, cost_status, channel_availability,
      terms_conditions, processing_fee, stock_quantity, minimum_balance,
      fulfillment_type, partner_code
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!cost_name) missingFields.push('cost_name');
    if (!product_id) missingFields.push('product_id');
    if (!product_name) missingFields.push('product_name');
    if (!points_required && points_required !== 0) missingFields.push('points_required');
    if (!monetary_value && monetary_value !== 0) missingFields.push('monetary_value');
    if (!start_date) missingFields.push('start_date');
    if (!stock_quantity && stock_quantity !== 0) missingFields.push('stock_quantity');

    if (missingFields.length > 0) {
      console.error('Missing required fields in POST /api/loyalty-costs:', missingFields);
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      );
    }

    // Validate data types and values
    if (typeof points_required !== 'number' || points_required < 0) {
      console.error('Invalid points_required value:', points_required);
      return NextResponse.json(
        { success: false, error: 'points_required must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof monetary_value !== 'number' || monetary_value < 0) {
      console.error('Invalid monetary_value:', monetary_value);
      return NextResponse.json(
        { success: false, error: 'monetary_value must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
      console.error('Invalid stock_quantity:', stock_quantity);
      return NextResponse.json(
        { success: false, error: 'stock_quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate date format
    if (isNaN(Date.parse(start_date))) {
      console.error('Invalid start_date format:', start_date);
      return NextResponse.json(
        { success: false, error: 'start_date must be a valid date' },
        { status: 400 }
      );
    }

    if (end_date && isNaN(Date.parse(end_date))) {
      console.error('Invalid end_date format:', end_date);
      return NextResponse.json(
        { success: false, error: 'end_date must be a valid date' },
        { status: 400 }
      );
    }

    // Validate end_date is after start_date
    if (end_date && new Date(end_date) <= new Date(start_date)) {
      console.error('end_date must be after start_date');
      return NextResponse.json(
        { success: false, error: 'end_date must be after start_date' },
        { status: 400 }
      );
    }

    const costId = generateCostId();

    let result;
    try {
      result = await query(
        `INSERT INTO loyalty_costs (
          cost_id, cost_name, product_id, product_name, points_required, points_cost,
          monetary_value, cost_type, validity_period, start_date, end_date,
          customer_segment, redemption_limit, cost_status, channel_availability,
          terms_conditions, processing_fee, stock_quantity, minimum_balance,
          fulfillment_type, partner_code, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW())
        RETURNING *`,
        [
          costId, 
          cost_name, 
          product_id, 
          product_name, 
          points_required, 
          points_cost || points_required,
          monetary_value, 
          cost_type || 'product', 
          validity_period || null, 
          start_date, 
          end_date || null,
          customer_segment || 'all', 
          redemption_limit || null, 
          cost_status || 'active', 
          channel_availability || 'all',
          terms_conditions || null, 
          processing_fee || 0, 
          stock_quantity, 
          minimum_balance || 0,
          fulfillment_type || 'instant', 
          partner_code || null, 
          authResult.user.userId
        ]
      );
    } catch (dbError) {
      console.error('Database error in POST /api/loyalty-costs:', dbError);
      console.error('Database error details:', dbError.message);
      console.error('Database error stack:', dbError.stack);
      
      // Handle specific database errors
      if (dbError.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A loyalty cost with this ID already exists' },
          { status: 409 }
        );
      }
      
      if (dbError.code === '23503') {
        return NextResponse.json(
          { success: false, error: 'Referenced product or user does not exist' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Database error while creating loyalty cost' },
        { status: 500 }
      );
    }

    if (!result || !result.rows || result.rows.length === 0) {
      console.error('No rows returned after insert in POST /api/loyalty-costs');
      return NextResponse.json(
        { success: false, error: 'Failed to create loyalty cost' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Loyalty cost created successfully',
        data: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/loyalty-costs:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Internal server error while creating loyalty cost' },
      { status: 500 }
    );
  }
}