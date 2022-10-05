import type {NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraMsg';
import { VeiculosModel } from '../../models/VeiculosModel';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectaMongoDB } from '../../middlewares/conectaMongoDB';
import nc from 'next-connect';
import { politicaCORS } from '../../middlewares/politicaCORS';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';

const handler = nc()
    .use(upload.single('file'))
    .put(async (req: any, res: NextApiResponse<RespostaPadraoMsg> | any) => {
        try{
            const {id} = req?.query;
            const veiculo = await VeiculosModel.findById(id);
            const { nome, marca, modelo, valor } = req.body;

            if(!veiculo){
                return res.status(400).json({erro: 'Veículo não encontrado'});
            }

            if(veiculo.nome && veiculo.nome.length > 2){
                veiculo.nome = nome;
            }

            if(veiculo.marca || veiculo.marca.length > 3){
                veiculo.marca = marca;
            }

            if(veiculo.modelo || veiculo.modelo.length > 3){
                veiculo.modelo = modelo;
            }

            if(veiculo.valor || veiculo.valor.length > 4){
                veiculo.valor = valor;
            }

            const {file} = req;
            if(file && file.originalname){
                const image = await uploadImagemCosmic(req);
                if(image && image.media && image.media.url){
                    veiculo.foto = image.media.url;
                } 
            }

            await VeiculosModel.findByIdAndUpdate({_id : veiculo._id}, veiculo);

            return res.status(200).json({msg: 'Veículo atualizado com sucesso!'});


        }catch(e){
            console.log(e);
            return res.status(400).json({erro: `Não foi possível atualizar o veículo` + e});
        }

    });


    export const config = {
        api: {
            bodyParser : false
        }
    }

export default politicaCORS(validarTokenJWT(conectaMongoDB(handler)));