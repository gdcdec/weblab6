import userModel from "../database/model/userModel.js";

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user with name, email, and password. The password will be automatically hashed before storage.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateRequest'
 *           examples:
 *             validRequest:
 *               summary: Valid user registration
 *               value:
 *                 name: "Alice Johnson"
 *                 email: "alice.johnson@example.com"
 *                 password: "SecurePassword456!"
 *             missingFields:
 *               summary: Missing required fields
 *               value:
 *                 name: "Alice Johnson"
 *                 email: "alice.johnson@example.com"
 *             invalidEmail:
 *               summary: Invalid email format
 *               value:
 *                 name: "Alice Johnson"
 *                 email: "invalid-email"
 *                 password: "SecurePassword456!"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             examples:
 *               successResponse:
 *                 summary: User created successfully
 *                 value:
 *                   id: 3
 *                   name: "Alice Johnson"
 *                   email: "alice.johnson@example.com"
 *                   createdAt: "2023-01-03T14:30:00.000Z"
 *       400:
 *         description: Bad request - missing required fields or user already exists
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "name, email and password required"
 *               duplicateEmail:
 *                 summary: Email already exists
 *                 value:
 *                   message: "user already exists"
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   message: "Invalid email format"
 *       500:
 *         description: Internal server error
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
 *     description: Retrieve a list of all registered users. Passwords are excluded from the response for security.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 *             examples:
 *               usersList:
 *                 summary: Example list of users
 *                 value:
 *                   - id: 1
 *                     name: "John Doe"
 *                     email: "john.doe@example.com"
 *                     createdAt: "2023-01-01T10:00:00.000Z"
 *                   - id: 2
 *                     name: "Jane Smith"
 *                     email: "jane.smith@example.com"
 *                     createdAt: "2023-01-02T14:30:00.000Z"
 *                   - id: 3
 *                     name: "Alice Johnson"
 *                     email: "alice.johnson@example.com"
 *                     createdAt: "2023-01-03T09:15:00.000Z"
 *       500:
 *         description: Internal server error
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

export { getUsers, createUser }
