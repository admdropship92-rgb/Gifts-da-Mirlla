import React, { useState } from 'react';
import { FaixaDesconto, ProdutoConfig, SimuladorConfig } from '../types';
import {
  ResumoFinanceiro,
  calcularCustoPedido,
  precoComDesconto,
  descontoMaximoSeguro,
  obterDescontoParaQuantidade,
} from '../utils/calculations';
import {
  formatBRL,
  formatBRLPreciso,
  formatPercent,
  parseNumeroSeguro,
} from '../utils/formatters';
import { FAIXAS_DESCONTO_PADRAO } from '../utils/storage';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Coins,
  PackageCheck,
  Calculator,
  Percent,
  Gift,
  Plus,
  Trash2,
  Tag,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface LucroTabProps {
  produto: ProdutoConfig;
  resumo: ResumoFinanceiro;
  simulador: SimuladorConfig;
  onAtualizarProduto: (novoProduto: ProdutoConfig) => void;
  onAtualizarSimulador: (novoSimulador: SimuladorConfig) => void;
}

export const LucroTab: React.FC<LucroTabProps> = ({
  produto,
  resumo,
  simulador,
  onAtualizarProduto,
  onAtualizarSimulador,
}) => {
  // Alteração do preço de venda direto
  const handlePrecoVendaChange = (val: string) => {
    const num = parseNumeroSeguro(val);
    onAtualizarProduto({
      ...produto,
      precoVenda: num,
    });
  };

  // Alteração da margem desejada
  const handleMargemDesejadaChange = (val: string) => {
    const num = parseNumeroSeguro(val);
    onAtualizarProduto({
      ...produto,
      margemDesejada: num,
    });
  };

  // Aplicar preço sugerido
  const handleAplicarPrecoSugerido = () => {
    if (resumo.precoSugerido > 0) {
      onAtualizarProduto({
        ...produto,
        precoVenda: Math.round(resumo.precoSugerido * 100) / 100,
      });
    }
  };

  // Simulador de quantidade
  const handleQuantidadeChange = (qtd: number) => {
    const qtdSegura = Math.max(1, Math.round(qtd));
    onAtualizarSimulador({
      ...simulador,
      quantidadeVenda: qtdSegura,
    });
  };

  // Alternar pedido para presente
  const handleTogglePresente = (val: boolean) => {
    onAtualizarSimulador({
      ...simulador,
      ehPresente: val,
    });
  };

  // Faixas e margens de desconto
  const faixasDesconto: FaixaDesconto[] =
    Array.isArray(produto.faixasDesconto) && produto.faixasDesconto.length > 0
      ? produto.faixasDesconto
      : FAIXAS_DESCONTO_PADRAO;
  const margemMinima = produto.margemMinima ?? 20;
  const margemDesejada = produto.margemDesejada ?? 40;

  // Alteração da margem mínima
  const handleMargemMinimaChange = (val: string) => {
    const num = Math.max(0, Math.min(99, parseNumeroSeguro(val)));
    onAtualizarProduto({
      ...produto,
      margemMinima: num,
    });
  };

  // Alteração de uma faixa de desconto
  const handleAlterarFaixa = (
    index: number,
    campo: 'qtdMinima' | 'descontoPercent',
    valor: number
  ) => {
    const novas = faixasDesconto.map((f, i) => {
      if (i !== index) return f;
      return {
        ...f,
        [campo]: Math.max(0, Number(valor) || 0),
      };
    });
    onAtualizarProduto({
      ...produto,
      faixasDesconto: novas,
    });
  };

  // Adicionar nova faixa
  const handleAdicionarFaixa = () => {
    const ultima = faixasDesconto[faixasDesconto.length - 1];
    const proximaQtd = ultima ? ultima.qtdMinima + 10 : 10;
    const proximoDesc = ultima ? Math.min(60, ultima.descontoPercent + 5) : 10;
    const novas = [...faixasDesconto, { qtdMinima: proximaQtd, descontoPercent: proximoDesc }];
    novas.sort((a, b) => a.qtdMinima - b.qtdMinima);
    onAtualizarProduto({
      ...produto,
      faixasDesconto: novas,
    });
  };

  // Remover faixa
  const handleRemoverFaixa = (index: number) => {
    if (faixasDesconto.length <= 1) return;
    const novas = faixasDesconto.filter((_, i) => i !== index);
    onAtualizarProduto({
      ...produto,
      faixasDesconto: novas,
    });
  };

  // Sugerir descontos seguros (múltiplos de 5% arredondados para baixo)
  const handleSugerirDescontosSeguros = () => {
    const novas = faixasDesconto.map((f) => {
      if (f.qtdMinima <= 1) {
        return { ...f, descontoPercent: 0 };
      }
      const descMaxSem = descontoMaximoSeguro(resumo, f.qtdMinima, false, margemMinima);
      const descMaxPres = descontoMaximoSeguro(resumo, f.qtdMinima, true, margemMinima);
      const descMaxSeguro = Math.min(descMaxSem, descMaxPres);
      const sugerido = Math.max(0, Math.floor(descMaxSeguro / 5) * 5);
      return {
        ...f,
        descontoPercent: sugerido,
      };
    });
    onAtualizarProduto({
      ...produto,
      faixasDesconto: novas,
    });
  };

  // Semáforo de margem
  const renderSemaforo = (margem: number) => {
    if (margem >= margemDesejada) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EAF5EF] text-[#07402A] border border-[#0F5C3C]/20">
          <span className="w-2 h-2 rounded-full bg-[#0F5C3C]"></span>
          <span>{formatPercent(margem)}</span>
        </span>
      );
    }
    if (margem >= margemMinima) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>{formatPercent(margem)}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
        <span>Desconto alto demais ({formatPercent(margem)})</span>
      </span>
    );
  };

  // Cálculo da quantidade simulada com desconto automático da faixa:
  const qtdLote = simulador.quantidadeVenda || 1;
  const ehPresente = Boolean(simulador.ehPresente);
  const descontoLotePercent = obterDescontoParaQuantidade(faixasDesconto, qtdLote);
  const precoUnitarioComDesconto = precoComDesconto(produto.precoVenda, descontoLotePercent);

  // Simulação com o desconto aplicado
  const simulacaoLote = calcularCustoPedido(resumo, qtdLote, precoUnitarioComDesconto, ehPresente);

  // Valores comparativos de desconto
  const faturamentoSemDesconto = produto.precoVenda * qtdLote;
  const faturamentoComDesconto = simulacaoLote.faturamento;
  const quantoDeixouDeGanhar = Math.max(0, faturamentoSemDesconto - faturamentoComDesconto);

  // Faixas para Tabela "Custo por Quantidade" (1 a 10 ímãs conforme solicitado)
  const [modoTabela, setModoTabela] = useState<'1a10' | 'lotes'>('1a10');
  const [colunasTabela, setColunasTabela] = useState<'comparativo' | 'sem_presente' | 'presente'>('comparativo');
  const [modoVisualizacaoFaixas, setModoVisualizacaoFaixas] = useState<'comparativo' | 'sem_presente' | 'presente'>('comparativo');
  const faixas1a10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const faixasGrandes = [1, 5, 10, 15, 20, 30, 50, 100];
  const faixasTabela = modoTabela === '1a10' ? faixas1a10 : faixasGrandes;

  return (
    <div className="space-y-6">
      {/* Bloco 1: Preço de Venda e Lucro por 1 Foto Ímã */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#0F5C3C]/15 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-[#07402A] flex items-center gap-2">
            <Coins className="h-5 w-5 text-[#07402A]" />
            Precificação & Margem (Base 1 Foto Ímã)
          </h3>
          <p className="text-xs text-[#07402A]/70 mt-0.5">
            Defina o preço cobrado por ímã e acompanhe seu lucro real
          </p>
        </div>

        {/* Input do Preço de Venda */}
        <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-[#07402A] mb-1">
              Quanto você cobra por 1 Foto Ímã?
            </label>
            <span className="text-xs text-[#07402A]/70">
              Preço de venda final ao seu cliente
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-44">
              <span className="absolute left-3.5 top-2.5 text-base font-bold text-[#07402A]/60">
                R$
              </span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={produto.precoVenda || ''}
                onChange={(e) => handlePrecoVendaChange(e.target.value)}
                placeholder="18,00"
                className="w-full pl-11 pr-3 py-2 bg-white border-2 border-[#F59BC1] rounded-2xl text-xl font-mono-numbers font-black text-[#07402A] focus:ring-4 focus:ring-[#FCE4EE] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Status de Lucro / Prejuízo para 1 Ímã */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            resumo.estaNoLucro
              ? 'bg-[#EAF5EF] border-[#0F5C3C]/30 text-[#07402A]'
              : 'bg-[#FFF1F2] border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`p-2 rounded-xl text-white ${
                resumo.estaNoLucro ? 'bg-[#07402A]' : 'bg-rose-600'
              }`}
            >
              {resumo.estaNoLucro ? (
                <TrendingUp className="h-5 w-5 text-[#F59BC1]" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                {resumo.estaNoLucro ? 'Operação no Lucro' : 'Operação no Prejuízo'}
              </span>
              <p className="text-xs opacity-80 mt-0.5">
                {resumo.estaNoLucro
                  ? `Você ganha ${formatBRLPreciso(resumo.lucroPorUnidade)} limpo por foto ímã avulso`
                  : `Seu custo para 1 ímã (${formatBRLPreciso(resumo.custoTotalPorUnidade)}) é maior que o preço cobrado`}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono-numbers">
            <span className="text-xs opacity-75 block">Margem Líquida (1 un)</span>
            <span className="text-2xl font-black">{formatPercent(resumo.margemPercent)}</span>
          </div>
        </div>

        {/* 3 Métricas de 1 Ímã */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#FBF7F1] p-3.5 rounded-xl border border-[#0F5C3C]/15 font-mono-numbers">
            <span className="text-[11px] text-[#07402A]/70 font-semibold block uppercase">
              Custo dos Insumos (1 un)
            </span>
            <strong className="text-xl text-[#07402A] block mt-0.5">
              {formatBRLPreciso(resumo.custoInsumosTotal)}
            </strong>
            <span className="text-[10px] text-[#07402A]/70 block mt-0.5">
              Sem pres: {formatBRLPreciso(resumo.custoSemPresente)} · Pres: {formatBRLPreciso(resumo.custoComPresente)}
            </span>
          </div>

          <div className="bg-[#FBF7F1] p-3.5 rounded-xl border border-[#0F5C3C]/15 font-mono-numbers">
            <span className="text-[11px] text-[#07402A]/70 font-semibold block uppercase">
              Lucro Líquido (1 un)
            </span>
            <strong
              className={`text-xl block mt-0.5 ${
                resumo.lucroPorUnidade >= 0 ? 'text-[#07402A]' : 'text-rose-600'
              }`}
            >
              {formatBRLPreciso(resumo.lucroPorUnidade)}
            </strong>
            <span className="text-[10px] text-[#07402A]/60">
              Preço menos todos os custos
            </span>
          </div>

          <div className="bg-[#FBF7F1] p-3.5 rounded-xl border border-[#0F5C3C]/15 font-mono-numbers">
            <span className="text-[11px] text-[#07402A]/70 font-semibold block uppercase">
              Preço Sugerido (Margem {produto.margemDesejada}%)
            </span>
            <strong className="text-xl text-[#07402A] block mt-0.5">
              {formatBRL(resumo.precoSugerido)}
            </strong>
            <button
              type="button"
              onClick={handleAplicarPrecoSugerido}
              className="text-[10px] font-bold text-[#0F5C3C] hover:underline block"
            >
              Aplicar este preço
            </button>
          </div>
        </div>
      </div>

      {/* Bloco 2: SIMULADOR DE ENCOMENDAS COM CUSTO DO PEDIDO DILUÍDO */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#0F5C3C]/15 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-[#07402A]" />
            <h3 className="text-base font-bold text-[#07402A]">
              Simulador de Encomendas & Vendas
            </h3>
          </div>
          <p className="text-xs text-[#07402A]/70 mt-0.5">
            Cálculo exato com a regra da Caixa de Embalagem e Papel Seda (presente ou automatico a partir de {resumo.qtdMinimaCaixaAutomatica} ímãs)
          </p>
        </div>

        {/* Toggle Presente & Seletor de Quantidade do Lote */}
        <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15 space-y-3.5">
          {/* Campo Pedido para presente? */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#0F5C3C]/10">
            <div>
              <label className="block text-xs font-bold text-[#07402A] flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-[#F59BC1]" />
                Pedido para presente?
              </label>
              <span className="text-[11px] text-[#07402A]/70">
                Se "Sim", a Caixa de Embalagem e Papel Seda entram no custo mesmo para pedidos com menos de {resumo.qtdMinimaCaixaAutomatica} ímãs
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#0F5C3C]/20 shrink-0">
              <button
                type="button"
                onClick={() => handleTogglePresente(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  !simulador.ehPresente
                    ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                    : 'text-[#07402A] hover:bg-[#FCE4EE]'
                }`}
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => handleTogglePresente(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  simulador.ehPresente
                    ? 'bg-[#F59BC1] text-[#07402A] font-extrabold shadow-2xs'
                    : 'text-[#07402A] hover:bg-[#FCE4EE]'
                }`}
              >
                🎁 Sim (Presente)
              </button>
            </div>
          </div>

          {/* Seletor de Quantidade */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-[#07402A]">
                Quantos foto ímãs o cliente pediu?
              </label>
              <div className="text-[11px] mt-0.5">
                {simulacaoLote.levaCaixa ? (
                  <span className="text-[#0F5C3C] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {simulador.ehPresente
                      ? 'Caixa e Papel Seda inclusos (marcado para presente)'
                      : `Caixa e Papel Seda inclusos automaticamente (${qtdLote} ≥ ${resumo.qtdMinimaCaixaAutomatica} ímãs)`}
                  </span>
                ) : (
                  <span className="text-[#07402A]/70">
                    Sem caixa (saquinho holográfico + sacola). A caixa entra a partir de {resumo.qtdMinimaCaixaAutomatica} ímãs.
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                {[1, 2, 4, 5, 10, 20, 50].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleQuantidadeChange(n)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      simulador.quantidadeVenda === n
                        ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                        : 'bg-white border border-[#0F5C3C]/20 text-[#07402A] hover:bg-[#FCE4EE]'
                    }`}
                  >
                    {n} un
                  </button>
                ))}
              </div>

              <div className="w-20">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={simulador.quantidadeVenda}
                  onChange={(e) => handleQuantidadeChange(parseNumeroSeguro(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#0F5C3C]/30 rounded-xl text-sm font-mono-numbers font-black text-center text-[#07402A] focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Desconto por Quantidade Aplicado na Encomenda */}
        {descontoLotePercent > 0 ? (
          <div className="p-3.5 rounded-2xl bg-[#EAF5EF] border border-[#0F5C3C]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#07402A] text-white shrink-0">
                <Tag className="h-4 w-4 text-[#F59BC1]" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#07402A]">
                    Desconto por Quantidade: <span className="text-[#0F5C3C] font-extrabold">{descontoLotePercent}% OFF aplicado</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#07402A] text-[#FBF7F1] px-2 py-0.5 rounded-full font-mono-numbers">
                    {formatBRLPreciso(precoUnitarioComDesconto)} / ímã
                  </span>
                </div>
                <p className="text-[11px] text-[#07402A]/75 mt-0.5">
                  Faixa de {qtdLote} ímãs · Preço cheio era {formatBRL(produto.precoVenda)}/ímã (economia total de {formatBRL(quantoDeixouDeGanhar)} no pedido)
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#07402A]/70 block">Desconto Concedido</span>
              <span className="text-sm font-mono-numbers font-black text-[#0F5C3C] bg-white px-2.5 py-1 rounded-xl border border-[#0F5C3C]/20 inline-block">
                - {formatBRL(quantoDeixouDeGanhar)}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-[#FBF7F1] border border-[#0F5C3C]/15 flex items-center justify-between gap-2 text-xs text-[#07402A]/75">
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#07402A]/60" />
              Volume avulso sem desconto por quantidade (preço de tabela normal: <strong>{formatBRL(produto.precoVenda)}/ímã</strong>)
            </span>
            <span className="text-[11px] font-bold text-[#07402A] bg-white px-2 py-0.5 rounded-lg border border-[#0F5C3C]/15">
              0% de desconto
            </span>
          </div>
        )}

        {/* 5 Cards de Resultado: Faturamento sem desconto, c/ desconto, quanto deixou de ganhar, custo do pedido e lucro líquido */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Faturamento sem desconto */}
          <div className="bg-[#FBF7F1] p-3.5 rounded-2xl border border-[#0F5C3C]/15 font-mono-numbers">
            <span className="text-[10px] font-bold text-[#07402A]/70 uppercase tracking-wider block font-sans">
              Faturamento sem Desconto
            </span>
            <span className="text-lg sm:text-xl font-black text-[#07402A] block mt-1">
              {formatBRL(faturamentoSemDesconto)}
            </span>
            <span className="text-[11px] text-[#07402A]/70 block font-sans mt-0.5">
              {qtdLote} un × {formatBRL(produto.precoVenda)}
            </span>
          </div>

          {/* 2. Faturamento com desconto */}
          <div className="bg-[#FBF7F1] p-3.5 rounded-2xl border border-[#0F5C3C]/15 font-mono-numbers">
            <span className="text-[10px] font-bold text-[#07402A]/70 uppercase tracking-wider block font-sans">
              Faturamento c/ Desconto
            </span>
            <span className="text-lg sm:text-xl font-black text-[#07402A] block mt-1">
              {formatBRL(faturamentoComDesconto)}
            </span>
            <span className="text-[11px] text-[#0F5C3C] font-semibold block font-sans mt-0.5">
              {descontoLotePercent > 0 ? `${descontoLotePercent}% OFF aplicado` : 'Sem desconto'}
            </span>
          </div>

          {/* 3. Quanto deixou de ganhar */}
          <div className="bg-[#FBF7F1] p-3.5 rounded-2xl border border-[#0F5C3C]/15 font-mono-numbers">
            <span className="text-[10px] font-bold text-[#07402A]/70 uppercase tracking-wider block font-sans">
              Quanto Deixou de Ganhar
            </span>
            <span
              className={`text-lg sm:text-xl font-black block mt-1 ${
                quantoDeixouDeGanhar > 0 ? 'text-[#0F5C3C]' : 'text-[#07402A]'
              }`}
            >
              {formatBRL(quantoDeixouDeGanhar)}
            </span>
            <span className="text-[11px] text-[#07402A]/70 block font-sans mt-0.5">
              {quantoDeixouDeGanhar > 0 ? 'Economia do cliente' : 'Nenhum desconto'}
            </span>
          </div>

          {/* 4. Custo do Pedido */}
          <div className="bg-[#FBF7F1] p-3.5 rounded-2xl border border-[#0F5C3C]/15 font-mono-numbers">
            <span className="text-[10px] font-bold text-[#07402A]/70 uppercase tracking-wider block font-sans">
              Custo Total do Pedido
            </span>
            <span className="text-lg sm:text-xl font-black text-[#07402A] block mt-1">
              {formatBRL(simulacaoLote.custoTotal)}
            </span>
            <span className="text-[11px] text-[#07402A]/70 block font-sans mt-0.5">
              Insumos: {formatBRLPreciso(simulacaoLote.custoInsumos)}
            </span>
          </div>

          {/* 5. Lucro Líquido Final */}
          <div
            className={`p-3.5 rounded-2xl border font-mono-numbers col-span-2 sm:col-span-1 ${
              simulacaoLote.estaNoLucro
                ? 'bg-[#EAF5EF] border-[#0F5C3C]/30 text-[#07402A]'
                : 'bg-[#FFF1F2] border-rose-200 text-rose-950'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block font-sans">
              Lucro Líquido Final
            </span>
            <span className="text-lg sm:text-xl font-black block mt-1">
              {formatBRL(simulacaoLote.lucroTotal)}
            </span>
            <div className="mt-1 font-sans">
              {renderSemaforo(simulacaoLote.margemPercent)}
            </div>
          </div>
        </div>
      </div>

      {/* Bloco Intermediário: DESCONTO POR QUANTIDADE & TRAVA DE MARGEM */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#0F5C3C]/15 shadow-xs space-y-4">
        {/* Cabeçalho do Bloco */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#07402A]" />
              <h3 className="text-base font-bold text-[#07402A]">
                Desconto por Quantidade
              </h3>
              <span className="text-[10px] font-bold bg-[#F59BC1]/30 text-[#07402A] px-2.5 py-0.5 rounded-full border border-[#F59BC1]/60">
                Automático no Simulador
              </span>
            </div>
            <p className="text-xs text-[#07402A]/70 mt-0.5">
              Defina as faixas de desconto progressivo por quantidade com cálculo de margem e trava de segurança.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSugerirDescontosSeguros}
              className="px-3.5 py-2 bg-[#07402A] hover:bg-[#0F5C3C] text-[#FBF7F1] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Preenche cada faixa com o maior desconto que garante a margem mínima"
            >
              <ShieldCheck className="h-4 w-4 text-[#F59BC1]" />
              <span>Sugerir descontos seguros</span>
            </button>

            <button
              type="button"
              onClick={handleAdicionarFaixa}
              className="px-3 py-2 bg-white hover:bg-[#FBF7F1] text-[#07402A] border border-[#0F5C3C]/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#0F5C3C]" />
              <span>Adicionar faixa</span>
            </button>
          </div>
        </div>

        {/* Barra de Configuração da Margem Mínima e Modos de Visualização */}
        <div className="p-4 rounded-2xl bg-[#FBF7F1] border border-[#0F5C3C]/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Campo Margem mínima que aceito (%) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FCE4EE] text-[#07402A] flex items-center justify-center shrink-0 border border-[#F59BC1]/40">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#07402A]">
                Margem mínima que aceito (%)
              </label>
              <span className="text-[11px] text-[#07402A]/70 block">
                Trava de segurança: alertas vermelhos surgem se o desconto fizer a margem cair abaixo disso
              </span>
            </div>
            <div className="relative w-24 shrink-0">
              <input
                type="number"
                min="0"
                max="90"
                step="1"
                value={margemMinima}
                onChange={(e) => handleMargemMinimaChange(e.target.value)}
                className="w-full px-3 py-1.5 pr-7 bg-white border-2 border-[#0F5C3C]/30 rounded-xl text-sm font-mono-numbers font-black text-center text-[#07402A] focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
              />
              <span className="absolute right-2.5 top-2 text-xs font-bold text-[#07402A]/60">
                %
              </span>
            </div>
          </div>

          {/* Seletor de Modo de Exibição */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#0F5C3C]/20 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setModoVisualizacaoFaixas('comparativo')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                modoVisualizacaoFaixas === 'comparativo'
                  ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                  : 'text-[#07402A] hover:bg-[#FCE4EE]'
              }`}
            >
              Comparativo
            </button>
            <button
              type="button"
              onClick={() => setModoVisualizacaoFaixas('sem_presente')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                modoVisualizacaoFaixas === 'sem_presente'
                  ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                  : 'text-[#07402A] hover:bg-[#FCE4EE]'
              }`}
            >
              Sem Presente
            </button>
            <button
              type="button"
              onClick={() => setModoVisualizacaoFaixas('presente')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                modoVisualizacaoFaixas === 'presente'
                  ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                  : 'text-[#07402A] hover:bg-[#FCE4EE]'
              }`}
            >
              🎁 Presente
            </button>
          </div>
        </div>

        {/* Tabela Editável de Faixas de Desconto */}
        <div className="overflow-x-auto">
          {modoVisualizacaoFaixas === 'comparativo' ? (
            <table className="w-full text-left text-xs font-mono-numbers border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#FBF7F1] text-[#07402A] border-b border-[#0F5C3C]/20 text-[11px]">
                  <th rowSpan={2} className="py-2.5 px-3 font-bold border-r border-[#0F5C3C]/15">
                    Faixa (Qtd Mínima)
                  </th>
                  <th rowSpan={2} className="py-2.5 px-2.5 font-bold border-r border-[#0F5C3C]/15">
                    Desconto (%)
                  </th>
                  <th rowSpan={2} className="py-2.5 px-2.5 font-bold border-r border-[#0F5C3C]/15">
                    Preço Unitário
                  </th>
                  <th colSpan={4} className="py-2 px-3 font-bold text-center border-r border-[#0F5C3C]/20 bg-[#FBF7F1]">
                    SEM PRESENTE
                  </th>
                  <th colSpan={4} className="py-2 px-3 font-bold text-center bg-[#FCE4EE]/60 text-[#07402A]">
                    🎁 PRESENTE (Com Caixa & Seda)
                  </th>
                  <th rowSpan={2} className="py-2.5 px-2 font-bold text-center">
                    Ações
                  </th>
                </tr>
                <tr className="bg-[#FBF7F1] text-[#07402A] border-b border-[#0F5C3C]/15 text-[11px]">
                  <th className="py-1.5 px-2 font-bold">Total</th>
                  <th className="py-1.5 px-2 font-bold">Lucro</th>
                  <th className="py-1.5 px-2 font-bold">Margem</th>
                  <th className="py-1.5 px-2 font-bold border-r border-[#0F5C3C]/20">Desc. Seguro</th>

                  <th className="py-1.5 px-2 font-bold bg-[#FCE4EE]/40">Total</th>
                  <th className="py-1.5 px-2 font-bold bg-[#FCE4EE]/40">Lucro</th>
                  <th className="py-1.5 px-2 font-bold bg-[#FCE4EE]/40">Margem</th>
                  <th className="py-1.5 px-2 font-bold bg-[#FCE4EE]/40">Desc. Seguro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F5C3C]/10">
                {faixasDesconto.map((faixa, idx) => {
                  const qtdFaixa = Math.max(1, faixa.qtdMinima);
                  const precoComDesc = precoComDesconto(produto.precoVenda, faixa.descontoPercent);
                  const infoSem = calcularCustoPedido(resumo, qtdFaixa, precoComDesc, false);
                  const infoPres = calcularCustoPedido(resumo, qtdFaixa, precoComDesc, true);
                  const descMaxSem = descontoMaximoSeguro(resumo, qtdFaixa, false, margemMinima);
                  const descMaxPres = descontoMaximoSeguro(resumo, qtdFaixa, true, margemMinima);
                  const temCaixaAuto = qtdFaixa >= (resumo.qtdMinimaCaixaAutomatica ?? 5);

                  return (
                    <tr key={idx} className="hover:bg-[#FBF7F1]/60 transition-colors">
                      {/* Qtd Inicial Editável */}
                      <td className="py-2 px-3 border-r border-[#0F5C3C]/15">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={faixa.qtdMinima}
                            onChange={(e) =>
                              handleAlterarFaixa(idx, 'qtdMinima', parseNumeroSeguro(e.target.value))
                            }
                            className="w-16 px-2 py-1 bg-white border border-[#0F5C3C]/30 rounded-lg text-xs font-bold text-center text-[#07402A] focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
                          />
                          <span className="text-[11px] font-sans font-medium text-[#07402A]/70">
                            {qtdFaixa === 1 ? 'ímã' : 'ímãs'}
                          </span>
                          {temCaixaAuto && (
                            <span className="text-[9px] font-bold bg-[#EAF5EF] text-[#0F5C3C] px-1.5 py-0.5 rounded-md border border-[#0F5C3C]/20" title={`Caixa incluída automaticamente a partir de ${resumo.qtdMinimaCaixaAutomatica} ímãs`}>
                              Caixa auto
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Desconto % Editável */}
                      <td className="py-2 px-2.5 border-r border-[#0F5C3C]/15">
                        <div className="relative w-20">
                          <input
                            type="number"
                            min="0"
                            max="90"
                            step="1"
                            value={faixa.descontoPercent}
                            onChange={(e) =>
                              handleAlterarFaixa(
                                idx,
                                'descontoPercent',
                                parseNumeroSeguro(e.target.value)
                              )
                            }
                            className="w-full pl-2 pr-6 py-1 bg-white border border-[#0F5C3C]/30 rounded-lg text-xs font-bold text-center text-[#07402A] focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] font-bold text-[#07402A]/60">
                            %
                          </span>
                        </div>
                      </td>

                      {/* Preço Unitário com Desconto */}
                      <td className="py-2 px-2.5 font-bold text-[#07402A] border-r border-[#0F5C3C]/15">
                        {formatBRLPreciso(precoComDesc)}
                      </td>

                      {/* Sem Presente: Total, Lucro, Margem (Semáforo), Desc. Seguro */}
                      <td className="py-2 px-2 text-[#07402A]">
                        {formatBRL(infoSem.faturamento)}
                      </td>
                      <td className="py-2 px-2 font-bold text-[#07402A]">
                        {formatBRL(infoSem.lucroTotal)}
                      </td>
                      <td className="py-2 px-2">
                        {renderSemaforo(infoSem.margemPercent)}
                      </td>
                      <td className="py-2 px-2 border-r border-[#0F5C3C]/20">
                        <span className="text-[11px] font-bold text-[#0F5C3C] bg-[#EAF5EF] px-1.5 py-0.5 rounded-md">
                          até {Math.floor(descMaxSem)}%
                        </span>
                      </td>

                      {/* Presente: Total, Lucro, Margem (Semáforo), Desc. Seguro */}
                      <td className="py-2 px-2 text-[#07402A] bg-[#FCE4EE]/20">
                        {formatBRL(infoPres.faturamento)}
                      </td>
                      <td className="py-2 px-2 font-bold text-[#07402A] bg-[#FCE4EE]/20">
                        {formatBRL(infoPres.lucroTotal)}
                      </td>
                      <td className="py-2 px-2 bg-[#FCE4EE]/20">
                        {renderSemaforo(infoPres.margemPercent)}
                      </td>
                      <td className="py-2 px-2 bg-[#FCE4EE]/20">
                        <span className="text-[11px] font-bold text-[#0F5C3C] bg-white px-1.5 py-0.5 rounded-md border border-[#0F5C3C]/20">
                          até {Math.floor(descMaxPres)}%
                        </span>
                      </td>

                      {/* Ação: Remover */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoverFaixa(idx)}
                          disabled={faixasDesconto.length <= 1}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Remover faixa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs font-mono-numbers border-collapse">
              <thead>
                <tr className="bg-[#FBF7F1] text-[#07402A] border-b border-[#0F5C3C]/15 text-[11px]">
                  <th className="py-2.5 px-3 font-bold">Faixa (Qtd Mínima)</th>
                  <th className="py-2.5 px-2.5 font-bold">Desconto (%)</th>
                  <th className="py-2.5 px-2.5 font-bold">Preço Unitário c/ Desc.</th>
                  <th className="py-2.5 px-2.5 font-bold">Total do Pedido</th>
                  <th className="py-2.5 px-2.5 font-bold">Custo Insumos</th>
                  <th className="py-2.5 px-2.5 font-bold">Lucro Líquido</th>
                  <th className="py-2.5 px-2.5 font-bold">Margem de Lucro</th>
                  <th className="py-2.5 px-2.5 font-bold">Desconto Máx Seguro</th>
                  <th className="py-2.5 px-2 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F5C3C]/10">
                {faixasDesconto.map((faixa, idx) => {
                  const ehPres = modoVisualizacaoFaixas === 'presente';
                  const qtdFaixa = Math.max(1, faixa.qtdMinima);
                  const precoComDesc = precoComDesconto(produto.precoVenda, faixa.descontoPercent);
                  const info = calcularCustoPedido(resumo, qtdFaixa, precoComDesc, ehPres);
                  const descMax = descontoMaximoSeguro(resumo, qtdFaixa, ehPres, margemMinima);
                  const temCaixaAuto = qtdFaixa >= (resumo.qtdMinimaCaixaAutomatica ?? 5);

                  return (
                    <tr key={idx} className="hover:bg-[#FBF7F1]/60 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={faixa.qtdMinima}
                            onChange={(e) =>
                              handleAlterarFaixa(idx, 'qtdMinima', parseNumeroSeguro(e.target.value))
                            }
                            className="w-16 px-2 py-1 bg-white border border-[#0F5C3C]/30 rounded-lg text-xs font-bold text-center text-[#07402A] focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
                          />
                          <span className="text-[11px] font-sans font-medium text-[#07402A]/70">
                            {qtdFaixa === 1 ? 'ímã' : 'ímãs'}
                          </span>
                          {temCaixaAuto && (
                            <span className="text-[9px] font-bold bg-[#EAF5EF] text-[#0F5C3C] px-1.5 py-0.5 rounded-md border border-[#0F5C3C]/20">
                              Caixa auto
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2 px-2.5">
                        <div className="relative w-20">
                          <input
                            type="number"
                            min="0"
                            max="90"
                            step="1"
                            value={faixa.descontoPercent}
                            onChange={(e) =>
                              handleAlterarFaixa(
                                idx,
                                'descontoPercent',
                                parseNumeroSeguro(e.target.value)
                              )
                            }
                            className="w-full pl-2 pr-6 py-1 bg-white border border-[#0F5C3C]/30 rounded-lg text-xs font-bold text-center text-[#07402A] focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] font-bold text-[#07402A]/60">
                            %
                          </span>
                        </div>
                      </td>

                      <td className="py-2 px-2.5 font-bold text-[#07402A]">
                        {formatBRLPreciso(precoComDesc)}
                      </td>

                      <td className="py-2 px-2.5 text-[#07402A]">
                        {formatBRL(info.faturamento)}
                      </td>

                      <td className="py-2 px-2.5 text-[#07402A]">
                        {formatBRLPreciso(info.custoInsumos)}
                      </td>

                      <td className="py-2 px-2.5 font-bold text-[#07402A]">
                        {formatBRL(info.lucroTotal)}
                      </td>

                      <td className="py-2 px-2.5">
                        {renderSemaforo(info.margemPercent)}
                      </td>

                      <td className="py-2 px-2.5">
                        <span className="text-[11px] font-bold text-[#0F5C3C] bg-[#EAF5EF] px-2 py-0.5 rounded-md">
                          até {Math.floor(descMax)}%
                        </span>
                      </td>

                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoverFaixa(idx)}
                          disabled={faixasDesconto.length <= 1}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Remover faixa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Rodapé informativo de regras de desconto */}
        <div className="p-3 bg-[#FBF7F1] rounded-2xl border border-[#0F5C3C]/10 text-[11px] text-[#07402A]/75 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            💡 <strong>Padrão recomendado:</strong> 1 un → 0% · 5 un → 10% · 10 un → 15% · 25 un → 20%. A caixa é incluída automaticamente a partir de {resumo.qtdMinimaCaixaAutomatica} ímãs.
          </span>
          <span className="text-[10px] text-[#0F5C3C] font-semibold shrink-0">
            Salvo automaticamente no seu dispositivo
          </span>
        </div>
      </div>

      {/* Bloco 3: TABELA DE CUSTO POR QUANTIDADE & MARGEM REAL */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#0F5C3C]/15 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#07402A]" />
              <h3 className="text-base font-bold text-[#07402A]">
                Tabela "Custo por quantidade" (1 a 10 ímãs)
              </h3>
            </div>
            <p className="text-xs text-[#07402A]/70 mt-0.5">
              Demonstrativo comparativo de <strong>Sem presente</strong> e <strong>Presente</strong>: custo do pedido, custo por ímã, preço de venda, lucro e margem
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Seletor de Colunas */}
            <div className="flex items-center gap-1 bg-[#FBF7F1] p-1 rounded-xl border border-[#0F5C3C]/15">
              <button
                type="button"
                onClick={() => setColunasTabela('comparativo')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  colunasTabela === 'comparativo'
                    ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                    : 'text-[#07402A] hover:bg-[#FCE4EE]'
                }`}
              >
                Comparativo
              </button>
              <button
                type="button"
                onClick={() => setColunasTabela('sem_presente')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  colunasTabela === 'sem_presente'
                    ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                    : 'text-[#07402A] hover:bg-[#FCE4EE]'
                }`}
              >
                Sem Presente
              </button>
              <button
                type="button"
                onClick={() => setColunasTabela('presente')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  colunasTabela === 'presente'
                    ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                    : 'text-[#07402A] hover:bg-[#FCE4EE]'
                }`}
              >
                Presente
              </button>
            </div>

            {/* Seletor de Faixas */}
            <div className="flex items-center gap-1 bg-[#FBF7F1] p-1 rounded-xl border border-[#0F5C3C]/15">
              <button
                type="button"
                onClick={() => setModoTabela('1a10')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  modoTabela === '1a10'
                    ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                    : 'text-[#07402A] hover:bg-[#FCE4EE]'
                }`}
              >
                1 a 10
              </button>
              <button
                type="button"
                onClick={() => setModoTabela('lotes')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  modoTabela === 'lotes'
                    ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                    : 'text-[#07402A] hover:bg-[#FCE4EE]'
                }`}
              >
                Até 100
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {colunasTabela === 'comparativo' ? (
            <table className="w-full text-left text-xs font-mono-numbers border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FBF7F1] text-[#07402A] border-b border-[#0F5C3C]/20">
                  <th rowSpan={2} className="py-2.5 px-3 font-bold border-r border-[#0F5C3C]/15">
                    Quantidade
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 font-bold border-r border-[#0F5C3C]/15">
                    Preço Venda
                  </th>
                  <th colSpan={4} className="py-2 px-3 font-bold text-center border-r border-[#0F5C3C]/20 bg-[#FBF7F1]">
                    SEM PRESENTE {`(Caixa a partir de ${resumo.qtdMinimaCaixaAutomatica} un)`}
                  </th>
                  <th colSpan={4} className="py-2 px-3 font-bold text-center bg-[#FCE4EE]/60 text-[#07402A]">
                    🎁 PRESENTE (Sempre com Caixa & Seda)
                  </th>
                </tr>
                <tr className="bg-[#FBF7F1] text-[#07402A] border-b border-[#0F5C3C]/15 text-[11px]">
                  {/* Subcolunas Sem Presente */}
                  <th className="py-1.5 px-2.5 font-bold">Custo Pedido</th>
                  <th className="py-1.5 px-2.5 font-bold">Custo/Ímã</th>
                  <th className="py-1.5 px-2.5 font-bold">Lucro</th>
                  <th className="py-1.5 px-2.5 font-bold border-r border-[#0F5C3C]/20">Margem</th>

                  {/* Subcolunas Presente */}
                  <th className="py-1.5 px-2.5 font-bold bg-[#FCE4EE]/40">Custo Pedido</th>
                  <th className="py-1.5 px-2.5 font-bold bg-[#FCE4EE]/40">Custo/Ímã</th>
                  <th className="py-1.5 px-2.5 font-bold bg-[#FCE4EE]/40">Lucro</th>
                  <th className="py-1.5 px-2.5 font-bold bg-[#FCE4EE]/40">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F5C3C]/10">
                {faixasTabela.map((qtd) => {
                  const infoSem = calcularCustoPedido(resumo, qtd, undefined, false);
                  const infoPres = calcularCustoPedido(resumo, qtd, undefined, true);
                  const ehSelecionado = simulador.quantidadeVenda === qtd;
                  const ehLinhaTransmissao = qtd === resumo.qtdMinimaCaixaAutomatica;

                  return (
                    <React.Fragment key={qtd}>
                      {ehLinhaTransmissao && (
                        <tr className="bg-[#EAF5EF] border-y-2 border-[#0F5C3C]/30">
                          <td colSpan={10} className="py-2 px-3 text-center text-xs font-bold text-[#07402A]">
                            <div className="flex items-center justify-center gap-1.5 font-sans">
                              <Sparkles className="h-4 w-4 text-[#F59BC1] shrink-0" />
                              <span>
                                <strong>Linha de Entrada Automática:</strong> A partir de {resumo.qtdMinimaCaixaAutomatica} ímãs, a Caixa de Embalagem e o Papel Seda entram automaticamente em todos os pedidos!
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}

                      <tr
                        onClick={() => handleQuantidadeChange(qtd)}
                        className={`cursor-pointer transition-colors ${
                          ehSelecionado
                            ? 'bg-[#FCE4EE]/50 font-bold'
                            : 'hover:bg-[#FBF7F1]'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-sans font-bold text-[#07402A] border-r border-[#0F5C3C]/15">
                          <div className="flex items-center gap-1.5">
                            {ehSelecionado && <span className="w-1.5 h-1.5 rounded-full bg-[#07402A]"></span>}
                            <span>{qtd} {qtd === 1 ? 'ímã' : 'ímãs'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#07402A] border-r border-[#0F5C3C]/15">
                          {formatBRL(infoSem.faturamento)}
                        </td>

                        {/* Colunas Sem Presente */}
                        <td className="py-2.5 px-2.5 text-[#07402A] font-extrabold">
                          {formatBRLPreciso(infoSem.custoInsumos)}
                          {infoSem.levaCaixa && qtd < resumo.qtdMinimaCaixaAutomatica && (
                            <span className="text-[10px] font-normal text-[#0F5C3C] ml-1">(caixa)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="font-extrabold text-[#07402A] bg-[#07402A]/5 px-1.5 py-0.5 rounded-md">
                            {formatBRLPreciso(infoSem.custoMedioPorIma)}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-[#07402A]">
                          {formatBRL(infoSem.lucroTotal)}
                        </td>
                        <td className="py-2.5 px-2.5 border-r border-[#0F5C3C]/20">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                              infoSem.margemPercent >= 35
                                ? 'bg-[#EAF5EF] text-[#07402A]'
                                : infoSem.margemPercent > 0
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {formatPercent(infoSem.margemPercent)}
                          </span>
                        </td>

                        {/* Colunas Presente */}
                        <td className="py-2.5 px-2.5 text-[#07402A] font-extrabold bg-[#FCE4EE]/20">
                          {formatBRLPreciso(infoPres.custoInsumos)}
                        </td>
                        <td className="py-2.5 px-2.5 bg-[#FCE4EE]/20">
                          <span className="font-extrabold text-[#07402A] bg-[#F59BC1]/25 px-1.5 py-0.5 rounded-md">
                            {formatBRLPreciso(infoPres.custoMedioPorIma)}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-[#07402A] bg-[#FCE4EE]/20">
                          {formatBRL(infoPres.lucroTotal)}
                        </td>
                        <td className="py-2.5 px-2.5 bg-[#FCE4EE]/20">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                              infoPres.margemPercent >= 35
                                ? 'bg-[#EAF5EF] text-[#07402A]'
                                : infoPres.margemPercent > 0
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {formatPercent(infoPres.margemPercent)}
                          </span>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs font-mono-numbers border-collapse">
              <thead>
                <tr className="bg-[#FBF7F1] text-[#07402A] border-b border-[#0F5C3C]/15">
                  <th className="py-2.5 px-3 font-bold">Quantidade</th>
                  <th className="py-2.5 px-3 font-bold">Custo do Pedido</th>
                  <th className="py-2.5 px-3 font-bold">Custo por Ímã</th>
                  <th className="py-2.5 px-3 font-bold">Preço de Venda</th>
                  <th className="py-2.5 px-3 font-bold">Lucro</th>
                  <th className="py-2.5 px-3 font-bold">Margem</th>
                  <th className="py-2.5 px-3 font-bold">Leva Caixa?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F5C3C]/10">
                {faixasTabela.map((qtd) => {
                  const ehPres = colunasTabela === 'presente';
                  const info = calcularCustoPedido(resumo, qtd, undefined, ehPres);
                  const ehSelecionado = simulador.quantidadeVenda === qtd;
                  const ehLinhaTransmissao = qtd === resumo.qtdMinimaCaixaAutomatica;

                  return (
                    <React.Fragment key={qtd}>
                      {ehLinhaTransmissao && (
                        <tr className="bg-[#EAF5EF] border-y-2 border-[#0F5C3C]/30">
                          <td colSpan={7} className="py-2 px-3 text-center text-xs font-bold text-[#07402A]">
                            🎁 A partir de {resumo.qtdMinimaCaixaAutomatica} ímãs, Caixa e Papel Seda entram automaticamente em todos os pedidos!
                          </td>
                        </tr>
                      )}

                      <tr
                        onClick={() => handleQuantidadeChange(qtd)}
                        className={`cursor-pointer transition-colors ${
                          ehSelecionado
                            ? 'bg-[#FCE4EE]/50 font-bold'
                            : 'hover:bg-[#FBF7F1]'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-sans font-bold text-[#07402A] flex items-center gap-1.5">
                          {ehSelecionado && <span className="w-1.5 h-1.5 rounded-full bg-[#07402A]"></span>}
                          {qtd} {qtd === 1 ? 'ímã' : 'ímãs'}
                        </td>
                        <td className="py-2.5 px-3 text-[#07402A] font-extrabold">
                          {formatBRLPreciso(info.custoInsumos)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-extrabold text-[#07402A] bg-[#07402A]/5 px-2 py-0.5 rounded-md">
                            {formatBRLPreciso(info.custoMedioPorIma)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#07402A]">
                          {formatBRL(info.faturamento)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#07402A]">
                          {formatBRL(info.lucroTotal)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              info.margemPercent >= 35
                                ? 'bg-[#EAF5EF] text-[#07402A]'
                                : info.margemPercent > 0
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {formatPercent(info.margemPercent)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {info.levaCaixa ? (
                            <span className="text-[11px] font-bold text-[#0F5C3C] bg-[#EAF5EF] px-2 py-0.5 rounded-md">
                              Sim ({info.qtdCaixas} cx)
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-[#07402A]/60">
                              Não
                            </span>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
