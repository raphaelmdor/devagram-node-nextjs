import type {NextApiRequest, NextApiResponse} from 'next';
import {conectaMongoDB} from '../../middlewares/conectaMongoDB';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import md5 from 'md5';
import {UsuarioModel} from '@/models/UsuarioModel';

const endpointLogin = async (
    req: NextApiRequest,
    res: NextApiResponse<RespostaPadraoMsg>
) => {
    if(req.method === 'POST'){
        const {login, senha} = req.body;
        
        const usuarioEncontrado = await UsuarioModel.find({email: login, senha: md5(senha)});
        if(login === 'admin@admin.com' &&
            senha === 'Admin@123'){
               return res.status(200).json({msg: 'Usuário autenticado com sucesso.'});
            }
            return res.status(400).json({erro: 'Usuário ou Senha inválido(a).'});

    }
    return res.status(405).json({erro: 'Método informado não é válido.'});
}

export default conectaMongoDB(endpointLogin);