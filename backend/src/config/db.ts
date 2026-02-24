import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST as string,
    dialect: process.env.DATABASE_DIALECT as Dialect,
    port: parseInt(process.env.DB_PORT as string, 10),
  }
);

const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('DB connection established');
  } catch (error) {
    console.error('DB connection failed: ', error);
  }
};

export { sequelize, connectDB };
