import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_DIR });

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
};

async function initialize() {
    await oracledb.createPool(dbConfig);
}

export { initialize };
