import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from "./routes/propiedadesRoute.js";
import appRoutes from "./routes/appRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import db from './config/db.js';
import { cookie } from 'express-validator';


// crear la app
const app = express();

// habilitar lecturas de datos del formulario
app.use(express.urlencoded({extended: true}))

// habilitar cookie parser
app.use(cookieParser())

// habilitar CSRF
app.use(csrf({cookie: true}))
// conecxion a la base de datos
try {
    await db.authenticate();
    db.sync()
    console.log("Conexion correcta a la base de datos")
} catch (error) {
    console.log(error)
}


//habilitar pug
app.set('view engine', 'pug');
app.set('views', './views');

// donde estara la carpeta de archivos publica
app.use(express.static('public'));
// Routing
// cuando alguien visite la diagonal tendremos un callback
// get solo busca una ruta especifica, use busca todas las que inicien con una /
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes)


// definir un puerto y arrancar el proyecto
const port = 3000;
app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})
