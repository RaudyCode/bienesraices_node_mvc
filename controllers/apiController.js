import { Model } from 'sequelize'
import {Propiedad, Precio, Categoria} from '../modules/index.js'

const propiedades = async (req, res) => {

    const propiedades = await Propiedad.findAll({
        include:[
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'}
        ]
    })
    res.json(propiedades)
}

export {
    propiedades

}