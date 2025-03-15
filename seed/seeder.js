import categorias from "./categorias.js";
import precios from './precios.js';
import usuarios from './usuarios.js';
import {exit} from 'node:process';
import db from "../config/db.js";
import {Categoria, Precio, Usuario} from '../modules/index.js'


const inmportarDatos = async ()=>{
    try {
        //Autenticar
        await db.authenticate() 

        // Generar Las Columnas 
        await db.sync()


        await Promise.all([
            // Insertar los datos
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ]);

        console.log('Datos Importados Correctamente')
        exit()

    } catch (error) {
        console.log(error)
        exit(1)
    }
}

const eliminarDatos = async () => {
    try {
        // dos formas de eliminar, esta primera tendria que hacer una linea por cada modelo. imaginate tener 100 modelos
        /*await Promise.all([
            
            Categoria.destroy({where: {}, truncate: true}),
            Precios.destroy({where: {}, truncate: true})
        ])*/

        // esta forma solo es una linea
        await db.sync({force:true});
        
        console.log('Datos eliminados correctamente');
        exit();
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === "-i"){
    inmportarDatos();
}

if(process.argv[2] === "-e"){
    eliminarDatos();
}