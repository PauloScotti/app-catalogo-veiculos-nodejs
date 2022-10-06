# Catálogo de Veículos

Projeto de catálogo de veículos desenvolvido com Nodejs e next.

### Tenologias Utilizadas

- Cosmic.js 4.2.10
- Nextjs 12.3.1
- Nodejs 16.14.0
- jsonwebtoken 8.5.1
- md5 2.3.0
- mongoose 6.6.4
- multer 1.4.5-lts.1
- nextjs-cors 2.1.1

### Configuração do ambiente de desenvolvimento

1. clonar o repositório `git clone <url_git>` 
1. fazer uma copia do arquivo `.env.example` e renomear o novo arquivo de `.env.local`
1. configurar as variáveis de ambiente no arquivo `.env.local`
1. instale as dependencias do projeto `npm i`
1. execute o comando `npm run dev` para subir a aplicação

## Banco de Dados escolhido - MongoDB

1. Passos
1. Criar cadastro no site https://www.mongodb.com/
1. Criar um Cluster
1. Criar as variáveis de conexão nas ENVs
1. Criar os modelos das tabelas

## Cadastro de usuários (Rota Pública: cadastroUsuarios / Rota Privada: usuario)

No cadastro da rota pública, é possível criar contas sem estar logado e é necessário informar no body (form-data) o nome, email, senha e nível de acesso (nivelAcesso / se não informado entrará como Cliente por padrão).
Já na rota privada, só é possível cadastrar após efetuar o login
Para ter acesso a edição nas demais telas, é necessário criar usuar com nivel Administrador.
O método usado é o Post

## Cadastro de Veículos (Rota: cadastroVeiculos)

Para os cadastros de veículos, é necessário estar logado como Administrador.
Os dados devem ser passados como JSON
Para os veículos, deve-se informar nome, marca, modelo, valor e foto dos veículos

## Deletar Veículos (Rota: deletarVeiculos)

Para deletar os veículos, basta informar o id na URL
O método usado é o Delete

## Atualizar usuários (Rota: usuarios)

Utilizar o form-data e informar os dados a serem atualizado (nome, nivelAcesso ou file)

## Buscar usuário logado (Rota: usuarios)

Basta acessar a rota usuarios após efetuar o login para visualizar os dados do usuário. OBS.: Apenas Administradores tem acesso a essa funcionalidade

## Editar Veículos (Rota: editarVeiculos)

Para atualizar veículo, basta informar via JSON os dados a serem alterados
É possível alterar nome, marca, modelo, valor e foto dos veículos

## Listar Veículos (Rota: veiculos)

Para pesquisar apenas é necessário acessar a rota específica
Nessas rotas não é necessário estar logado para acessar

## Política de CORS

Esse projeto inclui políticas de CORS para as requisições HTTP seguras.
