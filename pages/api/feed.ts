import type {NextApiRequest, NextApiResponse} from 'next';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import type { RespostaPadraoMsg } from '@/types/RespostaPadraoMsg';
import { UsuarioModel } from '@/models/UsuarioModel';
import { PublicacaoModel } from '@/models/PublicacaoModel';
import { SeguidorModel } from '@/models/SeguidorModel';
import {politicaCORS} from '../../middlewares/politicaCORS';

const feedEndpoint = async (req: NextApiRequest , res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try{
        if(req.method === 'GET'){
            
            // de onde vem a informação do id do usuário
            if(req?.query?.id){
                //validar se é um usuário válido
                const usuario = await UsuarioModel.findById(req?.query?.id);
                if(!usuario){
                    return res.status(400).json({erro: 'Usuário não encontrado.'});
                }

                //como buscar as informações dele
                const publicacoes = await PublicacaoModel
                    .find({idUsuario : usuario._id})
                    .sort({data : -1});

                    return res.status(200).json(publicacoes);
            }
            else{
                const {userId} = req.query;
                const usuarioLogado = await UsuarioModel.findById(userId);
                if(!usuarioLogado){
                    return res.status(400).json({erro: 'Usuário não encontrado.'})
                }

                //buscando seguidores no banco para mostrar no feed
                const seguidores = await SeguidorModel.find({usuarioId: usuarioLogado._id});
                const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId);

                //buscando publicações no banco para mostrar no feed
                const publicacoes = await PublicacaoModel.find({
                    $or:[
                        {idUsuario: usuarioLogado._id},
                        {idUsuario: seguidoresIds}
                    ]
                })
                .sort({data: -1});

                const result = [];
                for (const publicacao of publicacoes){
                    const usuarioDaPublicacao = await UsuarioModel.findById(publicacao.idUsuario);
                    if(usuarioDaPublicacao){
                        const final = {...publicacao._doc, usuario: {
                            nome: usuarioDaPublicacao.nome,
                            avatar: usuarioDaPublicacao.avatar
                        }}
                        result.push(final);
                    }
                }

                return res.status(200).json(result);
            }
        }
        return res.status(405).json({erro: 'Método informado não é válido.'})

    }catch(e){
        console.log(e);
    }
    return res.status(400).json({erro: 'Não foi possível obter o feed.'})
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)));

// tudo que é consulta de informação vai no req.query
// tudo o que é envio de informação vai no req.body