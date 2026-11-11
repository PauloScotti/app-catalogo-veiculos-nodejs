import type { NextApiRequest, NextApiResponse } from 'next';
import multer, { MulterError } from 'multer';
import { createBucketClient } from '@cosmicjs/sdk';
import { ErroHttp } from './endpoint';

const TAMANHO_MAXIMO = 5 * 1024 * 1024;
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type Arquivo = { originalname: string; buffer: Buffer };
export type RequisicaoComArquivo = NextApiRequest & { file?: Arquivo };

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (TIPOS_ACEITOS.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new ErroHttp(400, 'A imagem precisa ser JPEG, PNG, WebP ou GIF'));
  },
}).single('file');

// Lê o corpo multipart/form-data: campos em req.body, imagem em req.file.
export function lerFormulario(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  return new Promise((resolve, reject) => {
    upload(req as any, res as any, (erro: unknown) => {
      if (erro instanceof MulterError) {
        return reject(
          new ErroHttp(
            400,
            erro.code === 'LIMIT_FILE_SIZE'
              ? 'A imagem pode ter no máximo 5 MB'
              : 'Não foi possível ler o arquivo enviado',
          ),
        );
      }
      if (erro) {
        return reject(erro);
      }
      resolve();
    });
  });
}

export async function enviarImagem(
  req: RequisicaoComArquivo,
): Promise<string | undefined> {
  if (!req.file?.originalname) {
    return undefined;
  }
  const {
    BUCKET_FOTOS_VEICULOS,
    CHAVE_GRAVACAO_FOTOS_VEICULOS,
    CHAVE_LEITURA_FOTOS_VEICULOS,
  } = process.env;
  if (!BUCKET_FOTOS_VEICULOS || !CHAVE_GRAVACAO_FOTOS_VEICULOS) {
    throw new ErroHttp(500, 'ENV do bucket de imagens não informada');
  }

  const bucket = createBucketClient({
    bucketSlug: BUCKET_FOTOS_VEICULOS,
    readKey: CHAVE_LEITURA_FOTOS_VEICULOS ?? '',
    writeKey: CHAVE_GRAVACAO_FOTOS_VEICULOS,
  });
  const resposta = await bucket.media.insertOne({
    media: { originalname: req.file.originalname, buffer: req.file.buffer },
  });
  return resposta?.media?.url;
}
