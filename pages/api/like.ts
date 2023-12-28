import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { UsuarioModel } from "@/models/UsuarioModel";
import { PublicacaoModel } from "@/models/PublicacaoModel";

const likeEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg> | any) => {
    try{
        if(req.method === 'PUT'){
            //o id da publicação vem no query, por isso chamamos o req?.query
            //achando a id da publicação
            const {id} = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            if(!publicacao){
                return res.status(400).json({erro:"Publicação não encontrada."});
            }

            //id do usuário que está curtindo a foto
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);
            if (!usuario) {
                return res.status(400).json({erro:"Usuário não encontrado."});
            }

            //administrando os likes
            const indexDoUsuarioNoLike = publicacao.likes.findIndex((e: any) => e.toString() === usuario._id.toString());
            
            //se o index for -1 é sinal de que ele não curte a foto
            if(indexDoUsuarioNoLike != -1){
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
                await PublicacaoModel.findByIdAndUpdate({_id: publicacao._id}, publicacao);
                return res.status(200).json({msg: 'Publicação descurtida com sucesso.'})
            }else{
                //se o index for > -1 é sinal de que ele curte a foto
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({_id: publicacao._id}, publicacao);
                return res.status(200).json({msg: 'Publicação curtida com sucesso.'}); 
            }

        }

        return res.status(405).json({erro: 'Método informado não é válido.'});

    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Ocorreu um erro ao curtir/descurtir uma publicação.'})
    }
};

export default validarTokenJWT(conectarMongoDB(likeEndpoint));

//método PUT é utilizado para fazer atualização de dados.
//splice é um método do array onde se remove uma peça do meio.