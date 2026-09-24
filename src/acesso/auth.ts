import {enviarLink,ativarConvite} from './recuperacao';
import 'server-only';
import {betterAuth} from 'better-auth';
import {admin} from 'better-auth/plugins';
import {APIError} from 'better-auth/api';
import {banco} from '../servidor/banco';
export const auth=betterAuth({database:banco,baseURL:process.env.APP_ORIGIN,secret:process.env.BETTER_AUTH_SECRET,trustedOrigins:[process.env.APP_ORIGIN!],emailAndPassword:{enabled:true,disableSignUp:true,minPasswordLength:12,maxPasswordLength:128,revokeSessionsOnPasswordReset:true,resetPasswordTokenExpiresIn:3600,sendResetPassword:async({user,token})=>enviarLink(user,token),onPasswordReset:async({user})=>ativarConvite(user.id)},session:{cookieCache:{enabled:false}},rateLimit:{enabled:true,storage:'database',window:60,max:60,customRules:{'/sign-in/email':{window:60,max:5},'/request-password-reset':{window:60,max:5}}},plugins:[admin({defaultRole:'user'})],databaseHooks:{session:{create:{before:async(sessao)=>{const r=await banco.query('SELECT estado FROM membros WHERE id=$1',[sessao.userId]);if(r.rows[0]?.estado!=='ativo')throw new APIError('FORBIDDEN',{message:'Acesso indisponível.'});return {data:sessao}}}}}});
