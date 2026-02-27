import { Request, Response, NextFunction } from 'express';
import User, { UserAttributes } from '@models/userModel.js';
import RefreshToken from '@models/refreshTokensModel.js';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { sequelize } from '@config/db.js';

type RefreshTokenWithUser = RefreshToken & { user: User };

interface RegisterBody {
  firstName: string;
  lastName: string;
  patronymic: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  refreshToken: string;
}

interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  gender?: 'male' | 'female';
  dateOfBirth?: string;
  email?: string;
}

/**
 * @swagger
 * /register:
 *   post:
 *     tags: [Public]
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account. This endpoint is publicly accessible.
 *
 *       ### Password Requirements:
 *       - Must be at least 6 characters long
 *       - Will be automatically hashed using bcrypt before storage
 *
 *       ### Email Validation:
 *       - Must be a valid email format (e.g., user@example.com)
 *       - Must be unique (cannot already exist in the system)
 *     operationId: registerUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/users'
 *           examples:
 *             validRegistration:
 *               summary: Valid user registration
 *               value:
 *                 name: "Jane Doe"
 *                 email: "jane.doe@example.com"
 *                 password: "SecurePass123!"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users'
 *             examples:
 *               success:
 *                 summary: User created
 *                 value:
 *                   id: 5
 *                   name: "Jane Doe"
 *                   email: "jane.doe@example.com"
 *                   createdAt: "2023-01-05T14:30:00.000Z"
 *       400:
 *         description: Bad request – validation failed
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "name, email and password required"
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   message: "Invalid email format"
 *               shortPassword:
 *                 summary: Password too short
 *                 value:
 *                   message: "Password must be at least 6 characters long"
 *               duplicateUser:
 *                 summary: User already exists
 *                 value:
 *                   message: "User already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      patronymic,
      gender,
      dateOfBirth,
      email,
      password,
    } = req.body as RegisterBody;
    if (
      !firstName ||
      !lastName ||
      !patronymic ||
      !gender ||
      !dateOfBirth ||
      !email ||
      !password
    ) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
      return;
    }

    if (!['male', 'female'].includes(gender)) {
      res.status(400).json({ message: 'Gender must be male or female' });
      return;
    }

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      res.status(400).json({ message: 'Invalid date of birth' });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const newUser = await User.create({
      firstName,
      lastName,
      patronymic,
      gender,
      dateOfBirth: dob,
      email,
      password,
      createdAt: new Date(),
    });

    const userResponse = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      patronymic: newUser.patronymic,
      gender: newUser.gender,
      dateOfBirth: newUser.dateOfBirth,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };

    res.status(201).json(userResponse);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: |
 *       Retrieves a list of all registered users. This endpoint is **private** and requires a valid JWT token.
 *
 *       ### Authentication Requirements:
 *       - A valid JWT token must be provided in the `Authorization` header using the `Bearer` scheme.
 *       - Example header: `Authorization: Bearer <your_token_here>`
 *
 *       ### Security Notes:
 *       - Passwords are **never** returned in the response.
 *       - Only authenticated users can access this endpoint.
 *
 *       ### Example cURL Request:
 *       ```bash
 *       curl -X GET "http://localhost:3000/users" \
 *         -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxNjE2MjQyNjIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *       ```
 *     tags: [Private]
 *     security:
 *       - BearerAuth: []
 *     operationId: getUsers
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/users'
 *             examples:
 *               usersList:
 *                 summary: Example list of users
 *                 value:
 *                   - id: 1
 *                     name: "Admin User"
 *                     email: "admin@example.com"
 *                     createdAt: "2023-01-01T10:00:00.000Z"
 *                   - id: 2
 *                     name: "John Doe"
 *                     email: "john.doe@example.com"
 *                     createdAt: "2023-01-02T14:30:00.000Z"
 *       401:
 *         description: Unauthorized – missing or invalid token
 *         content:
 *           application/json:
 *             examples:
 *               noToken:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized"
 *               invalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Private]
 *     summary: Update current user's profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               patronymic:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Updated user
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as { id: number }).id;
    const updates: UpdateProfileBody = req.body;

    // Validate email if provided
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }
      const existing = await User.findOne({ where: { email: updates.email } });
      if (existing && existing.id !== userId) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
    }

    if (updates.gender && !['male', 'female'].includes(updates.gender)) {
      res.status(400).json({ message: 'Gender must be male or female' });
      return;
    }

    // Prepare data for update with correct types
    const updateData: Partial<UserAttributes> = {};
    if (updates.firstName) updateData.firstName = updates.firstName;
    if (updates.lastName) updateData.lastName = updates.lastName;
    if (updates.patronymic) updateData.patronymic = updates.patronymic;
    if (updates.gender) updateData.gender = updates.gender;
    if (updates.email) updateData.email = updates.email;
    if (updates.dateOfBirth) {
      const dob = new Date(updates.dateOfBirth);
      if (isNaN(dob.getTime())) {
        res.status(400).json({ message: 'Invalid date of birth' });
        return;
      }
      updateData.dateOfBirth = dob;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await user.update(updateData);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate user and get JWT access + refresh tokens
 *     description: |
 *       Authenticates a user by email and password.
 *
 *       Upon successful authentication, returns both an **access token** (short-lived) and a **refresh token** (long-lived).
 *       The access token is used to access protected endpoints; the refresh token is used to obtain a new access token when it expires.
 *     operationId: loginUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MySecurePassword123!"
 *           examples:
 *             validLogin:
 *               summary: Valid credentials
 *               value:
 *                 email: "john.doe@example.com"
 *                 password: "MySecurePassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token (expires in 15 minutes by default)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   description: Secure random refresh token (stored in DB, expires in 7 days by default)
 *                   example: "a1b2c3d4e5f67890abcdef1234567890abcdef12"
 *       400:
 *         description: Bad request – missing email or password
 *         content:
 *           application/json:
 *             example:
 *               message: "email and password required"
 *       401:
 *         description: Unauthorized – invalid email or password
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid email or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;
    if (!email || !password) {
      res.status(400).json({ message: 'email and password required' });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' } as SignOptions
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpiry = new Date();
    refreshExpiry.setDate(
      refreshExpiry.getDate() +
        (parseInt(process.env.REFRESH_TOKEN_DAYS as string, 10) || 7)
    );

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiry,
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Get a new access token using a refresh token
 *     description: |
 *       Exchanges a valid refresh token for a new access token.
 *       This endpoint also **rotates** the refresh token for security: the old refresh token is invalidated,
 *       and a new refresh token is issued. The client should store the new refresh token and use it for future refreshes.
 *     operationId: refreshAccessToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token obtained during login or a previous refresh
 *                 example: "a1b2c3d4e5f67890abcdef1234567890abcdef12"
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   description: New refresh token (old one is invalidated)
 *                   example: "f6e5d4c3b2a19876543210fedcba9876543210fe"
 *       400:
 *         description: Bad request – missing refresh token
 *         content:
 *           application/json:
 *             example:
 *               message: "Refresh token required"
 *       401:
 *         description: Unauthorized – invalid or expired refresh token
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid or expired refresh token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "An unexpected error occurred"
 */
const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshBody;
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token required' });
      return;
    }

    const tokenRecord = (await RefreshToken.findOne({
      where: {
        token: refreshToken,
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [{ model: User, attributes: ['id', 'email'] }],
    })) as RefreshTokenWithUser | null;

    if (!tokenRecord) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    const user = tokenRecord.user;

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' } as SignOptions
    );

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newExpiry = new Date();
    newExpiry.setDate(
      newExpiry.getDate() +
        (parseInt(process.env.REFRESH_TOKEN_DAYS as string, 10) || 7)
    );

    await sequelize.transaction(async (t) => {
      await RefreshToken.destroy({
        where: { id: tokenRecord.id },
        transaction: t,
      });
      await RefreshToken.create(
        {
          userId: tokenRecord.userId,
          token: newRefreshToken,
          expiresAt: newExpiry,
        },
        { transaction: t }
      );
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export { getUsers, createUser, loginUser, refreshToken, updateUserProfile };
