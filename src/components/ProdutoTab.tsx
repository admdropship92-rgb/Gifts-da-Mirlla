import React, { useState } from 'react';
import { Insumo, ProdutoConfig, ItemFotoIma, RegraConsumo } from '../types';
import {
  ResumoFinanceiro,
  calcularCustoPedido,
  inferirRegraConsumo,
  getDescricaoRegra,
} from '../utils/calculations';
import {
  formatBRL,
  formatBRLPreciso,
  parseNumeroSeguro,
} from '../utils/formatters';
import {
  Layers,
  Package,
  Plus,
  Trash2,
  Info,
  Sparkles,
  ArrowRight,
  Box,
  CheckCircle2,
} from 'lucide-react';

interface ProdutoTabProps {
  insumos: Insumo[];
  produto: ProdutoConfig;
  resumo: ResumoFinanceiro;
  onAtualizarProduto: (novoProduto: ProdutoConfig) => void;
  onMudarAba: (aba: 'painel' | 'insumos' | 'produto' | 'lucro') => void;
}

export const ProdutoTab: React.FC<ProdutoTabProps> = ({
  insumos,
  produto,
  resumo,
  onAtualizarProduto,
  onMudarAba,
}) => {
  const [selecionadoParaAdicionar, setSelecionadoParaAdicionar] = useState<string>('');
  const [regraNova, setRegraNova] = useState<RegraConsumo>('por_unidade');

  const mapaInsumos = new Map<string, Insumo>();
  insumos.forEach((i) => mapaInsumos.set(i.id, i));

  const fotosPorFolha = produto.fotosPorFolha || 8;
  const imasPorEmbalagem = produto.imasPorEmbalagem || 2;
  const imasPorCaixa = produto.imasPorCaixa;
  const qtdMinimaCaixaAutomatica = produto.qtdMinimaCaixaAutomatica ?? 5;
  const sacolaSempre = produto.sacolaSempre !== false;

  // Cálculos de validação esperados conforme solicitação
  const c1SemPresente = calcularCustoPedido(resumo, 1, undefined, false);
  const c1ComPresente = calcularCustoPedido(resumo, 1, undefined, true);
  const c2SemPresente = calcularCustoPedido(resumo, 2, undefined, false);
  const c4 = calcularCustoPedido(resumo, 4, undefined, false);
  const c5 = calcularCustoPedido(resumo, 5, undefined, false);
  const c10 = calcularCustoPedido(resumo, 10, undefined, false);

  // Alterar campo "Fotos por folha"
  const handleAlterarFotosPorFolha = (val: number) => {
    const qtd = Math.max(1, Math.round(val));
    onAtualizarProduto({
      ...produto,
      fotosPorFolha: qtd,
    });
  };

  // Alterar campo "Ímãs por embalagem holográfica"
  const handleAlterarImasPorEmbalagem = (val: number) => {
    const qtd = Math.max(1, Math.round(val));
    onAtualizarProduto({
      ...produto,
      imasPorEmbalagem: qtd,
    });
  };

  // Alterar campo "Quantidade mínima para caixa automática"
  const handleAlterarQtdMinimaCaixa = (val: number) => {
    const qtd = Math.max(1, Math.round(val));
    onAtualizarProduto({
      ...produto,
      qtdMinimaCaixaAutomatica: qtd,
    });
  };

  // Alterar campo "Sacola sempre?"
  const handleAlterarSacolaSempre = (val: boolean) => {
    onAtualizarProduto({
      ...produto,
      sacolaSempre: val,
    });
  };

  // Alterar campo "Ímãs por caixa"
  const handleAlterarImasPorCaixa = (val: string) => {
    const limpo = val.trim();
    if (!limpo || limpo === '0') {
      onAtualizarProduto({
        ...produto,
        imasPorCaixa: undefined,
      });
    } else {
      const num = Math.max(1, parseInt(limpo, 10));
      onAtualizarProduto({
        ...produto,
        imasPorCaixa: isNaN(num) ? undefined : num,
      });
    }
  };

  // Alterar regra de consumo de um item específico
  const handleAlterarRegraItem = (insumoId: string, novaRegra: RegraConsumo) => {
    const novosItens = produto.itens.map((it) =>
      it.insumoId === insumoId ? { ...it, regraConsumo: novaRegra } : it
    );
    onAtualizarProduto({
      ...produto,
      itens: novosItens,
    });
  };

  // Adicionar insumo à receita
  const handleAdicionarItem = () => {
    if (!selecionadoParaAdicionar) return;
    if (produto.itens.some((it) => it.insumoId === selecionadoParaAdicionar)) return;

    const ins = mapaInsumos.get(selecionadoParaAdicionar);
    const regra = regraNova || (ins ? inferirRegraConsumo(ins.nome) : 'por_unidade');

    const novoItem: ItemFotoIma = {
      insumoId: selecionadoParaAdicionar,
      quantidade: 1,
      regraConsumo: regra,
    };

    onAtualizarProduto({
      ...produto,
      itens: [...produto.itens, novoItem],
    });
    setSelecionadoParaAdicionar('');
  };

  // Remover insumo da receita
  const handleRemoverItem = (insumoId: string) => {
    const novosItens = produto.itens.filter((it) => it.insumoId !== insumoId);
    onAtualizarProduto({
      ...produto,
      itens: novosItens,
    });
  };

  // Atualizar taxas
  const handleChangeTaxas = (campo: keyof ProdutoConfig, valor: string) => {
    const num = parseNumeroSeguro(valor);
    onAtualizarProduto({
      ...produto,
      [campo]: num,
    });
  };

  const insumosDisponiveis = insumos.filter(
    (ins) => !produto.itens.some((it) => it.insumoId === ins.id)
  );

  return (
    <div className="space-y-6">
      {/* Card Destaque: Custo Real do Pedido & Valores Esperados para Conferir */}
      <div className="bg-[#07402A] text-[#FBF7F1] rounded-3xl p-5 sm:p-6 shadow-md border border-[#0F5C3C]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F59BC1] bg-white/10 px-2.5 py-0.5 rounded-full">
                Receita Real & Regra da Caixa
              </span>
            </div>
            <div className="mt-2">
              <span className="text-xs text-[#FBF7F1]/75 font-medium block">
                Custo de Insumos Base (1 Foto Ímã):
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono-numbers text-[#FBF7F1] mt-0.5 flex flex-wrap items-baseline gap-2">
                <span>{formatBRLPreciso(c1SemPresente.custoInsumos)}</span>
                <span className="text-xs font-normal text-[#FBF7F1]/80">(sem presente)</span>
                <span className="text-sm font-semibold text-[#F59BC1]">· {formatBRLPreciso(c1ComPresente.custoInsumos)} (presente)</span>
              </div>
            </div>
            <p className="text-xs text-[#FBF7F1]/80 mt-2 max-w-xl">
              Fórmula exata: <code>N × (Kit + Papel) + teto(N ÷ {imasPorEmbalagem}) × Holo + Sacola + (se presente OU N ≥ {qtdMinimaCaixaAutomatica}: Caixas × (Caixa + Seda))</code>
            </p>
          </div>

          {/* Cartão de Conferência Rápida dos Valores Esperados */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs font-mono-numbers space-y-2 shrink-0">
            <span className="text-[11px] font-bold text-[#F59BC1] block uppercase tracking-wider">
              Valores para Conferir:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-black/20 p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/70 block">1 ímã sem pres:</span>
                <strong className="text-white font-black text-xs">{formatBRLPreciso(c1SemPresente.custoInsumos)}</strong>
              </div>
              <div className="bg-black/20 p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/70 block">1 ímã presente:</span>
                <strong className="text-white font-black text-xs">{formatBRLPreciso(c1ComPresente.custoInsumos)}</strong>
              </div>
              <div className="bg-black/20 p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/70 block">2 ímãs sem pres:</span>
                <strong className="text-white font-black text-xs">{formatBRLPreciso(c2SemPresente.custoInsumos)}</strong>
              </div>
              <div className="bg-black/20 p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/70 block">4 ímãs:</span>
                <strong className="text-white font-black text-xs">{formatBRLPreciso(c4.custoInsumos)}</strong>
              </div>
              <div className="bg-black/20 p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/70 block">5 ímãs (auto):</span>
                <strong className="text-[#F59BC1] font-black text-xs">{formatBRLPreciso(c5.custoInsumos)}</strong>
              </div>
              <div className="bg-black/20 p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/70 block">10 ímãs (auto):</span>
                <strong className="text-[#F59BC1] font-black text-xs">{formatBRLPreciso(c10.custoInsumos)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com link para simulador */}
        <div className="mt-4 pt-3.5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#FBF7F1]/80">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#F59BC1] shrink-0" />
            Caixa e Seda entram se: pedido para presente = sim, OU quantidade de ímãs ≥ {qtdMinimaCaixaAutomatica}
          </span>
          <button
            type="button"
            onClick={() => onMudarAba('lucro')}
            className="text-xs font-bold text-[#F59BC1] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Ver Tabela de 1 a 10 ímãs (Sem presente / Presente) <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Parâmetros Globais de Embalagem & Rendimento */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#0F5C3C]/15 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#07402A] flex items-center gap-2">
            <Box className="h-5 w-5 text-[#07402A]" />
            Parâmetros das Regras de Consumo
          </h3>
          <p className="text-xs text-[#07402A]/70 mt-0.5">
            Configure as regras de fotos por folha, embalagem holográfica, caixa automática e sacola
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Fotos por folha */}
          <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Fotos por Folha (Papel Fotográfico)
              </label>
              <p className="text-[11px] text-[#07402A]/70">
                Gasta 1/{fotosPorFolha} folha por ímã (custo R$ {(0.28 / fotosPorFolha).toFixed(3).replace('.', ',')})
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {[4, 6, 8, 9, 12].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleAlterarFotosPorFolha(n)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    fotosPorFolha === n
                      ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                      : 'bg-white border border-[#0F5C3C]/20 text-[#07402A] hover:bg-[#FCE4EE]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Ímãs por Embalagem Holográfica */}
          <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Ímãs por Embalagem Holográfica
              </label>
              <p className="text-[11px] text-[#07402A]/70">
                1 embalagem a cada {imasPorEmbalagem} ímãs: <code>teto(N ÷ {imasPorEmbalagem})</code>
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleAlterarImasPorEmbalagem(n)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    imasPorEmbalagem === n
                      ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                      : 'bg-white border border-[#0F5C3C]/20 text-[#07402A] hover:bg-[#FCE4EE]'
                  }`}
                >
                  {n} {n === 1 ? 'ímã' : 'ímãs'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Quantidade Mínima para Caixa Automática */}
          <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Qtd Mínima para Caixa Automática
              </label>
              <p className="text-[11px] text-[#07402A]/70">
                Pedidos a partir de {qtdMinimaCaixaAutomatica} ímãs ganham caixa e seda mesmo sem presente
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {[3, 4, 5, 6, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleAlterarQtdMinimaCaixa(n)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    qtdMinimaCaixaAutomatica === n
                      ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                      : 'bg-white border border-[#0F5C3C]/20 text-[#07402A] hover:bg-[#FCE4EE]'
                  }`}
                >
                  {n} ímãs
                </button>
              ))}
            </div>
          </div>

          {/* 4. Sacola sempre no pedido? */}
          <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Sacola Sempre no Pedido?
              </label>
              <p className="text-[11px] text-[#07402A]/70">
                Inclui a sacola (R$ 0,42) em todos os pedidos automaticamente
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleAlterarSacolaSempre(true)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  sacolaSempre
                    ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                    : 'bg-white border border-[#0F5C3C]/20 text-[#07402A] hover:bg-[#FCE4EE]'
                }`}
              >
                Sim (Padrão)
              </button>
              <button
                type="button"
                onClick={() => handleAlterarSacolaSempre(false)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !sacolaSempre
                    ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                    : 'bg-white border border-[#0F5C3C]/20 text-[#07402A] hover:bg-[#FCE4EE]'
                }`}
              >
                Não
              </button>
            </div>
          </div>

          {/* 5. Ímãs por Caixa de Embalagem */}
          <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15 flex flex-col justify-between sm:col-span-2 lg:col-span-2">
            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Ímãs por Caixa (Capacidade Máxima Opcional)
              </label>
              <p className="text-[11px] text-[#07402A]/70">
                Padrão em branco = 1 caixa por pedido. Se preenchido: <code>caixas = teto(N ÷ capacidade)</code>
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={imasPorCaixa || ''}
                onChange={(e) => handleAlterarImasPorCaixa(e.target.value)}
                placeholder="Sem limite (1 caixa por pedido)"
                className="w-full px-3 py-1.5 bg-white border border-[#0F5C3C]/30 rounded-xl text-xs font-mono-numbers font-bold text-[#07402A]"
              />
              {imasPorCaixa && (
                <button
                  type="button"
                  onClick={() => handleAlterarImasPorCaixa('')}
                  className="text-[11px] font-bold text-[#07402A] bg-white border border-[#0F5C3C]/20 px-2 py-1.5 rounded-xl hover:bg-[#FCE4EE]"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Adicionar Insumo à Receita */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#0F5C3C]/15 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#07402A] flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#07402A]" />
            Adicionar Outro Insumo à Receita
          </h4>
          <p className="text-xs text-[#07402A]/70">
            Escolha o insumo e defina como ele deve ser cobrado na receita
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selecionadoParaAdicionar}
            onChange={(e) => setSelecionadoParaAdicionar(e.target.value)}
            className="px-3 py-2 bg-[#FBF7F1] border border-[#0F5C3C]/30 rounded-xl text-xs font-semibold text-[#07402A]"
          >
            <option value="">+ Selecionar material...</option>
            {insumosDisponiveis.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.nome} ({ins.loja}) - R$ {(ins.preco / ins.quantidade).toFixed(2)}/{ins.unidadeMedida || 'un'}
              </option>
            ))}
          </select>

          <select
            value={regraNova}
            onChange={(e) => setRegraNova(e.target.value as RegraConsumo)}
            className="px-3 py-2 bg-white border border-[#0F5C3C]/30 rounded-xl text-xs font-semibold text-[#07402A]"
          >
            <option value="por_unidade">1 por foto ímã</option>
            <option value="fotos_por_folha">1/{fotosPorFolha} folha por ímã</option>
            <option value="por_embalagem_agrupada">1 a cada {imasPorEmbalagem} ímãs</option>
            <option value="caixa_embalagem">Caixa de embalagem</option>
            <option value="por_caixa">1 por caixa usada</option>
            <option value="por_pedido">1 por pedido (fixo)</option>
          </select>

          <button
            type="button"
            onClick={handleAdicionarItem}
            disabled={!selecionadoParaAdicionar}
            className="px-4 py-2 bg-[#F59BC1] hover:bg-[#f38ab6] disabled:opacity-40 text-[#07402A] text-xs font-extrabold rounded-xl transition-colors flex items-center gap-1 border border-[#ea75a7]"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </button>
        </div>
      </div>

      {/* Lista com as Regras de Consumo Detalhadas */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#0F5C3C]/15 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#0F5C3C]/10">
          <div>
            <h3 className="text-base font-bold text-[#07402A] flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#07402A]" />
              Detalhamento dos Itens da Receita & "Como Cobrar"
            </h3>
            <p className="text-xs text-[#07402A]/70 mt-0.5">
              Cada material possui sua regra de cálculo individual no pedido de N ímãs
            </p>
          </div>
          <span className="text-xs font-mono-numbers font-bold text-[#07402A] bg-[#FBF7F1] px-3 py-1 rounded-xl border border-[#0F5C3C]/15">
            {produto.itens.length} materiais cadastrados na receita
          </span>
        </div>

        <div className="space-y-3">
          {produto.itens.map((item) => {
            const insumo = mapaInsumos.get(item.insumoId);
            if (!insumo) return null;

            const custoUnitarioInsumo = insumo.preco / insumo.quantidade;
            const regra = inferirRegraConsumo(insumo.nome, item.regraConsumo);
            const descRegra = getDescricaoRegra(
              regra,
              fotosPorFolha,
              imasPorEmbalagem,
              imasPorCaixa
            );

            // Custo de referência para N = 1
            let custoRef1 = custoUnitarioInsumo;
            if (regra === 'fotos_por_folha') custoRef1 = custoUnitarioInsumo * (1 / fotosPorFolha);

            return (
              <div
                key={item.insumoId}
                className="bg-[#FBF7F1] rounded-2xl p-4 border border-[#0F5C3C]/15 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs hover:border-[#0F5C3C]/30 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#07402A] text-[#FBF7F1]">
                      {insumo.loja}
                    </span>
                    <span className="text-[11px] text-[#07402A]/70 font-mono-numbers">
                      Pacote: {formatBRL(insumo.preco)} ({insumo.quantidade} {insumo.unidadeMedida || 'un'}) = {formatBRLPreciso(custoUnitarioInsumo)}/{insumo.unidadeMedida || 'un'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#07402A] leading-snug">
                    {insumo.nome}
                  </h4>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[#07402A]/85 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#0F5C3C] shrink-0" />
                    <span>
                      Regra ativa: <strong className="text-[#07402A]">{descRegra}</strong>
                    </span>
                  </div>
                </div>

                {/* Seletor "Como Cobrar" e Exclusão */}
                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#07402A]/60 uppercase">
                      Como Cobrar:
                    </span>
                    <select
                      value={regra}
                      onChange={(e) =>
                        handleAlterarRegraItem(item.insumoId, e.target.value as RegraConsumo)
                      }
                      className="px-2.5 py-1.5 bg-white border border-[#0F5C3C]/25 rounded-xl text-xs font-bold text-[#07402A]"
                    >
                      <option value="por_unidade">1 por ímã (N × valor)</option>
                      <option value="fotos_por_folha">1/{fotosPorFolha} folha por ímã</option>
                      <option value="por_embalagem_agrupada">1 a cada {imasPorEmbalagem} ímãs (teto)</option>
                      <option value="caixa_embalagem">Caixa de embalagem</option>
                      <option value="por_caixa">1 por caixa usada</option>
                      <option value="por_pedido">1 por pedido (fixo)</option>
                    </select>
                  </div>

                  <div className="text-right font-mono-numbers min-w-[85px]">
                    <span className="text-[10px] text-[#07402A]/60 block uppercase">
                      Para 1 ímã
                    </span>
                    <strong className="text-sm text-[#07402A] font-extrabold">
                      {formatBRLPreciso(custoRef1)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoverItem(item.insumoId)}
                    title="Remover da receita"
                    className="p-1.5 rounded-xl text-[#07402A]/50 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Taxas Opcionais */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#0F5C3C]/15 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#07402A]">
            Taxas de Venda & Pagamento (Opcional)
          </h3>
          <p className="text-xs text-[#07402A]/70 mt-0.5">
            Configure as taxas cobradas pela plataforma ou máquina de cartão
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#07402A] mb-1">
              Taxa da Plataforma (%) (ex: Shopee / Elo7)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={produto.taxaPlataformaPercent}
                onChange={(e) => handleChangeTaxas('taxaPlataformaPercent', e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FBF7F1] border border-[#0F5C3C]/30 rounded-xl text-sm font-mono-numbers font-bold text-[#07402A]"
              />
              <span className="absolute right-3.5 top-2.5 text-sm font-bold text-[#07402A]/50">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#07402A] mb-1">
              Taxa de Pagamento (%) (ex: Maquininha / Cartão / Pix)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={produto.taxaPagamentoPercent}
                onChange={(e) => handleChangeTaxas('taxaPagamentoPercent', e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FBF7F1] border border-[#0F5C3C]/30 rounded-xl text-sm font-mono-numbers font-bold text-[#07402A]"
              />
              <span className="absolute right-3.5 top-2.5 text-sm font-bold text-[#07402A]/50">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
