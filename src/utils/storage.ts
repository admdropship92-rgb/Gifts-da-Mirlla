import { AppData, FaixaDesconto, Insumo, ItemFotoIma, ProdutoConfig } from '../types';

export const STORAGE_KEY = 'foto_imas_dados_v3';

export const FAIXAS_DESCONTO_PADRAO: FaixaDesconto[] = [
  { qtdMinima: 1, descontoPercent: 0 },
  { qtdMinima: 5, descontoPercent: 10 },
  { qtdMinima: 10, descontoPercent: 15 },
  { qtdMinima: 25, descontoPercent: 20 },
];

// 6 Novos insumos reais solicitados
export const NOVOS_INSUMOS_REAIS: Insumo[] = [
  {
    id: 'insumo-kit-ima',
    nome: 'Kit Ímã',
    loja: 'Outro',
    preco: 251.20,
    frete: 0,
    quantidade: 40,
    unidadeMedida: 'unidades',
    data: '2026-03-15',
    observacao: 'Pacote com 40 unidades (custo unitário R$ 6,28)',
    ativoNaReceita: true,
  },
  {
    id: 'insumo-papel-fotografico',
    nome: 'Papel Fotográfico',
    loja: 'Outro',
    preco: 14.00,
    frete: 0,
    quantidade: 50,
    unidadeMedida: 'folhas',
    data: '2026-03-15',
    observacao: 'Pacote com 50 folhas (custo R$ 0,28/folha) · 8 fotos por folha (R$ 0,035/foto)',
    ativoNaReceita: true,
  },
  {
    id: 'insumo-embalagem-holografica',
    nome: 'Embalagem Holográfica',
    loja: 'Outro',
    preco: 29.90,
    frete: 0,
    quantidade: 100,
    unidadeMedida: 'unidades',
    data: '2026-03-15',
    observacao: 'Pacote com 100 unidades (custo unitário R$ 0,299)',
    ativoNaReceita: true,
  },
  {
    id: 'insumo-papel-seda',
    nome: 'Papel Seda',
    loja: 'Outro',
    preco: 29.90,
    frete: 0,
    quantidade: 25,
    unidadeMedida: 'unidades',
    data: '2026-03-15',
    observacao: 'Pacote com 25 unidades (custo unitário R$ 1,196)',
    ativoNaReceita: true,
  },
  {
    id: 'insumo-sacola',
    nome: 'Sacola',
    loja: 'Outro',
    preco: 41.52,
    frete: 0,
    quantidade: 100,
    unidadeMedida: 'unidades',
    data: '2026-03-15',
    observacao: 'Pacote com 100 unidades (custo unitário R$ 0,4152)',
    ativoNaReceita: true,
  },
  {
    id: 'insumo-caixa-embalagem',
    nome: 'Caixa de Embalagem',
    loja: 'Outro',
    preco: 20.93,
    frete: 0,
    quantidade: 20,
    unidadeMedida: 'unidades',
    data: '2026-03-15',
    observacao: 'Pacote com 20 unidades (custo unitário R$ 1,0465)',
    ativoNaReceita: true,
  },
];

// Insumos anteriores salvos para histórico (não usados na receita atual)
export const INSUMOS_HISTORICOS_ANTIGOS: Insumo[] = [
  {
    id: 'insumo-manta-shopee',
    nome: 'Manta Magnética Adesivada 0.3mm (Folhas A4)',
    loja: 'Shopee',
    preco: 38.90,
    frete: 0,
    quantidade: 20,
    unidadeMedida: 'folhas A4',
    data: '2026-02-15',
    observacao: 'Histórico - Não usado na receita atual',
    ativoNaReceita: false,
    pertenceAoKitBase: false,
  },
  {
    id: 'insumo-manta-temu',
    nome: 'Manta Magnética Adesivada 0.3mm (Folhas A4)',
    loja: 'Temu',
    preco: 46.50,
    frete: 5.50,
    quantidade: 25,
    unidadeMedida: 'folhas A4',
    data: '2026-03-01',
    observacao: 'Histórico - Não usado na receita atual',
    ativoNaReceita: false,
    pertenceAoKitBase: false,
  },
  {
    id: 'insumo-bopp-shopee',
    nome: 'Vinil Adesivo Protetor Transparente (Laminação)',
    loja: 'Shopee',
    preco: 19.90,
    frete: 0,
    quantidade: 100,
    unidadeMedida: 'folhas',
    data: '2026-02-28',
    observacao: 'Histórico - Não usado na receita atual',
    ativoNaReceita: false,
    pertenceAoKitBase: false,
  },
  {
    id: 'insumo-saquinho-shopee',
    nome: 'Saquinho Plástico Transparente Adesivado 7x10cm',
    loja: 'Shopee',
    preco: 12.00,
    frete: 0,
    quantidade: 200,
    unidadeMedida: 'unidades',
    data: '2026-03-10',
    observacao: 'Histórico - Não usado na receita atual',
    ativoNaReceita: false,
    pertenceAoKitBase: false,
  },
  {
    id: 'insumo-saquinho-temu',
    nome: 'Saquinho Plástico Transparente Adesivado 7x10cm',
    loja: 'Temu',
    preco: 14.50,
    frete: 0,
    quantidade: 200,
    unidadeMedida: 'unidades',
    data: '2026-03-12',
    observacao: 'Histórico - Não usado na receita atual',
    ativoNaReceita: false,
    pertenceAoKitBase: false,
  },
  {
    id: 'insumo-papel-shopee',
    nome: 'Papel Fotográfico Glossy 230g (A4)',
    loja: 'Shopee',
    preco: 25.90,
    frete: 0,
    quantidade: 100,
    unidadeMedida: 'folhas',
    data: '2026-02-20',
    observacao: 'Histórico - Não usado na receita atual',
    ativoNaReceita: false,
    pertenceAoKitBase: false,
  },
  {
    id: 'insumo-papel-temu',
    nome: 'Papel Fotográfico Glossy 230g (A4)',
    loja: 'Temu',
    preco: 31.90,
    frete: 0,
    quantidade: 100,
    unidadeMedida: 'folhas',
    data: '2026-03-05',
    observacao: 'Histórico - Não usado na receita atual',
    ativoNaReceita: false,
    pertenceAoKitBase: false,
  },
];

// Receita com as regras exatas de consumo
export const ITENS_RECEITA_PADRAO: ItemFotoIma[] = [
  // 1. Kit Ímã: 1 por ímã (R$ 6,28 cada)
  {
    insumoId: 'insumo-kit-ima',
    quantidade: 1,
    tipoCobranca: 'unidade',
    regraConsumo: 'por_unidade',
  },
  // 2. Papel Fotográfico: 1/8 de folha por ímã (8 fotos por folha)
  {
    insumoId: 'insumo-papel-fotografico',
    quantidade: 0.125,
    tipoCobranca: 'unidade',
    regraConsumo: 'fotos_por_folha',
  },
  // 3. Embalagem Holográfica: 1 embalagem a cada 2 ímãs (teto(N / 2))
  {
    insumoId: 'insumo-embalagem-holografica',
    quantidade: 1,
    tipoCobranca: 'unidade',
    regraConsumo: 'por_embalagem_agrupada',
    parametroRegra: 2,
  },
  // 4. Caixa de Embalagem: 1 por pedido (ou teto(N / imasPorCaixa))
  {
    insumoId: 'insumo-caixa-embalagem',
    quantidade: 1,
    tipoCobranca: 'pedido',
    regraConsumo: 'caixa_embalagem',
  },
  // 5. Papel Seda: 1 por caixa usada (acompanha caixas)
  {
    insumoId: 'insumo-papel-seda',
    quantidade: 1,
    tipoCobranca: 'pedido',
    regraConsumo: 'por_caixa',
  },
  // 6. Sacola: 1 por pedido
  {
    insumoId: 'insumo-sacola',
    quantidade: 1,
    tipoCobranca: 'pedido',
    regraConsumo: 'por_pedido',
  },
];

export const DADOS_INICIAIS: AppData = {
  insumos: [...NOVOS_INSUMOS_REAIS, ...INSUMOS_HISTORICOS_ANTIGOS],
  produto: {
    nome: 'Foto Ímã Polaróide (7x7 cm)',
    itens: ITENS_RECEITA_PADRAO,
    taxaPlataformaPercent: 14, // Exemplo Shopee / Loja Online 14%
    taxaPagamentoPercent: 1.99, // Cartão / Pix gateway
    custoEntregaPorUnidade: 0,
    precoVenda: 18.00, // Preço praticado para 1 pedido / unidade de referência
    margemDesejada: 40,
    margemMinima: 20,
    faixasDesconto: FAIXAS_DESCONTO_PADRAO,
    fotosPorFolha: 8,
    imasPorEmbalagem: 2,
    qtdMinimaCaixaAutomatica: 5,
    sacolaSempre: true,
  },
  simulador: {
    quantidadeVenda: 10, // Quantidade simulada padrão
    ehPresente: false,
  },
  ultimaAtualizacao: new Date().toISOString(),
};

/**
 * Atualiza ou insere insumos com os valores reais solicitados,
 * garantindo que nenhum insumo cadastrado anteriormente seja apagado.
 */
function mesclarInsumosReais(existentes: Insumo[]): Insumo[] {
  const lista = [...existentes];

  // Mapeia nomes existentes normalizados para atualização em vez de duplicação
  for (const novo of NOVOS_INSUMOS_REAIS) {
    const nomeNovoNorm = novo.nome.toLowerCase().trim();
    const indexExistente = lista.findIndex(
      (item) => item.nome.toLowerCase().trim() === nomeNovoNorm || item.id === novo.id
    );

    if (indexExistente >= 0) {
      lista[indexExistente] = {
        ...lista[indexExistente],
        preco: novo.preco,
        quantidade: novo.quantidade,
        loja: novo.loja,
        unidadeMedida: novo.unidadeMedida,
        ativoNaReceita: true,
        pertenceAoKitBase: false,
      };
    } else {
      lista.unshift(novo);
    }
  }

  // Marca os insumos antigos (manta, vinil, saquinho, papel glossy antigo) como histórico
  return lista.map((ins) => {
    const n = ins.nome.toLowerCase();
    const ehAntigo =
      n.includes('manta') ||
      n.includes('vinil') ||
      n.includes('bopp') ||
      n.includes('saquinho') ||
      (n.includes('papel') && n.includes('glossy') && (ins.loja === 'Shopee' || ins.loja === 'Temu'));

    if (ehAntigo) {
      return {
        ...ins,
        ativoNaReceita: false,
        pertenceAoKitBase: false,
      };
    }
    return ins;
  });
}

export function carregarDados(): AppData {
  try {
    // Tenta primeiro a nova chave de armazenamento v3
    let raw = localStorage.getItem(STORAGE_KEY);
    // Se não existir, tenta migrar da chave v2 anterior
    if (!raw) {
      raw = localStorage.getItem('foto_imas_dados_v2');
    }

    if (!raw) {
      salvarDados(DADOS_INICIAIS);
      return DADOS_INICIAIS;
    }

    const parsed: AppData = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.insumos)) {
      salvarDados(DADOS_INICIAIS);
      return DADOS_INICIAIS;
    }

    // Mescla os novos insumos reais preservando todos os itens anteriores
    const insumosAtualizados = mesclarInsumosReais(parsed.insumos);

    // Constrói ou migra a receita para a nova divisão (Por Unidade e Por Pedido)
    let itensAtualizados = parsed.produto?.itens;
    const temKitImaNaReceita = itensAtualizados?.some((it) => {
      const ins = insumosAtualizados.find((i) => i.id === it.insumoId);
      return ins && ins.nome.toLowerCase() === 'kit ímã';
    });

    if (!itensAtualizados || !temKitImaNaReceita || itensAtualizados.length < 3) {
      // Aplica a receita padrão com os 6 insumos reais
      itensAtualizados = ITENS_RECEITA_PADRAO;
    } else {
      // Garante que cada item tenha tipoCobranca definido
      itensAtualizados = itensAtualizados.map((it) => {
        const ins = insumosAtualizados.find((i) => i.id === it.insumoId);
        if (!ins) return it;
        const n = ins.nome.toLowerCase();
        if (n.includes('seda') || n.includes('sacola') || n.includes('caixa')) {
          return { ...it, tipoCobranca: it.tipoCobranca || 'pedido' };
        }
        return { ...it, tipoCobranca: it.tipoCobranca || 'unidade' };
      });
    }

    const fotosPorFolha = parsed.produto?.fotosPorFolha || 8;

    const dadosProntos: AppData = {
      insumos: insumosAtualizados,
      produto: {
        nome: parsed.produto?.nome || 'Foto Ímã Polaróide (7x7 cm)',
        itens: itensAtualizados,
        taxaPlataformaPercent: parsed.produto?.taxaPlataformaPercent ?? 14,
        taxaPagamentoPercent: parsed.produto?.taxaPagamentoPercent ?? 1.99,
        custoEntregaPorUnidade: parsed.produto?.custoEntregaPorUnidade ?? 0,
        precoVenda: parsed.produto?.precoVenda || 18.00,
        margemDesejada: parsed.produto?.margemDesejada || 40,
        margemMinima: parsed.produto?.margemMinima ?? 20,
        faixasDesconto:
          Array.isArray(parsed.produto?.faixasDesconto) && parsed.produto.faixasDesconto.length > 0
            ? parsed.produto.faixasDesconto
            : FAIXAS_DESCONTO_PADRAO,
        fotosPorFolha,
        imasPorEmbalagem: parsed.produto?.imasPorEmbalagem ?? 2,
        imasPorCaixa: parsed.produto?.imasPorCaixa,
        qtdMinimaCaixaAutomatica: parsed.produto?.qtdMinimaCaixaAutomatica ?? 5,
        sacolaSempre: parsed.produto?.sacolaSempre ?? true,
      },
      simulador: {
        quantidadeVenda: parsed.simulador?.quantidadeVenda || 10,
        ehPresente: parsed.simulador?.ehPresente ?? false,
      },
      ultimaAtualizacao: new Date().toISOString(),
    };

    salvarDados(dadosProntos);
    return dadosProntos;
  } catch (error) {
    console.error('Erro ao ler localStorage, utilizando dados padrão:', error);
    salvarDados(DADOS_INICIAIS);
    return DADOS_INICIAIS;
  }
}

export function salvarDados(dados: AppData): void {
  try {
    const comTimestamp: AppData = {
      ...dados,
      ultimaAtualizacao: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comTimestamp));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}

// Download de backup JSON
export function exportarBackupJSON(dados: AppData): void {
  const agora = new Date();
  const dataFormatada = agora.toISOString().slice(0, 10);
  const jsonStr = JSON.stringify(dados, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `foto-imas-backup-${dataFormatada}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Leitura de arquivo de backup JSON
export function importarBackupJSON(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conteudo = e.target?.result as string;
        const parsed = JSON.parse(conteudo);
        if (!parsed || !Array.isArray(parsed.insumos) || !parsed.produto) {
          throw new Error('Arquivo de backup inválido.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo selecionado.'));
    reader.readAsText(file);
  });
}
