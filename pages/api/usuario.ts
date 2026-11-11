import { ehAdministrador } from '../../lib/autorizacao';
import {
  criarEndpoint,
  ErroHttp,
  RequisicaoAutenticada,
  validar,
} from '../../lib/endpoint';
import { rotaAutenticada } from '../../lib/rotas';
import { cadastrarUsuario } from '../../lib/usuarios';
import { UsuarioModel } from '../../models/UsuarioModel';
import { idQuerySchema } from '../../schemas/comum';
import {
  atualizarUsuarioSchema,
  cadastroUsuarioSchema,
  NIVEL_ADMINISTRADOR,
} from '../../schemas/usuario';

async function exigirAdministrador(usuarioId: string) {
  if (!(await ehAdministrador(usuarioId))) {
    throw new ErroHttp(403, 'Apenas administradores podem fazer isso');
  }
}

const endpointUsuario = criarEndpoint<RequisicaoAutenticada>({
  // Dados do usuário logado.
  GET: async (req, res) => {
    const usuario = await UsuarioModel.findById(req.usuarioId).select('-senha');
    if (!usuario) {
      throw new ErroHttp(400, 'Usuário não encontrado');
    }
    return res.status(200).json(usuario);
  },

  // Cadastro feito por um Administrador, que pode escolher o nível de acesso.
  POST: async (req, res) => {
    await exigirAdministrador(req.usuarioId);
    const usuario = validar(cadastroUsuarioSchema, req.body);

    await cadastrarUsuario(usuario, req.usuarioId);
    return res.status(200).json({ msg: 'Usuário cadastrado com sucesso' });
  },

  // Atualiza o próprio cadastro.
  PUT: async (req, res) => {
    const dados = validar(atualizarUsuarioSchema, req.body);

    const usuario = await UsuarioModel.findById(req.usuarioId);
    if (!usuario) {
      throw new ErroHttp(400, 'Usuário não encontrado');
    }
    if (
      dados.nivelAcesso &&
      dados.nivelAcesso !== usuario.nivelAcesso &&
      usuario.nivelAcesso !== NIVEL_ADMINISTRADOR
    ) {
      throw new ErroHttp(403, 'Apenas administradores podem fazer isso');
    }

    await UsuarioModel.updateOne({ _id: usuario._id }, { $set: dados });
    return res.status(200).json({ msg: 'Usuário atualizado com sucesso!' });
  },

  DELETE: async (req, res) => {
    await exigirAdministrador(req.usuarioId);
    const { id } = validar(idQuerySchema, req.query);

    if (id === req.usuarioId) {
      throw new ErroHttp(400, 'Você não pode excluir a própria conta');
    }
    const usuario = await UsuarioModel.findByIdAndDelete(id);
    if (!usuario) {
      throw new ErroHttp(400, 'Usuário não encontrado');
    }
    return res.status(200).json({ msg: 'Usuário deletado com sucesso!' });
  },
});

export default rotaAutenticada(endpointUsuario);
