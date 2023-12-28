import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { UsuarioModel } from "@/models/UsuarioModel";
import { NextRequest } from "next/server";
import { PublicacaoModel } from "@/models/PublicacaoModel";

const likeEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg> | any) => {
    try{
        if(req.method === 'PUT'){
            //o id da publicação vem no query, por isso chamamos o req?.query
            const {id} = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
        }
        return res.status(405).json({erro: 'Método informado não é válido.'})

    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Ocorreu um erro ao curtir/descurtir uma publicação.'})
    }
};

export default validarTokenJWT(conectarMongoDB(likeEndpoint));

//método PUT é utilizado para fazer atualização de dados.