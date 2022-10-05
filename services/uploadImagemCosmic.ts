import multer from "multer";
import cosmicjs from 'cosmicjs';

const {CHAVE_GRAVACAO_FOTOS_VEICULOS, BUCKET_FOTOS_VEICULOS} = process.env;

const Cosmic = cosmicjs();

const bucketFotosVeiculos = Cosmic.bucket({
    slug: BUCKET_FOTOS_VEICULOS,
    write_key: CHAVE_GRAVACAO_FOTOS_VEICULOS
});

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const uploadImagemCosmic = async(req: any) => {
    if(req?.file?.originalname){
        const media_object = {
            originalname: req.file.originalname,
            buffer: req.file.buffer
        };

        return await bucketFotosVeiculos.addMedia({media: media_object});
    }
}

export {upload, uploadImagemCosmic};