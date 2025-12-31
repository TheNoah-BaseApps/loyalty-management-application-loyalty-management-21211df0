import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/accrual-management/{id}:
 *   get:
 *     summary: Get accrual record by ID
 *     description: Retrieve a specific accrual record
 *     tags: [Accrual Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Accrual record found
 *       404:
 *         description: Accrual record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM accrual_management WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Accrual record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching accrual record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accrual-management/{id}:
 *   put:
 *     summary: Update accrual record
 *     description: Update an existing accrual record
 *     tags: [Accrual Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Accrual record updated successfully
 *       404:
 *         description: Accrual record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE accrual_management SET
        accrual_id = COALESCE($1, accrual_id),
        product_id = COALESCE($2, product_id),
        product_name = COALESCE($3, product_name),
        customer_id = COALESCE($4, customer_id),
        customer_name = COALESCE($5, customer_name),
        transaction_date = COALESCE($6, transaction_date),
        transaction_amount = COALESCE($7, transaction_amount),
        points_earned = COALESCE($8, points_earned),
        accrual_type = COALESCE($9, accrual_type),
        total_accrued_points = COALESCE($10, total_accrued_points),
        rule_id = COALESCE($11, rule_id),
        points_status = COALESCE($12, points_status),
        processing_date = COALESCE($13, processing_date),
        channel_source = COALESCE($14, channel_source),
        partner_code = COALESCE($15, partner_code),
        program_type = COALESCE($16, program_type),
        accrual_notes = COALESCE($17, accrual_notes),
        updated_at = NOW()
      WHERE id = $18
      RETURNING *`,
      [
        accrual_id, product_id, product_name, customer_id, customer_name,
        transaction_date, transaction_amount, points_earned, accrual_type,
        total_accrued_points, rule_id, points_status, processing_date,
        channel_source, partner_code, program_type, accrual_notes, id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Accrual record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating accrual record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accrual-management/{id}:
 *   delete:
 *     summary: Delete accrual record
 *     description: Delete an accrual record
 *     tags: [Accrual Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Accrual record deleted successfully
 *       404:
 *         description: Accrual record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM accrual_management WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Accrual record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Accrual record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting accrual record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}