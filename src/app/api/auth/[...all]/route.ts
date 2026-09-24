import { auth } from "@/acesso/auth";
import { criarGateway } from "@/acesso/gateway";
export const dynamic = "force-dynamic";
const gateway = criarGateway(auth.handler, process.env.APP_ORIGIN!);
export const GET = gateway;
export const POST = gateway;
