import {
  OpenApiGeneratorV31,
  OpenAPIRegistry,
  RouteConfig,
} from '@asteasolutions/zod-to-openapi';
import type { ZodType } from 'zod';
import { z } from '../schemas/zod';
import { erroSchema, idQuerySchema, mensagemSchema } from '../schemas/comum';
import {
  atualizarUsuarioSchema,
  cadastroUsuarioSchema,
  loginRespostaSchema,
  loginSchema,
  pesquisaUsuariosQuerySchema,
  usuarioSchema,
} from '../schemas/usuario';
import {
  atualizarVeiculoSchema,
  cadastroVeiculoSchema,
  pesquisaVeiculosQuerySchema,
  veiculoSchema,
} from '../schemas/veiculo';

type Acesso = 'publico' | 'autenticado' | 'administrador';

type Rota = {
  metodo: RouteConfig['method'];
  caminho: string;
  resumo: string;
  grupo: string;
  acesso: Acesso;
  query?: z.ZodObject;
  corpo?: ZodType;
  formulario?: ZodType;
  resposta: ZodType;
};

const arquivoSchema = z.object({
  file: z
    .string()
    .optional()
    .openapi({ format: 'binary', description: 'Imagem de até 5 MB' }),
});

const comArquivo = (schema: ZodType) =>
  (schema as z.ZodObject).extend(arquivoSchema.shape);

const rotas: Rota[] = [
  {
    metodo: 'post',
    caminho: '/api/login',
    resumo: 'Entrar e receber o token de acesso',
    grupo: 'Usuários',
    acesso: 'publico',
    corpo: loginSchema,
    resposta: loginRespostaSchema,
  },
  {
    metodo: 'post',
    caminho: '/api/cadastroUsuarios',
    resumo: 'Cadastrar usuário',
    grupo: 'Usuários',
    acesso: 'publico',
    formulario: cadastroUsuarioSchema,
    resposta: mensagemSchema,
  },
  {
    metodo: 'get',
    caminho: '/api/usuario',
    resumo: 'Dados do usuário logado',
    grupo: 'Usuários',
    acesso: 'autenticado',
    resposta: usuarioSchema,
  },
  {
    metodo: 'put',
    caminho: '/api/usuario',
    resumo: 'Atualizar o usuário logado',
    grupo: 'Usuários',
    acesso: 'autenticado',
    corpo: atualizarUsuarioSchema,
    resposta: mensagemSchema,
  },
  {
    metodo: 'post',
    caminho: '/api/usuario',
    resumo: 'Cadastrar usuário escolhendo o nível de acesso',
    grupo: 'Usuários',
    acesso: 'administrador',
    corpo: cadastroUsuarioSchema,
    resposta: mensagemSchema,
  },
  {
    metodo: 'delete',
    caminho: '/api/usuario',
    resumo: 'Excluir usuário',
    grupo: 'Usuários',
    acesso: 'administrador',
    query: idQuerySchema,
    resposta: mensagemSchema,
  },
  {
    metodo: 'get',
    caminho: '/api/pesquisaUsuarios',
    resumo: 'Listar, buscar por nome ou obter um usuário',
    grupo: 'Usuários',
    acesso: 'administrador',
    query: pesquisaUsuariosQuerySchema,
    resposta: z.union([usuarioSchema, z.array(usuarioSchema)]),
  },
  {
    metodo: 'put',
    caminho: '/api/editarUsuarios',
    resumo: 'Editar nome e nível de acesso de um usuário',
    grupo: 'Usuários',
    acesso: 'administrador',
    query: idQuerySchema,
    corpo: atualizarUsuarioSchema,
    resposta: mensagemSchema,
  },
  {
    metodo: 'get',
    caminho: '/api/veiculos',
    resumo: 'Listar, buscar por nome ou obter um veículo',
    grupo: 'Veículos',
    acesso: 'publico',
    query: pesquisaVeiculosQuerySchema,
    resposta: z.union([veiculoSchema, z.array(veiculoSchema)]),
  },
  {
    metodo: 'post',
    caminho: '/api/cadastroVeiculos',
    resumo: 'Cadastrar veículo',
    grupo: 'Veículos',
    acesso: 'administrador',
    formulario: comArquivo(cadastroVeiculoSchema),
    resposta: mensagemSchema,
  },
  {
    metodo: 'put',
    caminho: '/api/editarVeiculos',
    resumo: 'Editar veículo',
    grupo: 'Veículos',
    acesso: 'administrador',
    query: idQuerySchema,
    formulario: comArquivo(atualizarVeiculoSchema),
    resposta: mensagemSchema,
  },
  {
    metodo: 'delete',
    caminho: '/api/deletarVeiculos',
    resumo: 'Excluir veículo',
    grupo: 'Veículos',
    acesso: 'administrador',
    query: idQuerySchema,
    resposta: mensagemSchema,
  },
];

const erro = (description: string) => ({
  description,
  content: { 'application/json': { schema: erroSchema } },
});

function corpoDaRota(rota: Rota): RouteConfig['request'] {
  if (rota.corpo) {
    return {
      body: { content: { 'application/json': { schema: rota.corpo } } },
    };
  }
  if (rota.formulario) {
    return {
      body: {
        content: { 'multipart/form-data': { schema: rota.formulario } },
      },
    };
  }
  return {};
}

export function gerarDocumentoOpenApi() {
  const registro = new OpenAPIRegistry();
  const bearer = registro.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  for (const rota of rotas) {
    registro.registerPath({
      method: rota.metodo,
      path: rota.caminho,
      summary: rota.resumo,
      tags: [rota.grupo],
      security: rota.acesso === 'publico' ? [] : [{ [bearer.name]: [] }],
      request: { query: rota.query, ...corpoDaRota(rota) },
      responses: {
        200: {
          description: 'Sucesso',
          content: { 'application/json': { schema: rota.resposta } },
        },
        400: erro('Dados inválidos ou registro não encontrado'),
        ...(rota.acesso !== 'publico' && {
          401: erro('Token ausente, inválido ou expirado'),
        }),
        ...(rota.acesso === 'administrador' && {
          403: erro('Usuário não é Administrador'),
        }),
      },
    });
  }

  return new OpenApiGeneratorV31(registro.definitions).generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Catálogo de Veículos — API',
      version: '2.0.0',
      description:
        'API do catálogo de veículos: usuários e veículos. Rotas marcadas com cadeado exigem `Authorization: Bearer <token>` obtido em `/api/login`.',
    },
  });
}
