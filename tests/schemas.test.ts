import { describe, expect, it } from 'vitest';
import { escaparRegex, idSchema } from '../schemas/comum';
import {
  atualizarUsuarioSchema,
  cadastroUsuarioSchema,
  loginSchema,
} from '../schemas/usuario';
import {
  atualizarVeiculoSchema,
  cadastroVeiculoSchema,
  pesquisaVeiculosQuerySchema,
} from '../schemas/veiculo';

const usuarioValido = {
  nome: 'Ana',
  email: 'ana@exemplo.com',
  senha: 'segredo-forte',
};
const veiculoValido = {
  nome: 'Onix',
  marca: 'Chevrolet',
  modelo: 'LT 1.0',
  valor: '89990',
};

describe('schemas de usuário', () => {
  it('aceita cadastro válido e descarta campos desconhecidos', () => {
    expect(
      cadastroUsuarioSchema.parse({ ...usuarioValido, _id: 'x', admin: true }),
    ).toEqual(usuarioValido);
  });

  it('rejeita email inválido, senha curta e nível de acesso inexistente', () => {
    const invalidos = [
      { email: 'ana' },
      { senha: '1234567' },
      { nivelAcesso: 'Dono' },
    ];
    for (const campo of invalidos) {
      expect(
        cadastroUsuarioSchema.safeParse({ ...usuarioValido, ...campo }).success,
      ).toBe(false);
    }
  });

  it('login rejeita operadores do MongoDB no lugar de texto', () => {
    expect(
      loginSchema.safeParse({ login: { $ne: null }, senha: 'x' }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ login: 'ana@exemplo.com', senha: { $gt: '' } })
        .success,
    ).toBe(false);
  });

  it('login aceita senha antiga, mais curta que o mínimo atual', () => {
    expect(
      loginSchema.safeParse({ login: 'ana@exemplo.com', senha: '1234' }).success,
    ).toBe(true);
  });

  it('atualização não aceita trocar email ou senha por esta rota', () => {
    expect(
      atualizarUsuarioSchema.parse({ nome: 'Ana', email: 'x@y.com', senha: 'z' }),
    ).toEqual({ nome: 'Ana' });
  });
});

describe('schemas de veículo', () => {
  it('converte o valor recebido como texto em número', () => {
    expect(cadastroVeiculoSchema.parse(veiculoValido).valor).toBe(89990);
  });

  it('rejeita valor negativo, zero ou que não é número', () => {
    for (const valor of ['-1', '0', 'abc', { $gt: 0 }]) {
      expect(
        cadastroVeiculoSchema.safeParse({ ...veiculoValido, valor }).success,
      ).toBe(false);
    }
  });

  it('edição aceita só parte dos campos e descarta a foto vinda no corpo', () => {
    expect(
      atualizarVeiculoSchema.parse({ marca: 'Fiat', foto: 'http://externo' }),
    ).toEqual({ marca: 'Fiat' });
  });

  it('id precisa ser um ObjectId; objeto e lista são rejeitados', () => {
    expect(idSchema.safeParse('65a1f0c2e4b0a1b2c3d4e5f6').success).toBe(true);
    for (const id of ['123', { $ne: null }, ['65a1f0c2e4b0a1b2c3d4e5f6']]) {
      expect(idSchema.safeParse(id).success).toBe(false);
    }
  });

  it('filtro de busca exige ao menos dois caracteres', () => {
    expect(pesquisaVeiculosQuerySchema.safeParse({ filtro: 'a' }).success).toBe(
      false,
    );
    expect(pesquisaVeiculosQuerySchema.safeParse({}).success).toBe(true);
  });

  it('escaparRegex neutraliza metacaracteres', () => {
    const padrao = new RegExp(escaparRegex('(a+)+$'));

    expect(padrao.test('(a+)+$')).toBe(true);
    expect(padrao.test('aaaa')).toBe(false);
  });
});
