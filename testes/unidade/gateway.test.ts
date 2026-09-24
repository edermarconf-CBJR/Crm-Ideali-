import {expect,test} from 'vitest';
import {criarGateway} from '../../src/acesso/gateway';
const origem='http://127.0.0.1:3100';
const gateway=criarGateway(async()=>new Response(null,{status:204}),origem);
for(const caminho of ['admin/create-user','admin/remove-user','sign-up/email','delete-user','admin%2Fcreate-user']) test('bloqueia '+caminho,async()=>{expect((await gateway(new Request(origem+'/api/auth/'+caminho,{method:'POST',headers:{origin:origem}}))).status).toBe(404)});
test('nega origem externa em gravação',async()=>{expect((await gateway(new Request(origem+'/api/auth/sign-in/email',{method:'POST',headers:{origin:'https://outro.example'}}))).status).toBe(403)});
test('nega método indevido',async()=>{expect((await gateway(new Request(origem+'/api/auth/sign-in/email'))).status).toBe(405)});
