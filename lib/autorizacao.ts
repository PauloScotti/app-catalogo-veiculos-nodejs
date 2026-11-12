import { isValidObjectId } from 'mongoose';
import { UsuarioModel } from '../models/UsuarioModel';
import { NIVEL_ADMINISTRADOR } from '../schemas/usuario';

export async function ehAdministrador(
  usuarioId: string | null,
): Promise<boolean> {
  if (!usuarioId || !isValidObjectId(usuarioId)) {
    return false;
  }
  const usuario = await UsuarioModel.findById(usuarioId)
    .select('nivelAcesso')
    .lean<{ nivelAcesso?: string }>();
  return usuario?.nivelAcesso === NIVEL_ADMINISTRADOR;
}
