const express = require("express");
let {
  verificaToken,
  verificaAdminRol
} = require("../middlewares/autenticacion");
let app = express();
//Declaro el modelo a usar
let Categoria = require("../modelo/Categoria");

app.get("/categoria", verificaToken, (req, res) => {
  Categoria.find({})
    .sort("descripcion")
    .populate("usuario", "nombre email")
    .exec((err, categorias) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err: err
        });
      }

      res.json({
        categorias: categorias
      });
    });
});

app.get("/categoria/:id", verificaToken, (req, res) => {
  let id = req.params.id;

  Categoria.findById(id, (err, categoriaDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: true,
        message: "No se encontro el ID"
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

app.post("/categoria", verificaToken, (req, res) => {
  let body = req.body;

  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

app.put("/categoria/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Categoria.findByIdAndUpdate(
    id,
    { descripcion: body.descripcion },
    { new: true, runValidators: true },
    (err, categoriaDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err
        });
      }

      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err: err
        });
      }

      res.json({
        ok: true,
        categoria: categoriaDB
      });
    }
  );
});

app.delete("/categoria/:id", [verificaToken, verificaAdminRol], (req, res) => {
  let id = req.params.id;

  Categoria.findOneAndRemove(id, (err, categoriDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "El id no existe"
        }
      });
    }

    res.json({
      ok: true,
      message: "Categoria Borrada"
    });
  });
});

module.exports = app;
