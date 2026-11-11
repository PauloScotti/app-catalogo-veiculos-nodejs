import { criarEndpoint, ErroHttp, validar } from '../../lib/endpoint';
import { rotaDeAdministrador } from '../../lib/rotas';
import { enviarImagem, lerFormulario } from '../../lib/upload';
import { VeiculosModel } from '../../models/VeiculosModel';
import { idQuerySchema } from '../../schemas/comum';
import { atualizarVeiculoSchema } from '../../schemas/veiculo';

const endpointEditarVeiculos = criarEndpoint({
  PUT: async (req, res) => {
    await lerFormulario(req, res);
    const { id } = validar(idQuerySchema, req.query);
    const dados = validar(atualizarVeiculoSchema, req.body);

    if (!(await VeiculosModel.exists({ _id: id }))) {
      throw new ErroHttp(400, 'Veículo não encontrado');
    }

    const foto = await enviarImagem(req);
    await VeiculosModel.updateOne(
      { _id: id },
      { $set: { ...dados, ...(foto && { foto }) } },
    );
    return res.status(200).json({ msg: 'Veículo atualizado com sucesso!' });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default rotaDeAdministrador(endpointEditarVeiculos);
