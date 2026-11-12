import { criarEndpoint, ErroHttp, validar } from '../../lib/endpoint';
import { rotaDeAdministrador } from '../../lib/rotas';
import { UsuarioModel } from '../../models/UsuarioModel';
import { idQuerySchema } from '../../schemas/comum';
import { atualizarUsuarioSchema } from '../../schemas/usuario';

const endpointEditarUsuarios = criarEndpoint({
  PUT: async (req, res) => {
    const { id } = validar(idQuerySchema, req.query);
    const dados = validar(atualizarUsuarioSchema, req.body);

    const usuario = await UsuarioModel.findByIdAndUpdate(id, { $set: dados });
    if (!usuario) {
      throw new ErroHttp(400, 'Usuário não encontrado');
    }
    return res.status(200).json({ msg: 'Usuário atualizado com sucesso!' });
  },
});

export default rotaDeAdministrador(endpointEditarUsuarios);
