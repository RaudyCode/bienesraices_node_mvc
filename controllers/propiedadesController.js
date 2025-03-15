import {unlink} from "node:fs/promises";
import { validationResult } from "express-validator";
import {Categoria, Precio, Propiedad, Usuario, Mensaje} from '../modules/index.js';
import { query } from "express";
import { esVendedor, formatearFecha } from "../helpers/index.js";

const admin = async (req, res) => {  
    
    const {id} = req.usuario;    

    const expresion = /^[0-9]$/

    // leer querystring
    const {pagina: paginaActual} = req.query;
    
    if(!expresion.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1')
    }


    try {
        
        const {id} = req.usuario;
    
        // Limite y Offset para el paginador
        const limite = 5;
        
        const offset = ((paginaActual * limite) - limite)

        

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit: limite,
                offset,
                where:{
                    usuarioId: id
                }, 
                include: [
                    {model: Categoria, as: 'categoria'},
                    {model: Precio, as: 'precio'},
                    {model: Mensaje, as: 'mensajes'}
                ] 
            }),
            // saber cuantos botones crear
            Propiedad.count({
                where:{
                    usuarioId: id
                } 
            })
        ])
        res.render('propiedades/admin', {
            pagina: "Mis Propiedades",
            nombre: req.usuario.nombre,
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total/limite),
            paginaActual: Number(paginaActual),
            total, 
            offset, 
            limite
        })

        
    } catch (error) {
        console.log(error)
    }

}
// formulario para crear una nueva propiedad
const crear = async (req, res)=>{

    // Consultar modelos de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);
    
    res.render('propiedades/crear', {
        pagina: "Crear Propiedad",
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos:{},
        nombre: req.usuario.nombre
        
    })

}

const guardar = async (req, res) => {
    // validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        // Consultar modelos de precios y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);
        

        return res.render('propiedades/crear', {
            pagina: "Crear Propiedad",
            barra: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
            
        })
    }

    // crear un registro
    const {titulo,  descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body

    console.log(req.usuario.id)

    const {id: usuarioId} = req.usuario;
    try {
        const propiedadGuardado = await Propiedad.create({
            titulo, 
            descripcion, 
            habitaciones, 
            estacionamiento, 
            wc, 
            calle, 
            lat, 
            lng, 
            precioId,
            categoriaId,
            usuarioId,
            imagen:''
        })

        const {id}= propiedadGuardado

        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error)
    }
}

const agregarImagen = async (req, res) => {
    const {id} = req.params;

    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // validar que la propiedad no este publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }


    // validar que la propiedad pertenece a quien visita esta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }


    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen De: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad,
        nombre: req.usuario.nombre
    })
}

const almacenarImagen = async (req, res, next) => {
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no esté publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece al usuario actual
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que el archivo se ha subido
    if (!req.file || !req.file.filename) {
        console.log('No se ha cargado ningún archivo');
        return res.redirect(`/propiedades/agregar-imagen/${id}`);
    }

    try {
        // Almacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();
        console.log('Propiedad actualizada correctamente:', propiedad);

        next();
    } catch (error) {
        console.log('Error al guardar la propiedad:', error);
    }
};


const editar = async (req, res) => {

    const {id}=req.params;

    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }

    // Consultar modelos de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    // revisar que quien visite la url sea el que creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }
    
    res.render('propiedades/editar', {
        pagina: `Editar Propiedad ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos:propiedad,
        nombre: req.usuario.nombre
        
    })
}

const guardarCambios=async (req, res)=>{

    //verificar la validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        // Consultar modelos de precios y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);
        

        return res.render('propiedades/editar', {
            pagina: "Editar Propiedad",
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
            
        })
    }

    const {id}=req.params;

    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }

    

    // revisar que quien visite la url sea el que creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }
    
    // reescribir el objeto y actualizarlo
    try {
        const {titulo,  descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })

        await propiedad.save();

        res.redirect('/mis-propiedades');
    } catch (error) {
        console.log(error)
    }
}

const eliminar = async (req, res)=>{
    const {id}=req.params;

    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }

    

    // revisar que quien visite la url sea el que creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }
    
    // eliminar imagen
    await unlink(`public/img/uploads/${propiedad.imagen}`)

    // eliminar la propiedad

    await propiedad.destroy()
    res.redirect('/mis-propiedades');
    
}

// modifiacar el estado de una propiedad
const cambiarEstado = async (req, res) => {
    const {id}=req.params;

    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }

    

    // revisar que quien visite la url sea el que creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    // Actualizar
    if(propiedad.publicado){
        propiedad.publicado = 0
    } else {
        propiedad.publicado = 1
    }

    await propiedad.save()

    res.json({
        resultado: true
    })
}

// Muestra una propiedad 
const mostrarPropiedad = async (req, res) => {
    const {id} = req.params;

    
    const propiedad = await Propiedad.findByPk(id, {
        include:[
            {model: Categoria, as: 'categoria'},
            {model: Precio, as: 'precio'}
        ]
    });

    

    if(!propiedad || !propiedad.publicado){
        return res.redirect('/404')
    }

    const vendedor = await Usuario.findByPk(propiedad.usuarioId)



    // Comprobar que la Propiedad Exista
    res.render('propiedades/mostrar', {
        propiedad,
        pagina:propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        vendedorName: vendedor.nombre,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
    })
}

const enviarMensaje = async (req, res) => {
    const {id} = req.params;

    
    const propiedad = await Propiedad.findByPk(id, {
        include:[
            {model: Categoria, as: 'categoria'},
            {model: Precio, as: 'precio'}
        ]
    });

   

   

    if(!propiedad){
        return res.redirect('/404')
    }
    // identificar el vendedor de esa propiedad
    const vendedor = await Usuario.findByPk(propiedad.usuarioId)

    // renderisar los errores

    // validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        return res.render('propiedades/mostrar', {
            propiedad,
            pagina:propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            vendedorName: vendedor.nombre,
            errores: resultado.array()
        })
        
    }

    const {mensaje} = req.body;
    const {id: propiedadId} = req.params;
    const {id: usuarioId} = req.usuario

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    // Comprobar que la Propiedad Exista
    res.redirect('/')
}

// leer mensajes recividos
const verMensajes = async (req, res) => {
    const {id}=req.params;

    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Mensaje, as: 'mensajes', 
                include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            }
        ] 
    });

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }

    

    // revisar que quien visite la url sea el que creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    console.log(propiedad.mensajes)

    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        usuario: req.usuario,
        mensajes: propiedad.mensajes,
        formatearFecha
    })
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes
}