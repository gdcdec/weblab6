import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import userModel from "./userModel.js"

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       description: Event entity representing an activity or occasion
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           minimum: 0
 *           description: Auto-incremented unique identifier for the event
 *           example: 1
 *           readOnly: true
 *         title:
 *           type: string
 *           description: Title or name of the event
 *           minLength: 1
 *           maxLength: 255
 *           example: "Tech Conference 2024"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the event
 *           maxLength: 255
 *           example: "Annual technology conference with keynote speakers and workshops"
 *         category:
 *           type: string
 *           description: Category of the event
 *           enum: [education, amusement, work, hobby, other]
 *           example: "education"
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time when the event takes place
 *           example: "2024-05-15T09:00:00.000Z"
 *         createdBy:
 *           type: integer
 *           format: int64
 *           description: ID of the user who created this event
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the event was created
 *           example: "2024-01-10T14:30:00.000Z"
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the event was last updated
 *           example: "2024-01-15T10:00:00.000Z"
 *           readOnly: true
 *       required:
 *         - title
 *         - category
 *         - date
 *         - createdBy
 *       example:
 *         id: 1
 *         title: "Tech Conference 2024"
 *         description: "Annual technology conference with keynote speakers"
 *         category: "education"
 *         date: "2024-05-15T09:00:00.000Z"
 *         createdBy: 1
 *         createdAt: "2024-01-10T14:30:00.000Z"
 *         updatedAt: "2024-01-15T10:00:00.000Z"
 */

const categories = Object.freeze({
    education: "education",
    amusement: "amusement",
    work: "work",
    hobby: "hobby",
    other: "other"
});

// Define 'events' model
const eventModel = sequelize.define('events', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: userModel,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
});

userModel.hasMany(eventModel, { foreignKey: 'createdBy' });
eventModel.belongsTo(userModel, { foreignKey: 'createdBy' });

sequelize.sync().then(() => {
   console.log("Table 'events' created successfully!");
}).catch((err) => {
   console.error("Unable to create table 'events': ", err);
});

export { eventModel, categories };
