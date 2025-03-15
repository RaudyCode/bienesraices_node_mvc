import express from 'express'
import {body} from 'express-validator'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, cambiarEstado, mostrarPropiedad, enviarMensaje, verMensajes} from '../controllers/propiedadesController.js'
import protegerRuta from '../middleware/protejerRuta.js'
import upload from '../middleware/subirImagen.js';
import identificarUsuario from '../middleware/identificarUsuario.js';


const router = express.Router()

router.get('/mis-propiedades', protegerRuta, admin)
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', protegerRuta,  
    body('titulo').notEmpty().withMessage("El Titulo del Anuncio es Obligatorio"),
    body('descripcion')
        .notEmpty().withMessage("La descripcion no debe de ir vacia")
        .isLength({max:200}).withMessage('La Descripcion es muy Larga'),
    body('categoria').isNumeric().withMessage('Selecciona Una Categoria'),
    body('precio').isNumeric().withMessage('Selecciona Un Rango de Precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de Baños'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar
)

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)

router.post('/propiedades/agregar-imagen/:id', 
    protegerRuta, 
    upload.single('imagen'),
    almacenarImagen
)


router.get('/propiedades/editar/:id', 
    protegerRuta,
    editar
)
router.post('/propiedades/editar/:id', 
    body('titulo').notEmpty().withMessage("El Titulo del Anuncio es Obligatorio"),
    body('descripcion')
        .notEmpty().withMessage("La descripcion no debe de ir vacia")
        .isLength({max:200}).withMessage('La Descripcion es muy Larga'),
    body('categoria').isNumeric().withMessage('Selecciona Una Categoria'),
    body('precio').isNumeric().withMessage('Selecciona Un Rango de Precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de Baños'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    protegerRuta,
    guardarCambios
)

router.post('/propiedades/eliminar/:id', 
    protegerRuta,
    eliminar
)

router.put('/propiedades/:id',
    protegerRuta,
    cambiarEstado
)


// Area Publica 
router.get('/propiedad/:id', 
    identificarUsuario,
    mostrarPropiedad
)

// almacenar los mensajes 
router.post('/propiedad/:id', 
    identificarUsuario,
    body('mensaje').isLength({min:10}).withMessage("El mensaje no puede ir vacio o es muy corto"),
    enviarMensaje
)

router.get('/mensajes/:id',
    protegerRuta,
    verMensajes
)
export default router