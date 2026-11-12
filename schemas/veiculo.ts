import { z } from './zod';
import { idSchema } from './comum';

const texto = (campo: string, minimo: number) =>
  z
    .string({ error: `${campo} não é válido` })
    .trim()
    .min(minimo, `${campo} não é válido`)
    .max(150, `${campo} não é válido`);

// Chega como texto no multipart/form-data, por isso a conversão.
const valorSchema = z.coerce
  .number({ error: 'Valor não é válido' })
  .positive('Valor não é válido')
  .max(1_000_000_000, 'Valor não é válido')
  .openapi({ type: 'number', example: 89990 });

export const cadastroVeiculoSchema = z
  .object({
    nome: texto('Nome', 2),
    marca: texto('Marca', 2),
    modelo: texto('Modelo', 2),
    valor: valorSchema,
  })
  .openapi('CadastroVeiculo');

export const atualizarVeiculoSchema = cadastroVeiculoSchema
  .partial()
  .openapi('AtualizarVeiculo');

export const pesquisaVeiculosQuerySchema = z.object({
  id: idSchema.optional(),
  filtro: z
    .string({ error: 'Favor informar ao menos dois caracteres na busca' })
    .min(2, 'Favor informar ao menos dois caracteres na busca')
    .max(100, 'Busca não é válida')
    .optional(),
});

export const veiculoSchema = z
  .object({
    _id: z.string(),
    nome: z.string(),
    marca: z.string(),
    modelo: z.string(),
    valor: z.number(),
    foto: z.string().optional(),
  })
  .openapi('Veiculo');
