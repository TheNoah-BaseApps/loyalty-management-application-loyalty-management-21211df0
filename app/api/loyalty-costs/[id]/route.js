/**
 * @swagger
 * /api/loyalty-costs/{id}:
 *   patch:
 *     summary: Update loyalty cost
 *     tags: [Loyalty Costs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cost updated
 *   delete:
 *     summary: Deactivate loyalty cost
 *     tags: [Loyalty Costs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cost deactivated
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const allowedFields = [
      'cost_name', 'product_name', 'points_required', 'monetary_value',
      'stock_quantity', 'cost_status', 'end_date', 'redemption_limit',
      'channel_availability', 'terms_conditions', 'processing_fee'
    ];

    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE loyalty_costs SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cost not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cost updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in PATCH /api/loyalty-costs/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { id } = params;

    const result = await query(
      `UPDATE loyalty_costs SET cost_status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cost not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cost deactivated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in DELETE /api/loyalty-costs/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}