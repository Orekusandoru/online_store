import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
export const BCRYPT_SALT_ROUNDS = 10;
