import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import userModel from "./userModel.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     refreshTokens:
 *       type: object
 *       description: Refresh token entity for JWT authentication
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: Auto-incremented unique identifier
 *           example: 1
 *           readOnly: true
 *         userId:
 *           type: integer
 *           format: int64
 *           description: ID of the user this token belongs to
 *           example: 1
 *         token:
 *           type: string
 *           description: The refresh token string (unique)
 *           example: "a1b2c3d4e5f6..."
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Expiration timestamp of the refresh token
 *           example: "2024-03-01T12:00:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the token was created
 *           example: "2024-02-23T12:00:00.000Z"
 *           readOnly: true
 *       required:
 *         - userId
 *         - token
 *         - expiresAt
 */

const refreshTokensModel = sequelize.define('refreshTokens', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: userModel,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    // Disable automatic updatedAt timestamp
    timestamps: false
});

// Associations
userModel.hasMany(refreshTokensModel, { foreignKey: 'userId', onDelete: 'CASCADE' });
refreshTokensModel.belongsTo(userModel, { foreignKey: 'userId' });

// Sync the model with database
sequelize.sync().then(() => {
    console.log("Table 'refreshTokens' created successfully!");
}).catch((err) => {
    console.error("Unable to create table 'refreshTokens': ", err);
});

export default refreshTokensModel;
