const express = require("express");

const router = express.Router();

const {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir,
    login
} = require("../controllers/usuario.controller");

router.post("/cadastrar", cadastrar);
router.post("/login", login);
router.get("/listar", listar);
router.get("/buscar/:id", buscar);
router.put("/atualizar/:id", atualizar);
router.delete("/excluir/:id", excluir);

module.exports = router;