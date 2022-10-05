import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import mongoose from 'mongoose';
import type {RespostaPadraoMsg} from '../types/RespostaPadraMsg';

export const conectaMongoDB = (handler : NextApiHandler) => 
    async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {

    if(mongoose.connections[0].readyState) {
        return handler(req, res);
    }

    const {DB_CONEXAO_STRING} = process.env;

    if(!DB_CONEXAO_STRING){
        return res.status(500).json({erro: 'ENV de configuração do banco não informada'});
    }

    mongoose.connection.on('connected', () => console.log("Banco de Dados conectado com sucesso!"));
    mongoose.connection.on('error', error => console.log(`Erro ao conectar com o banco de dados: ${error}`));
    await mongoose.connect(DB_CONEXAO_STRING);

    return handler(req, res);
}