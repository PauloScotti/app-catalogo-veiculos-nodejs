import type {NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraMsg';
import { UsuarioModel } from '../../models/UsuarioModel';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectaMongoDB } from '../../middlewares/conectaMongoDB';
import nc from 'next-connect';
import { politicaCORS } from '../../middlewares/politicaCORS';

const handler = nc()
    .put(async (req: any, res: NextApiResponse<RespostaPadraoMsg> | any) => {
        try{
            const {id} = req?.query;
            const usuario = await UsuarioModel.findById(id);
            const { nome, nivelAcesso } = req.body;

            if(!usuario){
                return res.status(400).json({erro: 'Usuário não encontrado'});
            }
            await UsuarioModel.findByIdAndUpdate({_id : usuario._id}, { $set: { nome : nome, nivelAcesso: nivelAcesso } });

            return res.status(200).json({msg: 'Usuário atualizado com sucesso!'});


        }catch(e){
            console.log(e);
            return res.status(400).json({erro: `Não foi possível atualizar o usuário` + e});
        }

    });

export default politicaCORS(validarTokenJWT(conectaMongoDB(handler)));