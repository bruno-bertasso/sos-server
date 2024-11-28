import { boolean } from "drizzle-orm/mysql-core"

// dataHoraFimPropostas: string,
export interface ICompra {
    ano: number,
    caracteristica: string,
    criterioJulgamento: string,
    dataHoraFimDisputa: string,
    equalizacaoIcms: boolean,
    faseCompraFaseExterna: string,
    formaRealizacao: string,
    homologada: boolean,
    julgamentoIniciado: boolean,
    modalidade: number,
    nomeOrgao: string,
    nomeUasg: string,
    numero: number,
    numeroUasg: number,
    objetoCompra: string,
    participacaoExclusivaMeEPP: boolean,
    possuiAvisoDeEvento: boolean, 
    possuiEventoQueImpedeAcaoNaCompra: boolean,
    tipoEventoImpeditivoVigente: string,
    possuiInformativo: boolean
    situacaoCompraFaseExterna: string,
    fundamentoLegal: string,
    chaveCompraPncp: string
    
}

export interface IItens {
    numero: number,
    tipo: string,
    disputaPorValorUnitario: boolean,
    identificador: string,
    tipoItemCatalogo: string,
    descricao: string,
    criterioJulgamento: string,
    homologado: boolean,
    numeroSessaoJulgHab: number,
    tipoTratamentoDiferenciadoMeEpp: string,
    participacaoExclusivaMeEppOuEquiparadas: boolean,
    utilizaMargemPreferencia: false,
    situacao: string,
    fase: string,
    quantidadeSolicitada: number,
    criterioValor: string,
    valorEstimado: number,
    valorEstimadoUnitario: number,
    valorEstimadoTotal: number,
    priorizarAbertura: boolean,
    julgHabEncerrada: boolean
}

export interface ILog {
    path: string,
    message: string
}


