import jwt, { decode } from 'jsonwebtoken'
import {Usuario} from '../modules/index.js'

const identificarUsuario = async (req, res, next) => {
    // identificar si hay token
    const {_token} = req.cookies;
    if(!_token){
        req.usuario = null
        return next();
    }

    // Comprobar el Token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)

        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)
                
        // almacenar el usuario al req
        if(usuario) {
            req.usuario = usuario
        }

        return next();
        
    } catch (error) {
        console.log(error)
        return res.clearCookie('_token').redirect('/auth/login')
    }
}


export default identificarUsuario