import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/member-enrollment:
 *   get:
 *     summary: Get all member enrollments
 *     description: Retrieve a list of all member enrollment records with pagination
 *     tags: [Member Enrollment]
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
 *           default: 50
 *         description: Number of records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by enrollment status
 *       - in: query
 *         name: membership_type
 *         schema:
 *           type: string
 *         description: Filter by membership type
 *     responses:
 *       200:
 *         description: List of member enrollments
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const membershipType = searchParams.get('membership_type');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (membershipType) {
      whereClause += ` AND membership_type = $${paramIndex}`;
      params.push(membershipType);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM member_enrollment ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM member_enrollment ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

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
    console.error('Error fetching member enrollments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/member-enrollment:
 *   post:
 *     summary: Create new member enrollment
 *     description: Create a new member enrollment record
 *     tags: [Member Enrollment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_id
 *               - membership_type
 *               - member_name
 *               - member_email
 *               - enrollment_date
 *               - status
 *             properties:
 *               member_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               membership_type:
 *                 type: string
 *               member_name:
 *                 type: string
 *               member_gender:
 *                 type: string
 *               member_age:
 *                 type: integer
 *               member_email:
 *                 type: string
 *               member_phone:
 *                 type: string
 *               member_city:
 *                 type: string
 *               member_state:
 *                 type: string
 *               member_country:
 *                 type: string
 *               enrollment_date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               current_tier:
 *                 type: string
 *               total_points:
 *                 type: integer
 *               membership_expiry:
 *                 type: string
 *                 format: date-time
 *               joining_bonus:
 *                 type: integer
 *               referral_code:
 *                 type: string
 *               terms_accepted:
 *                 type: boolean
 *               communication_preferences:
 *                 type: string
 *               created_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member enrollment created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      member_id,
      product_id,
      membership_type,
      member_name,
      member_gender,
      member_age,
      member_email,
      member_phone,
      member_city,
      member_state,
      member_country,
      enrollment_date,
      status,
      current_tier,
      total_points,
      membership_expiry,
      joining_bonus,
      referral_code,
      terms_accepted,
      communication_preferences,
      created_by
    } = body;

    if (!member_id || !membership_type || !member_name || !member_email || !enrollment_date || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO member_enrollment (
        member_id, product_id, membership_type, member_name, member_gender, member_age,
        member_email, member_phone, member_city, member_state, member_country,
        enrollment_date, status, current_tier, total_points, membership_expiry,
        joining_bonus, referral_code, terms_accepted, communication_preferences,
        last_activity_date, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, $21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        member_id, product_id, membership_type, member_name, member_gender, member_age,
        member_email, member_phone, member_city, member_state, member_country,
        enrollment_date, status, current_tier, total_points || 0, membership_expiry,
        joining_bonus || 0, referral_code, terms_accepted || false, communication_preferences,
        created_by
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating member enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}