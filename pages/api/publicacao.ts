import type { NextApiRequest, NextApiResponse } from "next";
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from "@/services/uploadImagemCosmic";
import {conectaMongoDB} from '../../middlewares/conectaMongoDB';
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";

const handler = nc()
    .use(upload.single('file'))
    .post(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) =>{
        const {descricao, file} = req.body;

        if(!descricao || descricao.length < 2){
            return res.status(400).json({erro: 'Descrição não é válida.'})
        }

        if(!file){
            return res.status(400).json({erro: 'Imagem obrigatória.'})
        }

        return res.status(200).json({msg: 'Publicado com sucesso.'})

});

export const config = {
    api: {
        bodyParser : false
    }
}

export default validarTokenJWT(conectaMongoDB(handler));