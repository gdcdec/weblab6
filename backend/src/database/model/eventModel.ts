import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@config/db.js';
import User from '@models/userModel.js';

export const categories = {
  education: 'education',
  amusement: 'amusement',
  work: 'work',
  hobby: 'hobby',
  other: 'other',
} as const;

export type Category = (typeof categories)[keyof typeof categories];

interface EventAttributes {
  id: number;
  title: string;
  description: string | null;
  category: Category;
  date: Date;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public category!: Category;
  public date!: Date;
  public createdBy!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     events:
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
 */
Event.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
      allowNull: false,
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
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'events',
  }
);

User.hasMany(Event, { foreignKey: 'createdBy' });
Event.belongsTo(User, { foreignKey: 'createdBy' });

sequelize
  .sync()
  .then(() => {
    console.log("Table 'events' created successfully!");
  })
  .catch((err) => {
    console.error("Unable to create table 'events': ", err);
  });

export { Event as eventModel };
