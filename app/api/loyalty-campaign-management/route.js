import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/loyalty-campaign-management:
 *   get:
 *     summary: Get all loyalty campaigns
 *     description: Retrieve all loyalty campaign records with pagination
 *     tags: [Loyalty Campaign Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of loyalty campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isActive = searchParams.get('is_active');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM loyalty_campaign_management';
    let params = [];
    
    if (isActive !== null && isActive !== undefined) {
      queryText += ' WHERE is_active = $1';
      params.push(isActive === 'true');
      queryText += ' ORDER BY start_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY start_date DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(queryText, params);
    
    const countResult = await query(
      isActive !== null && isActive !== undefined
        ? 'SELECT COUNT(*) FROM loyalty_campaign_management WHERE is_active = $1' 
        : 'SELECT COUNT(*) FROM loyalty_campaign_management',
      isActive !== null && isActive !== undefined ? [isActive === 'true'] : []
    );
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty campaigns:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/loyalty-campaign-management:
 *   post:
 *     summary: Create new loyalty campaign
 *     description: Create a new loyalty campaign record
 *     tags: [Loyalty Campaign Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaign_id
 *               - campaign_name
 *               - campaign_type
 *               - start_date
 *               - end_date
 *               - is_active
 *             properties:
 *               campaign_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               product_name:
 *                 type: string
 *               campaign_name:
 *                 type: string
 *               campaign_type:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               target_tiers:
 *                 type: string
 *               bonus_points:
 *                 type: number
 *               minimum_spend:
 *                 type: number
 *               max_rewards:
 *                 type: number
 *               terms_conditions:
 *                 type: string
 *               channel_type:
 *                 type: string
 *               target_audience:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               created_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      campaign_id,
      product_id,
      product_name,
      campaign_name,
      campaign_type,
      start_date,
      end_date,
      target_tiers,
      bonus_points,
      minimum_spend,
      max_rewards,
      terms_conditions,
      channel_type,
      target_audience,
      is_active,
      created_by
    } = body;

    if (!campaign_id || !campaign_name || !campaign_type || !start_date || !end_date || is_active == null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO loyalty_campaign_management (
        campaign_id, product_id, product_name, campaign_name, campaign_type,
        start_date, end_date, target_tiers, bonus_points, minimum_spend,
        max_rewards, terms_conditions, channel_type, target_audience,
        is_active, created_by, last_modified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW(), NOW())
      RETURNING *`,
      [
        campaign_id, product_id, product_name, campaign_name, campaign_type,
        start_date, end_date, target_tiers, bonus_points, minimum_spend,
        max_rewards, terms_conditions, channel_type, target_audience,
        is_active, created_by
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating loyalty campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}