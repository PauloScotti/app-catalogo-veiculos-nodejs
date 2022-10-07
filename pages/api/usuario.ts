import type { NextApiRequest, NextApiResponse } from "next";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { RespostaPadraoMsg } from "../../types/RespostaPadraMsg";
import { conectaMongoDB } from "../../middlewares/conectaMongoDB";
import { UsuarioModel } from "../../models/UsuarioModel";
import nc from 'next-connect';
import { politicaCORS } from "../../middlewares/politicaCORS";
import md5 from "md5";
import { CadastroRequisicao } from "../../types/CadastroRequisicao";

const handler = nc()
        .post(async (
            req: NextApiRequest,
            res: NextApiResponse<RespostaPadraoMsg>
        ) => {

        const usuario = req.body as CadastroRequisicao;

        if(!usuario.nome || usuario.nome.length < 2){
            return res.status(400).json({erro : "Nome não é válido"});
        }

        if(!usuario.email || usuario.email.length < 5
            || !usuario.email.includes('@')
            || !usuario.email.includes('.')){
            return res.status(400).json({erro : 'Email invalido'});
        }
        
        if(!usuario.senha || usuario.senha.length < 4){
            return res.status(400).json({erro : "Senha não é válido"});
        }

        if(!usuario.nivelAcesso || usuario.nivelAcesso.length < 5) {
            return res.status(400).json({erro: "Nível de acesso não é válido"});
        }

        const usuariosComMesmoEmail = await UsuarioModel.find({email : usuario.email});
        if(usuariosComMesmoEmail && usuariosComMesmoEmail.length > 0){
            return res.status(400).json({erro : "E-mail já cadastrado em outra conta"});
        }

        const usuarioASerSalvo = {
            nome : usuario.nome,
            email : usuario.email,
            senha : md5(usuario.senha),
            nivelAcesso : usuario.nivelAcesso
        }
        
        await UsuarioModel.create(usuarioASerSalvo);
        return res.status(200).json({ msg: "Usuário cadastrado com sucesso"});

    })
    .put(async (req: any, res: NextApiResponse<RespostaPadraoMsg> | any) => {
        try{
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);

            if(!usuario){
                return res.status(400).json({erro: 'Usuário não encontrado'});
            }

            const {nome} = req.body;
            if(nome && nome.length > 2){
                usuario.nome = nome;
            }

            const {nivelAcesso} = req.body;
            if(nivelAcesso && nivelAcesso.length > 2){
                usuario.nivelAcesso = nivelAcesso;
            }

            await UsuarioModel.findByIdAndUpdate({_id : usuario._id}, usuario);

            return res.status(200).json({msg: 'Usuário atualizado com sucesso!'});


        }catch(e){
            console.log(e);
            return res.status(400).json({erro: `Não foi possível atualizar o usuário` + e});
        }

    })
    .get(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg> | any) => {

        try{
            const {userId} = req?.query;
    
            const usuario = await UsuarioModel.findById(userId);
            usuario.senha = null;
            return res.status(200).json(usuario);
    
        }catch(e){
            console.log(e);
            return res.status(400).json({erro: 'Não foi possível obter dados dos usuários'});
        }
    
    })
    .delete(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {
        try{
            const {id} = req?.query;
            const usuario = await UsuarioModel.findById(id);

            if(!usuario){
                return res.status(400).json({erro: 'Usuário não encontrado'});
            }

            await UsuarioModel.findByIdAndDelete({_id : usuario._id}, usuario);

            return res.status(200).json({ msg: "Usuário deletado com sucesso!"});

        } catch(e){
                console.log(e);
                return res.status(500).json({erro: 'Não foi possível buscar o usuário'});
        }

    });

    export const config = {
        api: {
            bodyParser : true
        }
    }

export default politicaCORS(validarTokenJWT(conectaMongoDB(handler)));