
const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: "Preencha todos os campos." });
        }

        const existente = await prisma.usuario.findFirst({
            where: { email }
        });

        if (existente) {
            return res.status(409).json({ error: "E-mail já cadastrado." });
        }

        const item = await prisma.usuario.create({
            data: { nome, email, senha },
            select: { id: true, nome: true, email: true }
        });

        return res.status(201).json(item);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao cadastrar usuário." });
    }
};

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: "Informe o e-mail e a senha." });
        }

        const usuario = await prisma.usuario.findFirst({
            where: { email }
        });

        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ error: "E-mail ou senha incorretos." });
        }

        return res.status(200).json({
            message: "Login realizado com sucesso.",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao realizar login." });
    }
};

const listar = async (req, res) => {
    try {
        const lista = await prisma.usuario.findMany({
            select: { id: true, nome: true, email: true }
        });

        return res.status(200).json(lista);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar usuários." });
    }
};

const buscar = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await prisma.usuario.findUnique({
            where: { id: Number(id) },
            select: { id: true, nome: true, email: true }
        });

        if (!item) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar usuário." });
    }
};

const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const dados = req.body;

        const item = await prisma.usuario.update({
            where: { id: Number(id) },
            data: dados,
            select: { id: true, nome: true, email: true }
        });

        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao atualizar usuário." });
    }
};

const excluir = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await prisma.usuario.delete({
            where: { id: Number(id) },
            select: { id: true, nome: true, email: true }
        });

        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao excluir usuário." });
    }
};

module.exports = {
    cadastrar,
    login,
    listar,
    buscar,
    atualizar,
    excluir
};