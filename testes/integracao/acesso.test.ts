import {test,expect,afterAll} from 'vitest';
import {GET} from '../../src/app/api/equipe/route';
import {POST} from '../../src/app/api/auth/[...all]/route';
import {criarCenario,requisicao,senhaTeste} from '../apoio/cenario';
import {banco} from '../../src/servidor/banco';
afterAll(()=>banco.end());
test('restringe equipe no servidor e nunca abre o admin da biblioteca',async()=>{const c=await criarCenario();try{expect((await GET(requisicao(null,'/api/equipe'))).status).toBe(401);expect((await GET(requisicao(c.corretorA,'/api/equipe'))).status).toBe(403);expect((await GET(requisicao(c.gestor,'/api/equipe'))).status).toBe(200);expect((await POST(requisicao(c.gestor,'/api/auth/admin/remove-user','POST',{userId:c.corretorA.id}))).status).toBe(404);await banco.query("UPDATE membros SET estado='inativo' WHERE id=$1",[c.corretorA.id]);expect((await GET(requisicao(c.corretorA,'/api/equipe'))).status).toBe(401);const novo=await POST(requisicao(null,'/api/auth/sign-in/email','POST',{email:c.corretorA.email,password:senhaTeste}));expect(novo.status).toBe(403)}finally{await c.limpar()}});
