import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { UsuarioModel } from "@/models/UsuarioModel";
import { PublicacaoModel } from "@/models/PublicacaoModel";

const comentarioEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) =>{
    try{
        //testando o id do usuário
        if(req.method === 'PUT'){
            //id do usuário vem do query(url)
            //id da publicação vem do query
            //comentário vem do body pois no query(url) tem várias limitações

            const {userId, id} = req.query;
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro:'Usuário não encontrado'});
            }

            //testando o id da publicação
            const publicacao = await PublicacaoModel.findById(id);
            if (!publicacao){
                return res.status(400).json({ erro: 'Publicação não encontrada.'}); 
            }

            //comentário que vem do body
            if(!req.body || !req.body.comentario || req.body.comentario.length < 2){
                return res.status(400).json({ erro: 'Comentário não é válido'});
            }

            const comentario = {
                usuarioId: usuarioLogado._id,
                nome: usuarioLogado.nome,
                comentario: req.body.comentario
            }
           

            publicacao.comentarios.push(comentario);
            await PublicacaoModel.findByIdAndUpdate({_id: publicacao._id}, publicacao);
            return res.status(200).json({msg:'Comentário adicionado com sucesso'});
        }
        return res.status(405).json({erro:'Método informado não é válido.'})
    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Ocorreu um erro ao adicionar um comentário.'})
    }

} 

export default validarTokenJWT(conectarMongoDB(comentarioEndpoint));