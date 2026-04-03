import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
    dialect: process.env.DB_DIALECT || "sqlite",
    ...(process.env.DB_DIALECT === "postgres" 
        ? {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: process.env.DB_SSL === "true",
            pool: {
                max: parseInt(process.env.DB_POOL_MAX || "10"),
                min: parseInt(process.env.DB_POOL_MIN || "2"),
                acquire: 30000,
                idle: 10000,
            },
            logging: process.env.NODE_ENV === "development" ? console.log : false
        }
        : {
            storage: "./data/restoBar.db"
        }
    )
});

export default sequelize;