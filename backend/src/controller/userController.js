import userModel from "../database/model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "name, email and password required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        // Check whether user already exists
        const isUserExists = await userModel.findOne({ where: { email } });
        if(isUserExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Create user if it not exists yet.
        // Note: The password will be automatically hashed by the model's
        // beforeCreate hook
        const newUser = await userModel.create({
            name,
            email,
            password,
            createdAt: new Date()
        });

        // Remove password from response
        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt
        };

        return res.status(201).json(userResponse)
    } catch (err) {
        next(err);
    }
}

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
const getUsers = async (req, res, next) => {
    try {
        const users = await userModel.findAll({
            // Exclude password
            attributes: ['id', 'name', 'email', 'createdAt']
        });
        return res.status(200).json(users)
    } catch (err) {
        next(err)
    }
}

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate user and get JWT token
 *     description: |
 *       Authenticates a user by email and password.
 *
 *       Upon successful authentication, returns a JWT token that can be used to access protected endpoints.
 *       The token expires in 1 hour.
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
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "email and password required"
            });
        }

        // Find the user by email
        const user = await userModel.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_SECRET, {
            expiresIn: '1h' // Token expires in 1 hour
        });

        return res.status(200).json({
            message: "Login successful", token
        });
    } catch (err) {
        next(err);
    }
}

export { getUsers, createUser, loginUser }
