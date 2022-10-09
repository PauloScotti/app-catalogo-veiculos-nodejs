import type { NextApiRequest, NextApiResponse } from "next";
import { RespostaPadraoMsg } from "../../types/RespostaPadraMsg";
import { conectaMongoDB } from "../../middlewares/conectaMongoDB";
import { VeiculosModel } from "../../models/VeiculosModel";
import { politicaCORS } from "../../middlewares/politicaCORS";

const endpointPesquisaVeiculos = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {
    try{
        if(req.method === 'GET'){

            if(req?.query?.id){
                const veiculoEncontrado = await VeiculosModel.findById(req?.query?.id);
                if(!veiculoEncontrado){
                    return res.status(400).json({erro: 'Veículo não encontrado'});
                }

                return res.status(200).json(veiculoEncontrado);

            } else if(req.method === 'GET'){

                const veiculoEncontrado = await VeiculosModel.find().sort({valor: 1});
                if(!veiculoEncontrado){
                    return res.status(400).json({erro: 'Veículo não encontrado'});
                }
                
                return res.status(200).json(veiculoEncontrado);

        } else {
                const {filtro} = req.query;

                if(!filtro || filtro.length < 2){
                    return res.status(400).json({erro: 'Favor informar ao menos dois caracteres na busca'});
                }

                const veiculosEncontrados = await VeiculosModel
                .find({nome : {$regex : filtro, $options: 'i'}})
                .sort({valor: 1});

                return res.status(200).json(veiculosEncontrados);
            }

        }
        
        return res.status(405).json({erro: 'Método informado não é válido'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Não foi possível buscar os veículos'});
    }
}

export default politicaCORS((conectaMongoDB(endpointPesquisaVeiculos)));