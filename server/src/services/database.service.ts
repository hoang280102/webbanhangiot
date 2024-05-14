import mysql, { Connection } from "mysql2/promise";
import "dotenv/config";
const password = process.env.PASSWORD;

const connectionConfig = {
  host: "127.0.0.1",
  user: "root",
  password: password,
  database: "iot",
};
export const connectToDatabase = async (): Promise<Connection> => {
  const connection = await mysql.createConnection(connectionConfig);
  // Kiểm tra kết nối
  try {
    await connection.connect();
    console.log("Connected to MySQL database!");
    return connection;
  } catch (error) {
    console.error("Error connecting to MySQL database:", error);
    throw error;
  }
};
export const closeConnection = async (
  connection: Connection
): Promise<void> => {
  try {
    await connection.end();
    console.log("Connection to MySQL database closed!");
  } catch (error) {
    console.error("Error closing connection to MySQL database:", error);
    throw error;
  }
};
