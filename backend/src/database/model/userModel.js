import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// Define the 'users' model
const userModel = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true }
    },
    createdAt: DataTypes.DATE
})

sequelize.sync().then(() => {
   console.log("Table 'users' created successfully!");
}).catch((err) => {
   console.error("Unable to create table 'users': ", err);
});

export default userModel;
