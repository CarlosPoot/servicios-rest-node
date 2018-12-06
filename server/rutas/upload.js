
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const fs = require('fs');
const path = require('path');

const Usuario = require('../modelo/usuario');
const Producto = require( '../modelo/producto' );

// default options
//todos los archivos que sean enviados en el post se pasaran a req.files
app.use(fileUpload());


app.put("/upload/:tipo/:id", ( req, res )=>{

    let tipo = req.params.tipo;
    let id = req.params.id;

    if ( !req.files ) {
        return res.status(400).json({
            ok : false,
            message : 'No se recibieron archivos.'
        });
    }

    let tiposPermitidos = [ "productos", "usuarios" ];
    if( tiposPermitidos.indexOf(tipo) < 0 ){
        return res.status(400).json({
            ok : false,
            message : "solo se permiten los tipos " + tiposPermitidos.join(', '),
        })
    }


    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length -1];
    
    let extencionesValidas = ["png", "jpg", "gif" ];
    if( extencionesValidas.indexOf(extension) < 0 ){
        return res.status(400).json({
            ok : false,
            message : "solo se permiten archivos de tipo:  " + extencionesValidas.join(', '),
            ext : extension 
        })
    }

    let nombreFile = `${ id }-${ new Date().getMilliseconds() }.${extension}`

    // Use the mv() method to place the file somewhere on your server
  archivo.mv(`upload/${tipo}/${ nombreFile }`, (err)=> {
    if (err)
        return res.status(500).json({
          ok :false,  
          err
        });

        if( tipo == "usuarioa" ){
            imagenUsuario( id , res , nombreFile, tipo);
        }else{
            imagenProducto( id , res, nombreFile ,tipo )
        }

  });
});


function imagenProducto(  id , res, nombreFile ,tipo  ){
    Producto.findById( id , ( err , productoDB )=>{
        if( err ){
            borrarArchivo( nombreFile , tipo );
            return res.status(500).json({
                ok :false,  
                err
            });
        }

        if( err ){
            borrarArchivo( nombreFile , tipo );
            return res.status(400).json({
                ok :false,  
                message : "El producto existe"
            });
        }
    
        borrarArchivo( productoDB.img , tipo );

        productoDB.img = nombreFile;
        productoDB.save( (err , productoGuardado) =>{
            if( err ){
                return res.status(500).json({
                    ok :false,  
                    err
                });
            }

            return res.json({
                ok : true,
                producto : productoGuardado
            })

        });

    });



}

function  imagenUsuario( id , res, nombreFile ,tipo ){
    Usuario.findById( id , ( err , usuarioDB )=>{
        if( err ){
            borrarArchivo( nombreFile , tipo );
            return res.status(500).json({
                ok :false,  
                err
            });
        }

        if( err ){
            borrarArchivo( nombreFile , tipo );
            return res.status(400).json({
                ok :false,  
                message : "El usuario No existe"
            });
        }
    
        borrarArchivo( usuarioDB.img , tipo );

        usuarioDB.img = nombreFile;
        usuarioDB.save( (err , usuarioGuardado) =>{
            if( err ){
                return res.status(500).json({
                    ok :false,  
                    err
                });
            }

            return res.json({
                ok : true,
                usuario : usuarioGuardado
            })

        });

    });
}

function borrarArchivo( nombreArchivo, tipo ){
    let pathImagen = path.resolve( __dirname, `../../upload/${tipo}/${ nombreArchivo }`)
    if( fs.existsSync( pathImagen) ){
        fs.unlinkSync( pathImagen )
    }
}

module.exports = app;