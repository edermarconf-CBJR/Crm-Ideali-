export class ErroDominio extends Error{constructor(public codigo:string,mensagem:string,public campos?:Record<string,string>){super(mensagem);this.name='ErroDominio'}}
