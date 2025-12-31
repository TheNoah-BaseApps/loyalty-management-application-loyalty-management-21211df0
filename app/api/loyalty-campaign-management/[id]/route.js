import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/loyalty-campaign-management/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     description: Retrieve a specific loyalty campaign
 *     tags: [Loyalty Campaign Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign found
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM loyalty_campaign_management WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/loyalty-campaign-management/{id}:
 *   put:
 *     summary: Update campaign
 *     description: Update an existing loyalty campaign
 *     tags: [Loyalty Campaign Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE loyalty_campaign_management SET
        campaign_id = COALESCE($1, campaign_id),
        product_id = COALESCE($2, product_id),
        product_name = COALESCE($3, product_name),
        campaign_name = COALESCE($4, campaign_name),
        campaign_type = COALESCE($5, campaign_type),
        start_date = COALESCE($6, start_date),
        end_date = COALESCE($7, end_date),
        target_tiers = COALESCE($8, target_tiers),
        bonus_points = COALESCE($9, bonus_points),
        minimum_spend = COALESCE($10, minimum_spend),
        max_rewards = COALESCE($11, max_rewards),
        terms_conditions = COALESCE($12, terms_conditions),
        channel_type = COALESCE($13, channel_type),
        target_audience = COALESCE($14, target_audience),
        is_active = COALESCE($15, is_active),
        created_by = COALESCE($16, created_by),
        last_modified = NOW(),
        updated_at = NOW()
      WHERE id = $17
      RETURNING *`,
      [
        campaign_id, product_id, product_name, campaign_name, campaign_type,
        start_date, end_date, target_tiers, bonus_points, minimum_spend,
        max_rewards, terms_conditions, channel_type, target_audience,
        is_active, created_by, id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/loyalty-campaign-management/{id}:
 *   delete:
 *     summary: Delete campaign
 *     description: Delete a loyalty campaign
 *     tags: [Loyalty Campaign Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM loyalty_campaign_management WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}