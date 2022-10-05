import type {NextApiRequest, NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraMsg';
import type { CadastroVeiculosRequisicao } from '../../types/CadastroVeiculosRequisicao';
import { VeiculosModel } from '../../models/VeiculosModel';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectaMongoDB } from '../../middlewares/conectaMongoDB';
import nc from 'next-connect';
import { politicaCORS } from '../../middlewares/politicaCORS';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';

const handler = nc()
    .use(upload.single('file'))
    .post(async (
        req: NextApiRequest,
        res: NextApiResponse<RespostaPadraoMsg>
    ) => {

            const veiculos = req.body as CadastroVeiculosRequisicao;

            if(!veiculos.nome || veiculos.nome.length < 2){
                return res.status(400).json({erro : "Nome não é válido"});
            }

            if(!veiculos.marca || veiculos.marca.length < 3){
                return res.status(400).json({erro : "Marca não é válida"});
            }

            if(!veiculos.modelo || veiculos.modelo.length < 3){
                return res.status(400).json({erro : "Modelo não é válida"});
            }

            if(!veiculos.valor || veiculos.valor.length < 4){
                return res.status(400).json({erro : "Valor não é válida"});
            }

            const image = await uploadImagemCosmic(req);

            const veiculoASerSalvo = {
                nome : veiculos.nome,
                marca : veiculos.marca,
                modelo : veiculos.modelo,
                valor : veiculos.valor,
                foto: image?.media?.url
            }
            
            await VeiculosModel.create(veiculoASerSalvo);
            return res.status(200).json({ msg: "Veículo cadastrado com sucesso"});

    });

    
export const config = {
    api: {
        bodyParser : false
    }
}

export default politicaCORS(validarTokenJWT(conectaMongoDB(handler)));