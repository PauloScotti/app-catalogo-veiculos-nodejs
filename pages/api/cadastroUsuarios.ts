import { criarEndpoint, validar } from '../../lib/endpoint';
import { rotaPublica } from '../../lib/rotas';
import { lerToken } from '../../lib/token';
import { lerFormulario } from '../../lib/upload';
import { cadastrarUsuario } from '../../lib/usuarios';
import { cadastroUsuarioSchema } from '../../schemas/usuario';

const endpointCadastroUsuarios = criarEndpoint({
  POST: async (req, res) => {
    await lerFormulario(req, res);
    const usuario = validar(cadastroUsuarioSchema, req.body);

    await cadastrarUsuario(usuario, lerToken(req.headers.authorization));
    return res.status(200).json({ msg: 'Usuário cadastrado com sucesso' });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default rotaPublica(endpointCadastroUsuarios);
