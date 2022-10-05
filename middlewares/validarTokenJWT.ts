import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { RespostaPadraoMsg } from "../types/RespostaPadraMsg";
import jwt, { JwtPayload } from "jsonwebtoken";

export const validarTokenJWT = (handler : NextApiHandler) => 
    (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {

        try{
            const {CHAVE_JWT} = process.env;
            if(!CHAVE_JWT) {
                return res.status(500).json({erro: 'ENV JWT não informada!'});
            }

            if(!req || !req.headers){
                return res.status(401).json({erro: 'Não foi possível validar o token de acesso!'});
            }

            if(req.method !== 'OPTIONS'){
                const authoriazation = req.headers['authorization'];
                if(!authoriazation){
                    return res.status(401).json({erro: 'Não foi possível validar o token de acesso!'});
                }

                const tokenAdm = authoriazation.substring(7);
                if(!tokenAdm){
                    return res.status(401).json({erro: 'Não foi possível validar o token de acesso!'});
                }

                const decoded = jwt.verify(tokenAdm, CHAVE_JWT) as JwtPayload;

                if(!decoded){
                    return res.status(401).json({erro: 'Não foi possível validar o token de acesso!'});
                }

                if(!req.query){
                    req.query = {};
                }

                req.query.userId = decoded._id;

            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({erro: 'Não foi possível validar o token de acesso!'});
        }

    return handler(req, res);

}