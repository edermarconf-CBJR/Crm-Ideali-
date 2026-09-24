import {convidarMembro} from '@/acesso/provisionar';
import {executar,json} from '@/servidor/http';import {exigirGestor} from '@/acesso/ator';import {banco} from '@/servidor/banco';
export const dynamic='force-dynamic';
export async function GET(req:Request){return executar(req,async a=>{exigirGestor(a);const r=await banco.query('SELECT m.id,u.name AS nome,u.email,m.perfil,m.estado,m.versao FROM membros m JOIN "user" u ON u.id=m.id ORDER BY u.name');return json(r.rows)})}

export async function POST(req:Request){return executar(req,async ator=>json(await convidarMembro(ator,await req.json()),201))}
