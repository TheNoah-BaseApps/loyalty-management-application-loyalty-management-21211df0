/**
 * @swagger
 * /api/referrals:
 *   get:
 *     summary: Get all referrals
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create referral
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Referral created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { generateReferralCode } from '@/lib/utils';

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
      `SELECT r.*, 
        m1.member_number as referrer_number, u1.name as referrer_name,
        m2.member_number as referee_number, u2.name as referee_name
       FROM referrals r
       LEFT JOIN members m1 ON r.referrer_id = m1.id
       LEFT JOIN users u1 ON m1.user_id = u1.id
       LEFT JOIN members m2 ON r.referee_id = m2.id
       LEFT JOIN users u2 ON m2.user_id = u2.id
       ORDER BY r.referral_date DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/referrals:', error);
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
    const { referrer_id, referee_id, points_awarded = 0 } = body;

    if (!referrer_id || !referee_id) {
      return NextResponse.json(
        { success: false, error: 'Referrer ID and Referee ID are required' },
        { status: 400 }
      );
    }

    const referralCode = generateReferralCode();

    const result = await query(
      `INSERT INTO referrals (
        referrer_id, referee_id, referral_code, status, points_awarded,
        referral_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *`,
      [referrer_id, referee_id, referralCode, 'pending', points_awarded]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Referral created successfully',
        data: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/referrals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}