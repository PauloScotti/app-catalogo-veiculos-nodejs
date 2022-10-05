import type {NextApiRequest, NextApiResponse} from 'next';
import {conectaMongoDB} from '../../middlewares/conectaMongoDB';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraMsg';
import { UsuarioModel } from '../../models/UsuarioModel';
import jwt from 'jsonwebtoken';
import { LoginResposta } from '../../types/LoignResposta';
import { politicaCORS } from '../../middlewares/politicaCORS';
import md5 from 'md5';


// eslint-disable-next-line import/no-anonymous-default-export
const endpointLogin = async (
    req: NextApiRequest,
    res: NextApiResponse<RespostaPadraoMsg | LoginResposta>
    ) => {

        const {CHAVE_JWT} = process.env;
        if(!CHAVE_JWT){
            return res.status(500).json({erro : "ENV JWT não informado!"});
        }

        if(req.method === 'POST'){
        const {login, senha} = req.body;

        
        const usuariosEncontrados = await UsuarioModel.find({email: login, senha : md5(senha)});
        
        if( usuariosEncontrados && usuariosEncontrados.length > 0) {
            const usuarioEncontrado = usuariosEncontrados[0];

            if(usuarioEncontrado.nivelAcesso === 'Administrador'){
                const tokenAdm = jwt.sign({_id : usuarioEncontrado._id}, CHAVE_JWT);
                return res.status(200).json({nome: usuarioEncontrado.nome, email: usuarioEncontrado.email, nivelAcesso: usuarioEncontrado.nivelAcesso, tokenAdm});
            } else {
                const token = jwt.sign({_id : usuarioEncontrado._id}, CHAVE_JWT);
                return res.status(200).json({nome: usuarioEncontrado.nome, email: usuarioEncontrado.email, nivelAcesso: usuarioEncontrado.nivelAcesso, token});
            }

        }

        return res.status(400).json({erro : "Usuário ou senha inválidos!"});
    }


    return res.status(405).json({erro : "Método informado não é válido!"});
}

export default politicaCORS(conectaMongoDB(endpointLogin));
