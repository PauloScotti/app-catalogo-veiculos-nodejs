import { criarEndpoint, validar } from '../../lib/endpoint';
import { rotaDeAdministrador } from '../../lib/rotas';
import { enviarImagem, lerFormulario } from '../../lib/upload';
import { VeiculosModel } from '../../models/VeiculosModel';
import { cadastroVeiculoSchema } from '../../schemas/veiculo';

const endpointCadastroVeiculos = criarEndpoint({
  POST: async (req, res) => {
    await lerFormulario(req, res);
    const veiculo = validar(cadastroVeiculoSchema, req.body);

    await VeiculosModel.create({ ...veiculo, foto: await enviarImagem(req) });
    return res.status(200).json({ msg: 'Veículo cadastrado com sucesso' });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default rotaDeAdministrador(endpointCadastroVeiculos);
