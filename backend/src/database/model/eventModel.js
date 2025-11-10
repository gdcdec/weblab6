import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import userModel from "./userModel.js"

// Define 'events' model
const eventModel = sequelize.define('events', {
    id: {
        type: DataTypes.INTEGER,
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

export { eventModel };
