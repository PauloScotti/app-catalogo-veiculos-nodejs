import { criarEndpoint, ErroHttp, validar } from '../../lib/endpoint';
import { rotaPublica } from '../../lib/rotas';
import { VeiculosModel } from '../../models/VeiculosModel';
import { escaparRegex } from '../../schemas/comum';
import { pesquisaVeiculosQuerySchema } from '../../schemas/veiculo';

const endpointVeiculos = criarEndpoint({
  GET: async (req, res) => {
    const { id, filtro } = validar(pesquisaVeiculosQuerySchema, req.query);

    if (id) {
      const veiculo = await VeiculosModel.findById(id);
      if (!veiculo) {
        throw new ErroHttp(400, 'Veículo não encontrado');
      }
      return res.status(200).json(veiculo);
    }

    const consulta = filtro
      ? { nome: { $regex: escaparRegex(filtro), $options: 'i' } }
      : {};
    const veiculos = await VeiculosModel.find(consulta).sort({ valor: 1 });
    return res.status(200).json(veiculos);
  },
});

export default rotaPublica(endpointVeiculos);
