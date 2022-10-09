import type { NextApiRequest, NextApiResponse } from "next";
import { RespostaPadraoMsg } from "../../types/RespostaPadraMsg";
import { conectaMongoDB } from "../../middlewares/conectaMongoDB";
import { UsuarioModel } from "../../models/UsuarioModel";
import { politicaCORS } from "../../middlewares/politicaCORS";

const endpointPesquisaVeiculos = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {
    try {
        if (req.method === 'GET') {

            if (req?.query?.id) {
                const usuarioEncontrado = await UsuarioModel.findById(req?.query?.id);
                if (!usuarioEncontrado) {
                    return res.status(400).json({ erro: 'Usuário não encontrado' });
                }

                return res.status(200).json(usuarioEncontrado);

            } else if (req.method === 'GET') {

                const usuarioEncontrado = await UsuarioModel.find().sort({ nome: 1 });
                if (!usuarioEncontrado) {
                    return res.status(400).json({ erro: 'Usuário não encontrado' });
                }

                return res.status(200).json(usuarioEncontrado);

            } else {
                const { filtro } = req.query;

                if (!filtro || filtro.length < 2) {
                    return res.status(400).json({ erro: 'Favor informar ao menos dois caracteres na busca' });
                }

                const usuariosEncontrados = await UsuarioModel
                    .find({ nome: { $regex: filtro, $options: 'i' } })
                    .sort({ nome: 1 });

                return res.status(200).json(usuariosEncontrados);
            }

        }

        return res.status(405).json({ erro: 'Método informado não é válido' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: 'Não foi possível buscar os usuários' });
    }
}

export default politicaCORS((conectaMongoDB(endpointPesquisaVeiculos)));