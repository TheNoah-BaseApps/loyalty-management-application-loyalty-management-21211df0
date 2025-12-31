/**
 * @swagger
 * /api/tiers:
 *   get:
 *     summary: Get all tiers
 *     tags: [Tiers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create tier
 *     tags: [Tiers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tier created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

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
      `SELECT * FROM tiers ORDER BY min_points ASC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/tiers:', error);
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
    const { tier_name, min_points, max_points, benefits, multiplier } = body;

    if (!tier_name || min_points === undefined || max_points === undefined || !multiplier) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingTier = await query(
      'SELECT id FROM tiers WHERE tier_name = $1',
      [tier_name]
    );

    if (existingTier.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Tier name already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO tiers (tier_name, min_points, max_points, benefits, multiplier, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [tier_name, min_points, max_points, benefits, multiplier]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Tier created successfully',
        data: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/tiers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}