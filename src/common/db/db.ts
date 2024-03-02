import * as postgres from 'postgres';
import { config } from '../config/config.env';

const sql = postgres(config.POSTGRES_LINK);

export default sql;
