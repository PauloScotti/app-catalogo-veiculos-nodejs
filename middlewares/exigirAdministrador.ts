import type { NextApiHandler } from 'next';
import { RequisicaoAutenticada, responderErro } from '../lib/endpoint';
import { ehAdministrador } from '../lib/autorizacao';

// Usar depois de validarTokenJWT e conectaMongoDB. O nível é lido do banco a
// cada requisição, então rebaixar um usuário vale na hora, sem esperar o
// token expirar.
export const exigirAdministrador =
  (handler: NextApiHandler): NextApiHandler =>
  async (req, res) => {
    try {
      if (!(await ehAdministrador((req as RequisicaoAutenticada).usuarioId))) {
        return res
          .status(403)
          .json({ erro: 'Apenas administradores podem fazer isso' });
      }
    } catch (erro) {
      return responderErro(res, erro);
    }
    return handler(req, res);
  };
