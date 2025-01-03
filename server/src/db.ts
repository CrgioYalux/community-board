import mysql from 'mysql2';
import environment from './environment';

const pool = mysql.createPool({
	multipleStatements: true,
	queueLimit: 10,
	connectionLimit: 10,
	host: environment.DB.HOST,
	port: environment.DB.PORT,
	user: environment.DB.USER,
	password: environment.DB.PASS,
	database: environment.DB.NAME,
	timezone: 'local',
});

const db = { pool };

export default db;
