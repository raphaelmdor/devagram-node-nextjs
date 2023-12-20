import type {NextApiRequest, NextApiResponse} from 'next';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import type { RespostaPadraoMsg } from '@/types/RespostaPadraoMsg';
import { UsuarioModel } from '@/models/UsuarioModel';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '@/services/uploadImagemCosmic';

const handler = nc()
    .use(upload.single('file'))
    .put(async(req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
         try{
            //para alterar o usuario, precisa pegar o mesmo no banco de dados
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);

            //se o usuario retornar algo é porque ele existe
            //caso contrário é porque ele não existe
            if(!usuario){
                return res.status(400).json({erro:'Este usuário não existe'});
            }

            const {nome} = req.body;
            if(!nome && nome.lenght > 2){
                usuario.nome = nome;
            }

            const {file} = req;
            if(file && file.orinalname){
                const image = await uploadImagemCosmic(req);
                if(image && image.media && image.media.url){
                    usuario.avatar = image.media.url;
                }
            }

            //para alterar os dados no banco de dados
            await UsuarioModel.findByIdAndUpdate({_id: usuario._id}, usuario);
            return res.status(200).json({msg: 'Usuário alterado com sucesso.'});

        }catch(e){
            console.log(e);
            return res.status(400).json({erro: 'Não foi possível atualizar o usuário.'});
        }
        
    })

    .get(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) =>{
    
        try{
    
            // para buscar os dados do usuário no banco de dados
            const {userId} = req?.query;
    
            //buscar todos os dados do usuário
            const usuario = await UsuarioModel.findById(userId);
            
            //para não retornar a senha do usuário
            usuario.senha = null;
        
            return res.status(200).json(usuario);
    
        }catch(e){
            console.log(e);
            return res.status(400).json({erro: 'Não foi possível obter dados do usuário.' });
        }
    });

export const config = {
    api: {
        bodyParser : false
    }
} 
 
export default validarTokenJWT(conectarMongoDB(handler));


//multer é para receber os dados e chegar até o servidor
//cosmic é para salvar no storage