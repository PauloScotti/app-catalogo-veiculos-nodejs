import type {NextApiRequest, NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraMsg';
import { VeiculosModel } from '../../models/VeiculosModel';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectaMongoDB } from '../../middlewares/conectaMongoDB';
import nc from 'next-connect';
import { politicaCORS } from '../../middlewares/politicaCORS';

const handler = nc()
    .delete(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {
        try{
            const {id} = req?.query;
            const veiculo = await VeiculosModel.findById(id);

            if(!veiculo){
                return res.status(400).json({erro: 'Veículo não encontrado'});
            }

            await VeiculosModel.findByIdAndDelete({_id : veiculo._id}, veiculo);

            return res.status(200).json({ msg: "Veículo deletado com sucesso!"});

        } catch(e){
                console.log(e);
                return res.status(500).json({erro: 'Não foi possível buscar o veículo'});
        }

    });


export const config = {
    api: {
        bodyParser : false
    }
}

export default politicaCORS(validarTokenJWT(conectaMongoDB(handler)));