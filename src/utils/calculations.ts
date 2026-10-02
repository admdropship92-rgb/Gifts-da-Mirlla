import { Insumo, ProdutoConfig, RegraConsumo } from '../types';
import { calcularCustoUnitarioInsumo } from './formatters';

export function isItemKitAntigo(
  insumo: { nome: string; id?: string; ativoNaReceita?: boolean } | string
): boolean {
  if (!insumo) return false;
  const n = (typeof insumo === 'object' ? insumo.nome : String(insumo))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return (
    n.includes('manta') ||
    n.includes('vinil') ||
    n.includes('bopp') ||
    (n.includes('saquinho') && !n.includes('holograf')) ||
    (n.includes('papel') && n.includes('glossy') && n.includes('230g'))
  );
}

export function inferirRegraConsumo(nome: string, itemRegra?: RegraConsumo): RegraConsumo {
  if (itemRegra) return itemRegra;
  const n = (nome || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (n.includes('holograf')) return 'por_embalagem_agrupada';
  if (n.includes('caixa')) return 'caixa_embalagem';
  if (n.includes('seda')) return 'por_caixa';
  if (n.includes('sacola')) return 'por_pedido';
  if (n.includes('papel') && !n.includes('seda')) return 'fotos_por_folha';
  return 'por_unidade';
}

export function getDescricaoRegra(
  regra: RegraConsumo,
  fotosPorFolha = 8,
  imasPorEmbalagem = 2,
  imasPorCaixa?: number,
  qtdMinimaCaixaAutomatica = 5
): string {
  switch (regra) {
    case 'por_unidade':
      return '1 por foto ímã';
    case 'fotos_por_folha':
      return `1/${fotosPorFolha} de folha por ímã (${fotosPorFolha} fotos/folha)`;
    case 'por_embalagem_agrupada':
      return `1 a cada ${imasPorEmbalagem} ímãs (arredondado p/ cima)`;
    case 'caixa_embalagem':
      return `Apenas se presente OU ≥ ${qtdMinimaCaixaAutomatica} ímãs (${imasPorCaixa && imasPorCaixa > 0 ? `teto(N ÷ ${imasPorCaixa}) caixas` : '1 por pedido'})`;
    case 'por_caixa':
      return `1 por caixa usada (se presente OU ≥ ${qtdMinimaCaixaAutomatica} ímãs)`;
    case 'por_pedido':
      return '1 por pedido (sacola)';
    default:
      return 'Por unidade';
  }
}

export interface InsumoDetalheCalculado {
  insumoId: string;
  nome: string;
  loja: string;
  custoUnitarioInsumo: number;
  regraConsumo: RegraConsumo;
  descricaoRegra: string;
  quantidadeCalculada: number;
  custoTotalNoPedido: number;
  pesoPercent: number;
}

export interface ResumoFinanceiro {
  // Custo de insumos de referência para 1 unidade (sem presente R$ 7,03 / com presente R$ 9,27)
  custoInsumosTotal: number;
  custoPorImaReferencia: number;
  custoSemPresente: number;
  custoComPresente: number;
  custoPorUnidade: number; // itens cobrados por unidade direta (Kit Ímã + Papel Fotográfico)
  custoPorPedido: number; // itens cobrados por pedido/embalagem

  // Parâmetros de regras
  fotosPorFolha: number;
  imasPorEmbalagem: number;
  imasPorCaixa?: number;
  qtdMinimaCaixaAutomatica: number;
  sacolaSempre: boolean;
  ehPresente?: boolean;

  // Taxas e entregas de referência
  custoEntregaPorUnidade: number;
  taxaTotalPercent: number;
  taxasValorPorUnidade: number;
  custoTotalPorUnidade: number;

  // Preço e lucratividade de referência
  precoVenda: number;
  lucroPorUnidade: number;
  margemPercent: number;
  markupPercent: number;
  estaNoLucro: boolean;
  precoSugerido: number;

  // Detalhamento para 1 unidade
  detalheInsumos: InsumoDetalheCalculado[];
  detalheParaGrafico: {
    nome: string;
    loja: string;
    custoNesteProduto: number;
    pesoPercent: number;
  }[];
}

/**
 * Calcula o custo exato do pedido para qualquer quantidade N de foto ímãs:
 * N × (kit + papel fotográfico) + teto(N ÷ 2) × holográfica + sacola + (se levar caixa: caixas × (caixa + papel seda))
 * Caixa e papel seda entram se: pedido para presente = sim, OU N >= quantidade mínima automática.
 */
export function calcularCustoPedido(
  resumo: ResumoFinanceiro,
  quantidade: number,
  precoUnitarioPersonalizado?: number,
  ehPresenteParam?: boolean
) {
  const N = Math.max(1, Math.round(quantidade));
  const precoUn =
    precoUnitarioPersonalizado !== undefined ? precoUnitarioPersonalizado : resumo.precoVenda;

  const fotosPorFolha = resumo.fotosPorFolha || 8;
  const imasPorEmbalagem = resumo.imasPorEmbalagem || 2;
  const imasPorCaixa = resumo.imasPorCaixa;
  const qtdMinimaCaixa = resumo.qtdMinimaCaixaAutomatica ?? 5;
  const ehPresente = ehPresenteParam !== undefined ? ehPresenteParam : Boolean(resumo.ehPresente);
  const levaCaixa = Boolean(ehPresente || N >= qtdMinimaCaixa);
  const sacolaAtiva = resumo.sacolaSempre !== false;

  // Quantidade de caixas necessárias para N ímãs (somente se leva caixa)
  const caixasCalculadas = imasPorCaixa && imasPorCaixa > 0 ? Math.ceil(N / imasPorCaixa) : 1;
  const qtdCaixas = levaCaixa ? caixasCalculadas : 0;

  let custoInsumosPedido = 0;
  const itensCalculados: InsumoDetalheCalculado[] = resumo.detalheInsumos.map((item) => {
    let qtdCalculada = 0;

    switch (item.regraConsumo) {
      case 'por_unidade':
        qtdCalculada = N;
        break;
      case 'fotos_por_folha':
        qtdCalculada = N * (1 / fotosPorFolha);
        break;
      case 'por_embalagem_agrupada':
        qtdCalculada = Math.ceil(N / imasPorEmbalagem);
        break;
      case 'caixa_embalagem':
        qtdCalculada = qtdCaixas;
        break;
      case 'por_caixa':
        qtdCalculada = qtdCaixas;
        break;
      case 'por_pedido':
        qtdCalculada = sacolaAtiva ? 1 : 0;
        break;
      default:
        qtdCalculada = N;
    }

    const custoTotalItem = item.custoUnitarioInsumo * qtdCalculada;
    custoInsumosPedido += custoTotalItem;

    return {
      ...item,
      quantidadeCalculada: qtdCalculada,
      custoTotalNoPedido: custoTotalItem,
      pesoPercent: 0,
    };
  });

  // Atualiza peso percentual de cada item no lote
  itensCalculados.forEach((item) => {
    item.pesoPercent =
      custoInsumosPedido > 0 ? (item.custoTotalNoPedido / custoInsumosPedido) * 100 : 0;
  });

  const faturamento = precoUn * N;
  const taxas = faturamento * (resumo.taxaTotalPercent / 100);
  const custoEntrega = resumo.custoEntregaPorUnidade; // fixo por pedido

  const custoTotal = custoInsumosPedido + taxas + custoEntrega;
  const custoInsumosPorIma = custoInsumosPedido / N;
  const custoTotalMedioPorIma = custoTotal / N;

  const lucroTotal = faturamento - custoTotal;
  const lucroPorIma = lucroTotal / N;
  const margemPercent = faturamento > 0 ? (lucroTotal / faturamento) * 100 : 0;

  return {
    quantidade: N,
    precoUnitario: precoUn,
    faturamento,
    custoInsumos: custoInsumosPedido,
    custoInsumosPorIma,
    custoInsumosMedioPorIma: custoInsumosPorIma,
    custoTotal,
    custoMedioPorIma: custoInsumosPorIma, // custo médio de insumos por ímã (custo do pedido ÷ N)
    custoTotalMedioPorIma,
    taxas,
    custoEntrega,
    lucroTotal,
    lucroPorIma,
    margemPercent,
    estaNoLucro: lucroTotal > 0.001,
    itensCalculados,
    qtdCaixas,
    levaCaixa,
    ehPresente,
    sacolaAtiva,
  };
}

export function calcularResumoFinanceiro(
  insumos: Insumo[],
  produto: ProdutoConfig,
  simuladorEhPresente = false
): ResumoFinanceiro {
  const mapaInsumos = new Map<string, Insumo>();
  insumos.forEach((ins) => mapaInsumos.set(ins.id, ins));

  const fotosPorFolha = produto.fotosPorFolha || 8;
  const imasPorEmbalagem = produto.imasPorEmbalagem || 2;
  const imasPorCaixa = produto.imasPorCaixa;
  const qtdMinimaCaixaAutomatica = produto.qtdMinimaCaixaAutomatica ?? 5;
  const sacolaSempre = produto.sacolaSempre !== false;
  const ehPresente = simuladorEhPresente;

  // Mapeia os itens da receita atribuindo a regra de consumo correta
  const detalheTemp: InsumoDetalheCalculado[] = [];

  produto.itens.forEach((item) => {
    const insumo = mapaInsumos.get(item.insumoId);
    if (!insumo) return;

    const custoUnitario = calcularCustoUnitarioInsumo(
      insumo.preco,
      insumo.frete,
      insumo.quantidade
    );

    const regra = inferirRegraConsumo(insumo.nome, item.regraConsumo);
    const desc = getDescricaoRegra(
      regra,
      fotosPorFolha,
      imasPorEmbalagem,
      imasPorCaixa,
      qtdMinimaCaixaAutomatica
    );

    // Para N = 1 de referência:
    let qtdRef = 1;
    if (regra === 'fotos_por_folha') qtdRef = 1 / fotosPorFolha;
    else if (regra === 'por_embalagem_agrupada') qtdRef = Math.ceil(1 / imasPorEmbalagem); // = 1
    else if (regra === 'caixa_embalagem' || regra === 'por_caixa') {
      qtdRef = ehPresente ? 1 : 0;
    } else if (regra === 'por_pedido') {
      qtdRef = sacolaSempre ? 1 : 0;
    } else {
      qtdRef = item.quantidade || 1;
    }

    const custoRef = custoUnitario * qtdRef;

    detalheTemp.push({
      insumoId: insumo.id,
      nome: insumo.nome,
      loja: insumo.loja,
      custoUnitarioInsumo: custoUnitario,
      regraConsumo: regra,
      descricaoRegra: desc,
      quantidadeCalculada: qtdRef,
      custoTotalNoPedido: custoRef,
      pesoPercent: 0,
    });
  });

  // Cálculo específico de 1 ímã sem presente (R$ 7,03) e com presente (R$ 9,27):
  let custoSemPresente = 0;
  let custoComPresente = 0;
  let custoPorUnidade = 0;
  let custoPorPedido = 0;

  produto.itens.forEach((item) => {
    const insumo = mapaInsumos.get(item.insumoId);
    if (!insumo) return;
    const custoUnitario = calcularCustoUnitarioInsumo(insumo.preco, insumo.frete, insumo.quantidade);
    const regra = inferirRegraConsumo(insumo.nome, item.regraConsumo);

    if (regra === 'por_unidade') {
      custoSemPresente += custoUnitario;
      custoComPresente += custoUnitario;
      custoPorUnidade += custoUnitario;
    } else if (regra === 'fotos_por_folha') {
      const c = custoUnitario * (1 / fotosPorFolha);
      custoSemPresente += c;
      custoComPresente += c;
      custoPorUnidade += c;
    } else if (regra === 'por_embalagem_agrupada') {
      const c = custoUnitario * Math.ceil(1 / imasPorEmbalagem);
      custoSemPresente += c;
      custoComPresente += c;
      custoPorPedido += c;
    } else if (regra === 'por_pedido') {
      if (sacolaSempre) {
        custoSemPresente += custoUnitario;
        custoComPresente += custoUnitario;
        custoPorPedido += custoUnitario;
      }
    } else if (regra === 'caixa_embalagem' || regra === 'por_caixa') {
      // Caixa e seda entram com presente
      custoComPresente += custoUnitario;
      if (ehPresente) {
        custoPorPedido += custoUnitario;
      }
    }
  });

  const custoInsumosTotal = ehPresente ? custoComPresente : custoSemPresente;

  detalheTemp.forEach((it) => {
    it.pesoPercent = custoInsumosTotal > 0 ? (it.custoTotalNoPedido / custoInsumosTotal) * 100 : 0;
  });

  const detalheParaGrafico = detalheTemp.map((d) => ({
    nome: d.nome,
    loja: d.loja,
    custoNesteProduto: d.custoTotalNoPedido,
    pesoPercent: d.pesoPercent,
  }));

  const custoEntrega = Number(produto.custoEntregaPorUnidade) || 0;
  const taxaPlataforma = Number(produto.taxaPlataformaPercent) || 0;
  const taxaPagamento = Number(produto.taxaPagamentoPercent) || 0;
  const taxaTotalPercent = taxaPlataforma + taxaPagamento;

  const precoVenda = Number(produto.precoVenda) || 0;
  const taxasValorPorUnidade = precoVenda * (taxaTotalPercent / 100);

  const custoTotalPorUnidade = custoInsumosTotal + custoEntrega + taxasValorPorUnidade;
  const lucroPorUnidade = precoVenda - custoTotalPorUnidade;

  const margemPercent = precoVenda > 0 ? (lucroPorUnidade / precoVenda) * 100 : 0;
  const custosDiretos = custoInsumosTotal + custoEntrega;
  const markupPercent = custosDiretos > 0 ? (lucroPorUnidade / custosDiretos) * 100 : 0;

  const estaNoLucro = lucroPorUnidade > 0.001;

  // Preço sugerido
  const margemDesejada = Number(produto.margemDesejada) || 0;
  const divisor = 1 - (taxaTotalPercent + margemDesejada) / 100;
  let precoSugerido = 0;
  if (divisor > 0.01 && custosDiretos > 0) {
    precoSugerido = custosDiretos / divisor;
  } else if (custosDiretos > 0) {
    precoSugerido = custosDiretos * (1 + margemDesejada / 100);
  }

  return {
    custoInsumosTotal,
    custoPorImaReferencia: custoInsumosTotal,
    custoSemPresente,
    custoComPresente,
    custoPorUnidade,
    custoPorPedido,
    fotosPorFolha,
    imasPorEmbalagem,
    imasPorCaixa,
    qtdMinimaCaixaAutomatica,
    sacolaSempre,
    ehPresente,
    custoEntregaPorUnidade: custoEntrega,
    taxaTotalPercent,
    taxasValorPorUnidade,
    custoTotalPorUnidade,
    precoVenda,
    lucroPorUnidade,
    margemPercent,
    markupPercent,
    estaNoLucro,
    precoSugerido,
    detalheInsumos: detalheTemp,
    detalheParaGrafico,
  };
}
