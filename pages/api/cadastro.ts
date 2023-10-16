import type {NextApiRequest, NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import type {CadastroRequisicao} from '../../types/CadastroRequisicao';
import {UsuarioModel} from '../../models/UsuarioModel';
import {conectaMongoDB} from "../../middlewares/conectaMongoDB"

const endpointCadastro = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    if(req.method === 'POST') {
        const usuario = req.body as CadastroRequisicao;

        if(!usuario.nome || usuario.nome.length <2){
            return res.status(400).json({erro: 'Nome inválido.'});
        }

        if(!usuario.email || usuario.email.length <5
            || !usuario.email.includes('@')
            || !usuario.email.includes('.')){
            return res.status(400).json({erro: 'Email inválido.'});    
            }

        if(!usuario.senha || usuario.senha.length <6){
        return res.status(400).json({erro: 'Senha deve conter no mínimo 6 caracteres.'});
        }

        const usuariosComMesmoEmail = await UsuarioModel.find({email: usuario.email});
        if(usuariosComMesmoEmail && usuariosComMesmoEmail.length >0){
            return res.status(400).json({erro: 'Email já cadastrado.'});
        }
        
        await UsuarioModel.create(usuario);
        return res.status(200).json({msg: 'Cadastro realizado com sucesso'});
    }
    return res.status(405).json({erro: 'Método informado não é válido.'});
}

export default conectaMongoDB(endpointCadastro);