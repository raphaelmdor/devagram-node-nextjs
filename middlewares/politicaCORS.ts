import type { NextApiRequest,NextApiResponse, NextApiHandler } from "next";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import NextCors from "nextjs-cors";

export const politicaCORS = (handler: NextApiHandler) =>
   async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) =>{
        try{
            await NextCors(req, res, {
                origin: '*',
                methods: ['GET', 'POST', 'PUT'],
                optionsSuccessStatus: 200 //utilizado porque navegadores antigos dão problema quando se retorna o método 204
                //quando retornar o 204 o  optionsSuccessStatus não vai permitir, ele vai retornar o status 200
            });
            return handler(req, res);
        }catch(e){
            console.log('Erro: Erro ao tratar a Política de CORS:', e);
                return res.status(500).json({erro: 'Ocorreu um erro ao tratar a Política de CORS.'});
        }

        
    }