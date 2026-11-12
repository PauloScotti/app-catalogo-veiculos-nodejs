import { criarEndpoint, ErroHttp, validar } from '../../lib/endpoint';
import { conferirSenha, gerarHash } from '../../lib/senha';
import { assinarToken } from '../../lib/token';
import { conectaMongoDB } from '../../middlewares/conectaMongoDB';
import { politicaCORS } from '../../middlewares/politicaCORS';
import { UsuarioModel } from '../../models/UsuarioModel';
import { loginSchema, NIVEL_ADMINISTRADOR } from '../../schemas/usuario';

const endpointLogin = criarEndpoint({
  POST: async (req, res) => {
    const { login, senha } = validar(loginSchema, req.body);

    // Mesma resposta para email inexistente e senha errada: não revela quais
    // emails têm conta.
    const usuario = await UsuarioModel.findOne({ email: login });
    const resultado = usuario
      ? await conferirSenha(senha, usuario.senha)
      : { valida: false, precisaRegravar: false };
    if (!usuario || !resultado.valida) {
      throw new ErroHttp(400, 'Usuário ou senha inválidos!');
    }

    if (resultado.precisaRegravar) {
      await UsuarioModel.updateOne(
        { _id: usuario._id },
        { senha: await gerarHash(senha) },
      );
    }

    const token = assinarToken(String(usuario._id));
    const ehAdm = usuario.nivelAcesso === NIVEL_ADMINISTRADOR;
    return res.status(200).json({
      nome: usuario.nome,
      email: usuario.email,
      nivelAcesso: usuario.nivelAcesso,
      ...(ehAdm ? { tokenAdm: token } : { token }),
    });
  },
});

export default politicaCORS(conectaMongoDB(endpointLogin));
