export type LojaInsumo = 'Shopee' | 'Temu' | 'Outro';
export type TipoCobrancaItem = 'unidade' | 'pedido';

export type RegraConsumo =
  | 'por_unidade' // 1 por ímã
  | 'fotos_por_folha' // 1 / fotosPorFolha por ímã
  | 'por_embalagem_agrupada' // 1 a cada X ímãs (teto(N / imasPorEmbalagem))
  | 'caixa_embalagem' // 1 por pedido ou teto(N / imasPorCaixa) se preenchido
  | 'por_caixa' // 1 por caixa usada (acompanha caixas)
  | 'por_pedido'; // 1 por pedido fixo

export interface Insumo {
  id: string;
  nome: string;
  loja: LojaInsumo;
  preco: number; // Preço pago em R$
  frete: number; // Frete em R$
  quantidade: number; // Quantidade de itens no pacote
  data: string; // YYYY-MM-DD
  observacao?: string;
  unidadeMedida?: string; // un, folha, metro, etc.
  pertenceAoKitBase?: boolean; // Pertence ao Kit Base do Ímã
  ativoNaReceita?: boolean; // Se faz parte da receita ativa
}

export interface ItemFotoIma {
  insumoId: string;
  quantidade: number; // Quantidade base ou por lote
  tipoCobranca?: TipoCobrancaItem; // 'unidade' ou 'pedido'
  regraConsumo?: RegraConsumo; // Regra específica de consumo
  parametroRegra?: number; // Ex: fotos por folha, ímãs por embalagem, etc.
}

export interface FaixaDesconto {
  qtdMinima: number;
  descontoPercent: number;
}

export interface ProdutoConfig {
  nome: string;
  itens: ItemFotoIma[];
  taxaPlataformaPercent: number; // Ex: 14% Shopee / Elo7
  taxaPagamentoPercent: number; // Ex: 2.5% Máquina de cartão / Pix
  custoEntregaPorUnidade: number; // Ex: R$ 0.00 ou frete/embalagem
  precoVenda: number; // Preço praticado em R$
  margemDesejada: number; // Ex: 50%
  margemMinima?: number; // Padrão: 20%
  faixasDesconto?: FaixaDesconto[]; // Padrão: 1->0%, 5->10%, 10->15%, 25->20%
  fotosPorFolha?: number; // Padrão: 8 fotos por folha
  imasPorEmbalagem?: number; // Padrão: 2 ímãs por embalagem holográfica
  imasPorCaixa?: number; // Padrão: undefined/0 (1 por pedido sem limite)
  qtdMinimaCaixaAutomatica?: number; // Padrão: 5 ímãs para caixa automática
  sacolaSempre?: boolean; // Padrão: true (sacola em todo pedido)
}

export interface SimuladorConfig {
  quantidadeVenda: number;
  ehPresente?: boolean; // Se o pedido é para presente (sim/não)
}

export interface AppData {
  insumos: Insumo[];
  produto: ProdutoConfig;
  simulador: SimuladorConfig;
  ultimaAtualizacao: string;
}
