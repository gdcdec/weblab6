import Sequelize from 'sequelize';
import dotenv from 'dotenv';

// load .env configuration
dotenv.config()

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DATABASE_DIALECT,
        port: process.env.DB_PORT
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connection established');
    } catch(error) {
        console.error('DB connection failed: ', error);
    }
};

export {sequelize, connectDB};
