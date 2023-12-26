import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { UsuarioModel } from "@/models/UsuarioModel";

const pesquisaEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {
    try{
        //para efetuar a busca do usuário
        if(req.method === 'GET'){

            const {filtro} = req.query;
            // É bom utilizar o filtro como parâmetro para efetuar as duas buscar por um parâmetro ao invés de ter
            // vários parâmetros
            if(!filtro || filtro.length < 2){
                return res.status(400).json({erro: 'Nome ou email informado são inválidos'});
            }

            const usuariosEncontrados = await UsuarioModel.find({
                $or: [{nome: {$regex: filtro, $options: 'i'}}, //{email: {$regex: filtro, $options: 'i'}}
                ] 
            });
            return res.status(200).json(usuariosEncontrados);

        }
        return res.status(405).json({erro: 'Método informado não é válido.'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Não foi possível buscar o usuário:' + e});
    }
}
export default validarTokenJWT(conectarMongoDB(pesquisaEndpoint));

//O $regex é utilizado para não precisar colocar o nome 100% completo para efetuar a busca
//O $options 'i' é usado nesse caso para ignore case, no caso, serve para autorizar fazer a busca tudo em caixa baixa
