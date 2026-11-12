import { ehAdministrador } from './autorizacao';
import { ErroHttp } from './endpoint';
import { gerarHash } from './senha';
import { UsuarioModel } from '../models/UsuarioModel';
import { CadastroUsuario, NIVEL_CLIENTE } from '../schemas/usuario';

// Usado pelo cadastro público e pelo cadastro feito por um Administrador. O
// nível pedido só vale quando quem cadastra é Administrador; senão, Cliente.
export async function cadastrarUsuario(
  usuario: CadastroUsuario,
  cadastradoPorId: string | null,
) {
  const cadastradoPorAdm = await ehAdministrador(cadastradoPorId);
  const nivelAcesso =
    cadastradoPorAdm && usuario.nivelAcesso
      ? usuario.nivelAcesso
      : NIVEL_CLIENTE;

  if (await UsuarioModel.exists({ email: usuario.email })) {
    throw new ErroHttp(400, 'E-mail já cadastrado em outra conta');
  }

  await UsuarioModel.create({
    nome: usuario.nome,
    email: usuario.email,
    senha: await gerarHash(usuario.senha),
    nivelAcesso,
  });
}
