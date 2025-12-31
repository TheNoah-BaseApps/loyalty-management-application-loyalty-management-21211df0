/**
 * @swagger
 * /api/redemptions/{id}:
 *   patch:
 *     summary: Update redemption status
 *     tags: [Redemptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Redemption updated
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
    const { fulfillment_status } = body;

    if (!fulfillment_status) {
      return NextResponse.json(
        { success: false, error: 'Fulfillment status is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE redemptions SET fulfillment_status = $1 WHERE id = $2 RETURNING *`,
      [fulfillment_status, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Redemption not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Redemption updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in PATCH /api/redemptions/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}