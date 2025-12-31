/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Campaign created
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
      `SELECT * FROM campaigns ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in GET /api/campaigns:', error);
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
    const {
      campaign_name, campaign_type, start_date, end_date,
      target_segment, bonus_points, conditions, status
    } = body;

    if (!campaign_name || !start_date || !end_date || !bonus_points) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO campaigns (
        campaign_name, campaign_type, start_date, end_date, target_segment,
        bonus_points, conditions, status, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *`,
      [
        campaign_name,
        campaign_type || 'bonus',
        start_date,
        end_date,
        target_segment || 'all',
        bonus_points,
        conditions,
        status || 'active',
        authResult.user.userId
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign created successfully',
        data: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}