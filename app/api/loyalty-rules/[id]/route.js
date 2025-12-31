/**
 * @swagger
 * /api/loyalty-rules/{id}:
 *   patch:
 *     summary: Update loyalty rule
 *     tags: [Loyalty Rules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rule updated
 *   delete:
 *     summary: Deactivate loyalty rule
 *     tags: [Loyalty Rules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rule deactivated
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
      'rule_name', 'point_value', 'end_date', 'max_points',
      'min_transaction', 'is_active', 'rule_condition', 'applicable_tiers'
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

    updates.push(`last_modified = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE loyalty_rules SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Rule updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in PATCH /api/loyalty-rules/[id]:', error);
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
      `UPDATE loyalty_rules SET is_active = false, last_modified = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Rule deactivated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in DELETE /api/loyalty-rules/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}