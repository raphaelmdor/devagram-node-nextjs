import type {NextApiRequest, NextApiResponse} from 'next';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import type { RespostaPadraoMsg } from '@/types/RespostaPadraoMsg';
import { UsuarioModel } from '@/models/UsuarioModel';
import { SeguidorModel } from '@/models/SeguidorModel';
import usuario from './usuario';
import { politicaCORS } from '@/middlewares/politicaCors';

const endpointSeguir = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) =>{
    try{
        if(req.method === 'PUT'){
            //Usado como destructor, para passar as informações sem precisar repetir o req?.query no if
            const {userId, id} = req?.query;

            //para buscar e ver se é um usuário válido
            const usuarioLogado = await UsuarioModel.findById(userId);

            //id do usuário vindo do token = usuário logado/autenticado = quem está fazendo as ações
            if(!usuarioLogado){
                return res.status(400).json({erro: 'Usuário logado não encontrado.'});
            }

            const usuarioASerSeguido = await UsuarioModel.findById(id);

            //id do usuário a ser seguido - query
            if(!usuarioASerSeguido){    
                return res.status(400).json({erro: 'Usuário a ser seguido não encontrado.'});
            }

            //buscar se EU LOGADO sigo ou não este usuário
            const euJaSigoEsseUsuario = await SeguidorModel.find({usuarioId: usuarioLogado._id, usuarioSeguidoId: usuarioASerSeguido._id});
            //sinal que eu já sigo este usuário
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                euJaSigoEsseUsuario.forEach(async(e: any) => await SeguidorModel.findByIdAndDelete({_id: e._id}));
                
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);

                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg:'Deixou de seguir o usuário com sucesso.'})
            }else{
                //sinal que eu não sigo este usuário
                const seguidor = {
                    usuarioId: usuarioLogado._id, 
                    usuarioSeguidoId: usuarioASerSeguido._id    
                };
                await SeguidorModel.create(seguidor);

                //adicionar UM seguindo no usuário logado
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);

                //adicionar um seguidor no usuário seguido
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg:'Usuário seguido com sucesso.'})
            }

        }
        return res.status(405).json({erro: 'Método informado não é válido'});
    }catch(e){
        console.log(e)
        return res.status(500).json({erro: 'Não foi possível seguir ou deixar de seguir o usuário.'});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointSeguir)));