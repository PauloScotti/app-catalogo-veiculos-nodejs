import { criarEndpoint, ErroHttp, validar } from '../../lib/endpoint';
import { rotaDeAdministrador } from '../../lib/rotas';
import { UsuarioModel } from '../../models/UsuarioModel';
import { escaparRegex } from '../../schemas/comum';
import { pesquisaUsuariosQuerySchema } from '../../schemas/usuario';

const endpointPesquisaUsuarios = criarEndpoint({
  GET: async (req, res) => {
    const { id, filtro } = validar(pesquisaUsuariosQuerySchema, req.query);

    if (id) {
      const usuario = await UsuarioModel.findById(id).select('-senha');
      if (!usuario) {
        throw new ErroHttp(400, 'Usuário não encontrado');
      }
      return res.status(200).json(usuario);
    }

    const consulta = filtro
      ? { nome: { $regex: escaparRegex(filtro), $options: 'i' } }
      : {};
    const usuarios = await UsuarioModel.find(consulta)
      .select('-senha')
      .sort({ nome: 1 });
    return res.status(200).json(usuarios);
  },
});

export default rotaDeAdministrador(endpointPesquisaUsuarios);
