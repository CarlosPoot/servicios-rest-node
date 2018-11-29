const express = require("express");
const app = express();
const Usuario = require("../modelo/usuario");
const { verificaToken, verificaAdminRol} = require( '../middlewares/autenticacion' );

const bcrypt = require("bcrypt");
const _ = require("underscore");

app.get("/usuario",  verificaToken  ,function(req, res) {
  //parametros opcionales
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  Usuario.find({  estado:true }, 'nombre email role google estado img')
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err: err
        });
      }

      //Contar el total de registro optenidos
      Usuario.count({ estado:true}, (err, count) => {
        res.json({
          ok: true,
          usuarios: usuarios,
          conteo: count
        });
      });
    });
});

app.post("/usuario", [verificaToken, verificaAdminRol ]  ,function(req, res) {
  let body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  });

  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }

    res.json({
      ok: true,
      usuario: usuarioDB
    });
  });
});

//con parametros
app.put("/usuario/:id", [verificaToken, verificaAdminRol ] ,function(req, res) {
  let id = req.params.id;
  let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

  Usuario.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, usuarioDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDB,
        res: "correcto"
      });
    }
  );
});

app.delete("/usuario/:id",  [verificaToken, verificaAdminRol ] ,function(req, res) {
    
    let id = req.params.id;

    // Usuario.findByIdAndRemove( id , ( err , usuarioBorrado) =>{
    //     if( err ){
    //         return res.header(400).json({
    //             ok : false,
    //             err
    //         });
    //     }

    //     if(!usuarioBorrado ){
    //         return res.header(400).json({
    //             ok: false,
    //             err : {
    //                 message : "Usuario no encontrado"
    //             }
    //         });
    //     }

    //     res.header(200).json({
    //         ok : true,
    //         usuarioBorrado
    //     });
    // });

    let arra = [1];
    console.log( arra.length );

    Usuario.findByIdAndUpdate(id, { estado:false }, { new: true}  ,(err, usuarioBorrado) =>{

        if( err ){
            return res.header(400).json({
                ok:false,
                err
            })

        }

        res.json({
            ok: true,
            usuarioBorrado
        });

    });



});

module.exports = app;
