import 'server-only';
import {Pool,type PoolClient} from 'pg';
const g=globalThis as unknown as {bancoIdeali?:Pool};
export const banco=g.bancoIdeali??new Pool({connectionString:process.env.DATABASE_URL,max:12,connectionTimeoutMillis:5000});g.bancoIdeali=banco;
export type Tx=PoolClient;
export async function transacao<T>(f:(tx:Tx)=>Promise<T>):Promise<T>{const tx=await banco.connect();try{await tx.query('BEGIN');const r=await f(tx);await tx.query('COMMIT');return r}catch(e){await tx.query('ROLLBACK');throw e}finally{tx.release()}}
