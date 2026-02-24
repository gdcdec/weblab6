import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@config/db.js';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public createdAt!: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     users:
 *       type: object
 *       description: User entity representing a person in the system
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           minimum: 0
 *           description: Auto-incremented unique identifier for the user
 *           example: 1
 *           readOnly: true
 *         name:
 *           type: string
 *           description: Full name of the user
 *           minLength: 1
 *           maxLength: 255
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Unique email address of the user
 *           maxLength: 255
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (will be hashed before storage)
 *           example: "MySecurePassword123!"
 *           minLength: 6
 *           writeOnly: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 *           example: "2023-01-01T10:00:00.000Z"
 *           readOnly: true
 *       example:
 *         id: 1
 *         name: "John Doe"
 *         email: "john.doe@example.com"
 *         createdAt: "2023-01-01T10:00:00.000Z"
 */
User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'users',
    timestamps: false,
  }
);

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

sequelize.sync().then(() => {
  console.log("Table 'users' created successfully!");
}).catch((err) => {
  console.error("Unable to create table 'users': ", err);
});

export default User;
