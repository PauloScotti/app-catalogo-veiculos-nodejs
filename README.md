# Catálogo de Veículos — API

API de um catálogo de veículos: qualquer pessoa consulta os veículos à venda; administradores mantêm o catálogo e os usuários.

Construída sobre as API Routes do Next.js com MongoDB. Nasceu como projeto da formação Devaria e foi revisada para servir de referência: senhas com argon2, validação de entrada com zod, controle de acesso por nível e documentação OpenAPI navegável.

## Stack

| Camada       | Tecnologia                                        |
| ------------ | ------------------------------------------------- |
| Runtime      | Node.js 22+, Next.js 16 (API Routes), TypeScript  |
| Banco        | MongoDB com Mongoose 9                            |
| Autenticação | JWT (HS256, validade de 7 dias), senhas em argon2 |
| Validação    | zod 4                                             |
| Documentação | OpenAPI 3.1 gerado dos schemas zod + Scalar       |
| Imagens      | Cosmic (foto do veículo)                          |
| Testes       | Vitest                                            |

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```

A API sobe em `http://localhost:3000/api`. A documentação interativa fica em `http://localhost:3000/api/docs` e o documento OpenAPI em `http://localhost:3000/api/openapi`.

### Variáveis de ambiente

| Variável                        | Obrigatória | Para quê                                                                 |
| ------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `DB_CONEXAO_STRING`             | sim         | String de conexão do MongoDB                                             |
| `CHAVE_JWT`                     | sim         | Segredo que assina os tokens                                             |
| `BUCKET_FOTOS_VEICULOS`         | para upload | Slug do bucket no Cosmic                                                 |
| `CHAVE_GRAVACAO_FOTOS_VEICULOS` | para upload | Chave de escrita do bucket                                               |
| `CHAVE_LEITURA_FOTOS_VEICULOS`  | não         | Chave de leitura do bucket                                               |
| `CORS_ORIGENS`                  | não         | Origens aceitas, separadas por vírgula. Sem ela, qualquer origem é aceita |

### Primeiro administrador

O cadastro é público e sempre cria contas com o nível `Cliente`. Para ter o primeiro `Administrador`, cadastre a conta normalmente e promova-a:

```bash
npm run admin:promover -- email@exemplo.com
```

Depois disso, um Administrador autenticado pode criar outros enviando `nivelAcesso` no cadastro ou pelo `POST /api/usuario`.

## Rotas

| Rota                                          | Método   | Acesso        |
| --------------------------------------------- | -------- | ------------- |
| `/api/login`                                  | POST     | público       |
| `/api/cadastroUsuarios`                       | POST     | público       |
| `/api/veiculos`                               | GET      | público       |
| `/api/usuario`                                | GET, PUT | autenticado   |
| `/api/usuario`                                | POST, DELETE | administrador |
| `/api/pesquisaUsuarios`                       | GET      | administrador |
| `/api/editarUsuarios`                         | PUT      | administrador |
| `/api/cadastroVeiculos`                       | POST     | administrador |
| `/api/editarVeiculos`                         | PUT      | administrador |
| `/api/deletarVeiculos`                        | DELETE   | administrador |

Rotas autenticadas esperam `Authorization: Bearer <token>`. O login devolve `token` para Cliente e `tokenAdm` para Administrador. Cadastro de usuário pela rota pública e cadastro/edição de veículo usam `multipart/form-data`; as demais usam JSON. Corpos, parâmetros e respostas de cada rota estão em `/api/docs`.

## Estrutura

```
lib/          regras reutilizáveis: senha, token, upload, autorização, OpenAPI
middlewares/  CORS, conexão com o banco, token e exigência de administrador
models/       modelos do Mongoose
pages/api/    uma rota por arquivo
schemas/      schemas zod (validação e origem da documentação)
scripts/      utilitários de linha de comando
tests/        testes unitários
```

## Testes

```bash
npm test
npm run typecheck
```

## Segurança

- Senhas gravadas com argon2id. Contas antigas, em MD5, continuam entrando e têm a senha regravada em argon2 no primeiro login.
- Toda entrada passa por um schema zod: campos desconhecidos são descartados e objetos no lugar de texto são rejeitados, o que fecha a injeção de operadores do MongoDB.
- O nível de acesso é lido do banco a cada requisição; rebaixar um usuário vale imediatamente.
- Upload aceita só imagens de até 5 MB.
- Erros inesperados respondem com mensagem genérica; o detalhe fica no log do servidor.
