import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

// Habilitar variables de entorno
dotenv.config({ path: '.env' });

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS, {
  host: process.env.BD_HOST,
  port: process.env.BD_PORT || 3306, // Asegúrate de usar el puerto correcto
  dialect: "mysql",
  define: {
    timestamps: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false
});

// Verificar la conexión
db.authenticate()
  .then(() => {
    console.log('La conexión a la base de datos fue exitosa');
  })
  .catch((error) => {
    console.error('No se pudo conectar a la base de datos:', error);
  });

export default db;
