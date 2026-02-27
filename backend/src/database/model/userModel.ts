import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@config/db.js';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  gender: 'male' | 'female';
  dateOfBirth: Date;
  email: string;
  password: string;
  createdAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public patronymic!: string;
  public gender!: 'male' | 'female';
  public dateOfBirth!: Date;
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
 *       description: User entity
 *       required:
 *         - firstName
 *         - lastName
 *         - patronymic
 *         - gender
 *         - dateOfBirth
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         patronymic:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           writeOnly: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
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
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    patronymic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
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

sequelize
  .sync()
  .then(() => {
    console.log("Table 'users' created successfully!");
  })
  .catch((err) => {
    console.error("Unable to create table 'users': ", err);
  });

export default User;
