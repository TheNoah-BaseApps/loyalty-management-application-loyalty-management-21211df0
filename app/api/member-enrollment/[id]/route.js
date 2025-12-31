import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/member-enrollment/{id}:
 *   get:
 *     summary: Get member enrollment by ID
 *     description: Retrieve a specific member enrollment record
 *     tags: [Member Enrollment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member enrollment ID
 *     responses:
 *       200:
 *         description: Member enrollment details
 *       404:
 *         description: Member enrollment not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM member_enrollment WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Member enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching member enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/member-enrollment/{id}:
 *   put:
 *     summary: Update member enrollment
 *     description: Update a specific member enrollment record
 *     tags: [Member Enrollment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Member enrollment updated successfully
 *       404:
 *         description: Member enrollment not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const checkResult = await query(
      'SELECT id FROM member_enrollment WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Member enrollment not found' },
        { status: 404 }
      );
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'product_id', 'membership_type', 'member_name', 'member_gender', 'member_age',
      'member_email', 'member_phone', 'member_city', 'member_state', 'member_country',
      'status', 'current_tier', 'total_points', 'membership_expiry',
      'joining_bonus', 'referral_code', 'terms_accepted', 'communication_preferences',
      'last_activity_date'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE member_enrollment SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating member enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/member-enrollment/{id}:
 *   delete:
 *     summary: Delete member enrollment
 *     description: Delete a specific member enrollment record
 *     tags: [Member Enrollment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member enrollment ID
 *     responses:
 *       200:
 *         description: Member enrollment deleted successfully
 *       404:
 *         description: Member enrollment not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const checkResult = await query(
      'SELECT id FROM member_enrollment WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Member enrollment not found' },
        { status: 404 }
      );
    }

    await query('DELETE FROM member_enrollment WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: 'Member enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}