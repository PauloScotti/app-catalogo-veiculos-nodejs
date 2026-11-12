import { criarEndpoint, ErroHttp, validar } from '../../lib/endpoint';
import { rotaDeAdministrador } from '../../lib/rotas';
import { VeiculosModel } from '../../models/VeiculosModel';
import { idQuerySchema } from '../../schemas/comum';

const endpointDeletarVeiculos = criarEndpoint({
  DELETE: async (req, res) => {
    const { id } = validar(idQuerySchema, req.query);

    const veiculo = await VeiculosModel.findByIdAndDelete(id);
    if (!veiculo) {
      throw new ErroHttp(400, 'Veículo não encontrado');
    }
    return res.status(200).json({ msg: 'Veículo deletado com sucesso!' });
  },
});

export default rotaDeAdministrador(endpointDeletarVeiculos);
