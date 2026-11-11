// Promove uma conta existente a Administrador.
// Uso: npm run admin:promover -- email@exemplo.com
import mongoose from 'mongoose';

const email = process.argv[2];
const { DB_CONEXAO_STRING } = process.env;

if (!email || !DB_CONEXAO_STRING) {
  console.error(
    'Informe o email e defina DB_CONEXAO_STRING no .env.local.\nUso: npm run admin:promover -- email@exemplo.com',
  );
  process.exit(1);
}

await mongoose.connect(DB_CONEXAO_STRING);
const resultado = await mongoose.connection
  .collection('usuarios')
  .updateOne({ email }, { $set: { nivelAcesso: 'Administrador' } });
await mongoose.disconnect();

if (resultado.matchedCount === 0) {
  console.error(`Nenhuma conta encontrada com o email ${email}.`);
  process.exit(1);
}
console.log(`${email} agora é Administrador.`);
