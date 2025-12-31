/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create new member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Member created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { generateMemberNumber } from '@/lib/utils';

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
    const availableUsers = searchParams.get('available_users');

    if (availableUsers === 'true') {
      const usersResult = await query(
        `SELECT u.id, u.name, u.email 
         FROM users u 
         LEFT JOIN members m ON u.id = m.user_id 
         WHERE m.id IS NULL`
      );

      return NextResponse.json({
        success: true,
        users: usersResult.rows
      });
    }

    const result = await query(
      `SELECT m.*, u.name as user_name, u.email as user_email
       FROM members m
       LEFT JOIN users u ON m.user_id = u.id
       ORDER BY m.created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/members:', error);
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
    const { user_id, segment = 'standard', current_tier = 'bronze' } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const existingMember = await query(
      'SELECT id FROM members WHERE user_id = $1',
      [user_id]
    );

    if (existingMember.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User is already enrolled as a member' },
        { status: 400 }
      );
    }

    const memberNumber = generateMemberNumber();

    const result = await query(
      `INSERT INTO members (user_id, member_number, current_tier, total_points, available_points, 
                           lifetime_points, enrollment_date, segment, status, created_at)
       VALUES ($1, $2, $3, 0, 0, 0, NOW(), $4, 'active', NOW())
       RETURNING *`,
      [user_id, memberNumber, current_tier, segment]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Member enrolled successfully',
        data: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/members:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}