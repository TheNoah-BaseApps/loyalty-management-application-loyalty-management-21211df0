import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/accrual-management:
 *   get:
 *     summary: Get all accrual records
 *     description: Retrieve all accrual management records with pagination
 *     tags: [Accrual Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by points status
 *     responses:
 *       200:
 *         description: List of accrual records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM accrual_management';
    let params = [];
    
    if (status) {
      queryText += ' WHERE points_status = $1';
      params.push(status);
      queryText += ' ORDER BY transaction_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY transaction_date DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(queryText, params);
    
    const countResult = await query(
      status 
        ? 'SELECT COUNT(*) FROM accrual_management WHERE points_status = $1' 
        : 'SELECT COUNT(*) FROM accrual_management',
      status ? [status] : []
    );
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching accrual records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accrual-management:
 *   post:
 *     summary: Create new accrual record
 *     description: Create a new accrual management record
 *     tags: [Accrual Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accrual_id
 *               - customer_id
 *               - customer_name
 *               - transaction_date
 *               - transaction_amount
 *               - points_earned
 *               - accrual_type
 *               - points_status
 *             properties:
 *               accrual_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               product_name:
 *                 type: string
 *               customer_id:
 *                 type: string
 *               customer_name:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date-time
 *               transaction_amount:
 *                 type: number
 *               points_earned:
 *                 type: number
 *               accrual_type:
 *                 type: string
 *               total_accrued_points:
 *                 type: number
 *               rule_id:
 *                 type: string
 *               points_status:
 *                 type: string
 *               processing_date:
 *                 type: string
 *                 format: date-time
 *               channel_source:
 *                 type: string
 *               partner_code:
 *                 type: string
 *               program_type:
 *                 type: string
 *               accrual_notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Accrual record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      accrual_id,
      product_id,
      product_name,
      customer_id,
      customer_name,
      transaction_date,
      transaction_amount,
      points_earned,
      accrual_type,
      total_accrued_points,
      rule_id,
      points_status,
      processing_date,
      channel_source,
      partner_code,
      program_type,
      accrual_notes
    } = body;

    if (!accrual_id || !customer_id || !customer_name || !transaction_date || 
        transaction_amount == null || points_earned == null || !accrual_type || !points_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO accrual_management (
        accrual_id, product_id, product_name, customer_id, customer_name,
        transaction_date, transaction_amount, points_earned, accrual_type,
        total_accrued_points, rule_id, points_status, processing_date,
        channel_source, partner_code, program_type, accrual_notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      RETURNING *`,
      [
        accrual_id, product_id, product_name, customer_id, customer_name,
        transaction_date, transaction_amount, points_earned, accrual_type,
        total_accrued_points, rule_id, points_status, processing_date,
        channel_source, partner_code, program_type, accrual_notes
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating accrual record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}