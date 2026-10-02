import React, { useState } from 'react';
import { ProdutoConfig, SimuladorConfig } from '../types';
import { ResumoFinanceiro, calcularCustoPedido } from '../utils/calculations';
import {
  formatBRL,
  formatBRLPreciso,
  formatPercent,
  parseNumeroSeguro,
} from '../utils/formatters';
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

  // Cálculo da quantidade simulada usando a fórmula solicitada pelo usuário:
  const qtdLote = simulador.quantidadeVenda || 1;
  const ehPresente = Boolean(simulador.ehPresente);
  const simulacaoLote = calcularCustoPedido(resumo, qtdLote, undefined, ehPresente);

  // Faixas para Tabela "Custo por Quantidade" (1 a 10 ímãs conforme solicitado)
  const [modoTabela, setModoTabela] = useState<'1a10' | 'lotes'>('1a10');
  const [colunasTabela, setColunasTabela] = useState<'comparativo' | 'sem_presente' | 'presente'>('comparativo');
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

        {/* 4 Cards de Resultado do Lote */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Faturamento Bruto */}
          <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15">
            <span className="text-[10px] font-bold text-[#07402A]/70 uppercase tracking-wider block">
              Faturamento Bruto
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#07402A] font-mono-numbers block mt-1">
              {formatBRL(simulacaoLote.faturamento)}
            </span>
            <span className="text-[11px] text-[#07402A]/70 font-mono-numbers">
              {qtdLote} un × {formatBRL(produto.precoVenda)}
            </span>
          </div>

          {/* Custo Total do Pedido */}
          <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15">
            <span className="text-[10px] font-bold text-[#07402A]/70 uppercase tracking-wider block">
              Custo Total do Pedido
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#07402A] font-mono-numbers block mt-1">
              {formatBRL(simulacaoLote.custoTotal)}
            </span>
            <span className="text-[11px] text-[#07402A]/70 font-mono-numbers">
              Insumos: {formatBRL(simulacaoLote.custoInsumos)}
            </span>
          </div>

          {/* Custo Médio por Ímã (Destaque da Diluição) */}
          <div className="bg-[#FCE4EE]/70 p-4 rounded-2xl border border-[#F59BC1]/60">
            <span className="text-[10px] font-bold text-[#07402A] uppercase tracking-wider block">
              Custo Médio / Ímã
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#07402A] font-mono-numbers block mt-1">
              {formatBRLPreciso(simulacaoLote.custoMedioPorIma)}
            </span>
            <span className="text-[11px] text-[#07402A]/80 font-medium block">
              {qtdLote === 1
                ? simulacaoLote.levaCaixa
                  ? 'Base presente: R$ 9,27'
                  : 'Base sem presente: R$ 7,03'
                : `Custo médio do pedido de ${qtdLote} ímãs`}
            </span>
          </div>

          {/* Lucro Líquido Total */}
          <div
            className={`p-4 rounded-2xl border ${
              simulacaoLote.estaNoLucro
                ? 'bg-[#EAF5EF] border-[#0F5C3C]/30 text-[#07402A]'
                : 'bg-[#FFF1F2] border-rose-200 text-rose-950'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              Lucro no Bolso
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono-numbers block mt-1">
              {formatBRL(simulacaoLote.lucroTotal)}
            </span>
            <span className="text-[11px] font-bold opacity-90 font-mono-numbers">
              Margem: {formatPercent(simulacaoLote.margemPercent)}
            </span>
          </div>
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
