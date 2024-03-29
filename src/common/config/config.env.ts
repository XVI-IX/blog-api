import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  POSTGRES_LINK: process.env.POSTGRES_CONNECTION,
  JWT_SECRET: process.env.JWT_SECRET,
  API_LINK: process.env.API_LINK,
};
