import { createHash } from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gerarHash } from '../lib/senha';
import { assinarToken } from '../lib/token';
import { chamar } from './ajuda';

const UsuarioModel = vi.hoisted(() => ({
  findOne: vi.fn(),
  findById: vi.fn(),
  find: vi.fn(),
  exists: vi.fn(),
  create: vi.fn(),
  updateOne: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn(),
}));

vi.mock('../models/UsuarioModel', () => ({ UsuarioModel }));
vi.mock('../middlewares/conectaMongoDB', () => ({
  conectaMongoDB: (handler: unknown) => handler,
}));
vi.mock('../lib/upload', () => ({
  lerFormulario: vi.fn(),
  enviarImagem: vi.fn(),
}));

import cadastroUsuarios from '../pages/api/cadastroUsuarios';
import cadastroVeiculos from '../pages/api/cadastroVeiculos';
import editarUsuarios from '../pages/api/editarUsuarios';
import login from '../pages/api/login';
import pesquisaUsuarios from '../pages/api/pesquisaUsuarios';
import usuario from '../pages/api/usuario';

const ID_CLIENTE = '65a1f0c2e4b0a1b2c3d4e5f6';
const ID_ADM = '65a1f0c2e4b0a1b2c3d4e5f7';
const bearer = (id: string) => ({ authorization: `Bearer ${assinarToken(id)}` });

// As consultas são encadeadas com .select(), .lean() e .sort().
const consulta = (dados: unknown) => {
  const resultado: any = Promise.resolve(dados);
  resultado.select = vi.fn(() => resultado);
  resultado.lean = () => resultado;
  resultado.sort = () => resultado;
  return resultado;
};
const niveis = (porId: Record<string, string>) =>
  UsuarioModel.findById.mockImplementation((id: string) =>
    consulta(porId[id] ? { _id: id, nome: 'Ana', nivelAcesso: porId[id] } : null),
  );
const corpoUsuario = {
  nome: 'Ana',
  email: 'ana@exemplo.com',
  senha: 'segredo-forte',
  nivelAcesso: 'Administrador',
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CHAVE_JWT = 'chave-de-teste';
  UsuarioModel.exists.mockResolvedValue(null);
  niveis({ [ID_CLIENTE]: 'Cliente', [ID_ADM]: 'Administrador' });
});

describe('POST /api/login', () => {
  const conta = (senha: string, nivelAcesso = 'Cliente') => ({
    _id: ID_CLIENTE,
    nome: 'Ana',
    email: 'ana@exemplo.com',
    nivelAcesso,
    senha,
  });
  const entrar = (senha: string) =>
    chamar(login, {
      method: 'POST',
      body: { login: 'ana@exemplo.com', senha },
    });

  it('entra com senha em argon2 e devolve token, sem a senha', async () => {
    UsuarioModel.findOne.mockResolvedValue(conta(await gerarHash('segredo')));

    const resposta = await entrar('segredo');

    expect(resposta.status).toBe(200);
    expect(resposta.corpo.token).toEqual(expect.any(String));
    expect(resposta.corpo).not.toHaveProperty('senha');
    expect(UsuarioModel.updateOne).not.toHaveBeenCalled();
  });

  it('administrador recebe tokenAdm', async () => {
    UsuarioModel.findOne.mockResolvedValue(
      conta(await gerarHash('segredo'), 'Administrador'),
    );

    const resposta = await entrar('segredo');

    expect(resposta.corpo.tokenAdm).toEqual(expect.any(String));
    expect(resposta.corpo).not.toHaveProperty('token');
  });

  it('conta antiga em MD5 entra e tem a senha regravada em argon2', async () => {
    UsuarioModel.findOne.mockResolvedValue(
      conta(createHash('md5').update('1234').digest('hex')),
    );

    expect((await entrar('1234')).status).toBe(200);
    const [, alteracao] = UsuarioModel.updateOne.mock.calls[0];
    expect(alteracao.senha).toMatch(/^\$argon2id\$/);
  });

  it('senha errada e email inexistente recebem a mesma resposta', async () => {
    UsuarioModel.findOne.mockResolvedValue(conta(await gerarHash('segredo')));
    const senhaErrada = await entrar('errada');

    UsuarioModel.findOne.mockResolvedValue(null);
    const semConta = await entrar('segredo');

    expect(senhaErrada.status).toBe(400);
    expect(senhaErrada.corpo).toEqual(semConta.corpo);
  });

  it('não consulta o banco quando o login não é texto', async () => {
    const resposta = await chamar(login, {
      method: 'POST',
      body: { login: { $ne: null }, senha: { $ne: null } },
    });

    expect(resposta.status).toBe(400);
    expect(UsuarioModel.findOne).not.toHaveBeenCalled();
  });
});

describe('cadastro de usuários', () => {
  it('cadastro público ignora o nível pedido e grava a senha com hash', async () => {
    const resposta = await chamar(cadastroUsuarios, {
      method: 'POST',
      body: corpoUsuario,
    });

    expect(resposta.status).toBe(200);
    const [gravado] = UsuarioModel.create.mock.calls[0];
    expect(gravado.nivelAcesso).toBe('Cliente');
    expect(gravado.senha).toMatch(/^\$argon2id\$/);
  });

  it('token de Cliente não basta para criar Administrador', async () => {
    await chamar(cadastroUsuarios, {
      method: 'POST',
      body: corpoUsuario,
      headers: bearer(ID_CLIENTE),
    });

    expect(UsuarioModel.create.mock.calls[0][0].nivelAcesso).toBe('Cliente');
  });

  it('POST /api/usuario é só para Administrador, que escolhe o nível', async () => {
    const cliente = await chamar(usuario, {
      method: 'POST',
      body: corpoUsuario,
      headers: bearer(ID_CLIENTE),
    });
    expect(cliente.status).toBe(403);
    expect(UsuarioModel.create).not.toHaveBeenCalled();

    const adm = await chamar(usuario, {
      method: 'POST',
      body: corpoUsuario,
      headers: bearer(ID_ADM),
    });
    expect(adm.status).toBe(200);
    expect(UsuarioModel.create.mock.calls[0][0].nivelAcesso).toBe(
      'Administrador',
    );
  });

  it('rejeita email já cadastrado', async () => {
    UsuarioModel.exists.mockResolvedValue({ _id: ID_CLIENTE });

    const resposta = await chamar(cadastroUsuarios, {
      method: 'POST',
      body: corpoUsuario,
    });

    expect(resposta.status).toBe(400);
    expect(UsuarioModel.create).not.toHaveBeenCalled();
  });
});

describe('/api/usuario', () => {
  it('Cliente não consegue se promover a Administrador', async () => {
    const resposta = await chamar(usuario, {
      method: 'PUT',
      body: { nivelAcesso: 'Administrador' },
      headers: bearer(ID_CLIENTE),
    });

    expect(resposta.status).toBe(403);
    expect(UsuarioModel.updateOne).not.toHaveBeenCalled();
  });

  it('atualiza só o próprio cadastro, com os campos permitidos', async () => {
    const resposta = await chamar(usuario, {
      method: 'PUT',
      body: { nome: 'Ana Maria', senha: 'x', email: 'outro@exemplo.com' },
      headers: bearer(ID_CLIENTE),
    });

    expect(resposta.status).toBe(200);
    expect(UsuarioModel.updateOne).toHaveBeenCalledWith(
      { _id: ID_CLIENTE },
      { $set: { nome: 'Ana Maria' } },
    );
  });

  it('Cliente não exclui usuários', async () => {
    const resposta = await chamar(usuario, {
      method: 'DELETE',
      query: { id: ID_ADM },
      headers: bearer(ID_CLIENTE),
    });

    expect(resposta.status).toBe(403);
    expect(UsuarioModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('Administrador exclui outro usuário, mas não a própria conta', async () => {
    UsuarioModel.findByIdAndDelete.mockResolvedValue({ _id: ID_CLIENTE });

    const outro = await chamar(usuario, {
      method: 'DELETE',
      query: { id: ID_CLIENTE },
      headers: bearer(ID_ADM),
    });
    const proprio = await chamar(usuario, {
      method: 'DELETE',
      query: { id: ID_ADM },
      headers: bearer(ID_ADM),
    });

    expect(outro.status).toBe(200);
    expect(proprio.status).toBe(400);
    expect(UsuarioModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
  });
});

describe('rotas de administrador', () => {
  const rotas = [
    { handler: pesquisaUsuarios, method: 'GET' },
    { handler: editarUsuarios, method: 'PUT', query: { id: ID_ADM } },
    { handler: cadastroVeiculos, method: 'POST' },
  ];

  it('exigem token', async () => {
    for (const { handler, ...requisicao } of rotas) {
      expect((await chamar(handler, requisicao)).status).toBe(401);
    }
  });

  it('respondem 403 para Cliente', async () => {
    for (const { handler, ...requisicao } of rotas) {
      const resposta = await chamar(handler, {
        ...requisicao,
        headers: bearer(ID_CLIENTE),
      });
      expect(resposta.status).toBe(403);
    }
    expect(UsuarioModel.find).not.toHaveBeenCalled();
    expect(UsuarioModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('listagem de usuários nunca traz a senha', async () => {
    const lista = consulta([{ _id: ID_CLIENTE, nome: 'Ana' }]);
    UsuarioModel.find.mockReturnValue(lista);

    const resposta = await chamar(pesquisaUsuarios, {
      method: 'GET',
      headers: bearer(ID_ADM),
    });

    expect(resposta.status).toBe(200);
    expect(lista.select).toHaveBeenCalledWith('-senha');
  });
});
