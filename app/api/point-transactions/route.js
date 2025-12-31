/**
 * @swagger
 * /api/point-transactions:
 *   get:
 *     summary: Get point transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create point transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Transaction created
 */

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { generateReferenceNumber } from '@/lib/utils';

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('member_id');

    let sql = `
      SELECT pt.*, m.member_number
      FROM point_transactions pt
      LEFT JOIN members m ON pt.member_id = m.id
    `;

    const params = [];
    if (memberId) {
      sql += ` WHERE pt.member_id = $1`;
      params.push(memberId);
    }

    sql += ` ORDER BY pt.transaction_date DESC`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/point-transactions:', error);
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
    const { member_id, transaction_type, points, description, rule_id, cost_id } = body;

    if (!member_id || !transaction_type || !points) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const memberResult = await client.query(
      'SELECT available_points, total_points FROM members WHERE id = $1 FOR UPDATE',
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
    const pointsValue = parseInt(points);
    let newAvailablePoints = member.available_points;
    let newTotalPoints = member.total_points;

    if (transaction_type === 'accrual' || transaction_type === 'bonus') {
      newAvailablePoints += pointsValue;
      newTotalPoints += pointsValue;
    } else if (transaction_type === 'redemption') {
      if (member.available_points < pointsValue) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Insufficient points' },
          { status: 400 }
        );
      }
      newAvailablePoints -= pointsValue;
    } else if (transaction_type === 'adjustment') {
      newAvailablePoints += pointsValue;
      newTotalPoints += pointsValue;
    }

    await client.query(
      'UPDATE members SET available_points = $1, total_points = $2 WHERE id = $3',
      [newAvailablePoints, newTotalPoints, member_id]
    );

    const referenceNumber = generateReferenceNumber();

    const transactionResult = await client.query(
      `INSERT INTO point_transactions (
        member_id, transaction_type, points, balance_after, rule_id, cost_id,
        transaction_date, description, reference_number, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, NOW())
      RETURNING *`,
      [
        member_id,
        transaction_type,
        transaction_type === 'redemption' ? -pointsValue : pointsValue,
        newAvailablePoints,
        rule_id,
        cost_id,
        description || `${transaction_type} transaction`,
        referenceNumber
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction created successfully',
        data: transactionResult.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/point-transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}