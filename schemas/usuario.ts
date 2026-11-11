import { z } from './zod';
import { idSchema } from './comum';

export const NIVEL_CLIENTE = 'Cliente';
export const NIVEL_ADMINISTRADOR = 'Administrador';

const nivelAcessoSchema = z.enum([NIVEL_CLIENTE, NIVEL_ADMINISTRADOR], {
  error: 'Nível de acesso não é válido',
});

const nomeSchema = z
  .string({ error: 'Nome não é válido' })
  .trim()
  .min(2, 'Nome não é válido')
  .max(100, 'Nome não é válido');

const senhaSchema = z
  .string({ error: 'Senha não é válida' })
  .min(8, 'A senha precisa ter pelo menos 8 caracteres')
  .max(128, 'Senha não é válida');

export const cadastroUsuarioSchema = z
  .object({
    nome: nomeSchema,
    email: z.email('Email inválido').max(254, 'Email inválido'),
    senha: senhaSchema,
    nivelAcesso: nivelAcessoSchema.optional().openapi({
      description:
        'Só é considerado quando a requisição traz o token de um Administrador. Sem ele, a conta nasce como Cliente.',
    }),
  })
  .openapi('CadastroUsuario');

export const loginSchema = z
  .object({
    login: z
      .string({ error: 'Usuário ou senha inválidos!' })
      .min(1, 'Usuário ou senha inválidos!')
      .max(254, 'Usuário ou senha inválidos!')
      .openapi({ description: 'Email do usuário' }),
    // Sem regra de tamanho mínimo: contas antigas têm senhas mais curtas.
    senha: z
      .string({ error: 'Usuário ou senha inválidos!' })
      .min(1, 'Usuário ou senha inválidos!')
      .max(128, 'Usuário ou senha inválidos!'),
  })
  .openapi('Login');

export const loginRespostaSchema = z
  .object({
    nome: z.string(),
    email: z.string(),
    nivelAcesso: z.string(),
    token: z
      .string()
      .optional()
      .openapi({ description: 'Presente para Cliente' }),
    tokenAdm: z
      .string()
      .optional()
      .openapi({ description: 'Presente para Administrador' }),
  })
  .openapi('LoginResposta');

export const atualizarUsuarioSchema = z
  .object({
    nome: nomeSchema.optional(),
    nivelAcesso: nivelAcessoSchema.optional().openapi({
      description: 'Só um Administrador pode alterar.',
    }),
  })
  .openapi('AtualizarUsuario');

export const pesquisaUsuariosQuerySchema = z.object({
  id: idSchema.optional(),
  filtro: z
    .string({ error: 'Favor informar ao menos dois caracteres na busca' })
    .min(2, 'Favor informar ao menos dois caracteres na busca')
    .max(100, 'Busca não é válida')
    .optional(),
});

export const usuarioSchema = z
  .object({
    _id: z.string(),
    nome: z.string(),
    email: z.string(),
    nivelAcesso: z.string(),
  })
  .openapi('Usuario');

export type CadastroUsuario = z.infer<typeof cadastroUsuarioSchema>;
