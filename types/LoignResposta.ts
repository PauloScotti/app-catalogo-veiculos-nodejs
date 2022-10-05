export type LoginResposta = {
    nome : string,
    email : string,
    token? : string,
    tokenAdm?: string,
    nivelAcesso: string
}