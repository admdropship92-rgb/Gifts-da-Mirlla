import React from 'react';
import { Insumo, ProdutoConfig } from '../types';
import { ResumoFinanceiro } from '../utils/calculations';
import { formatBRL, formatBRLPreciso, formatPercent } from '../utils/formatters';
import { DonutChart } from './DonutChart';
import { ShopeeTemuComparison } from './ShopeeTemuComparison';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PainelTabProps {
  insumos: Insumo[];
  produto: ProdutoConfig;
  resumo: ResumoFinanceiro;
  onMudarAba: (aba: 'painel' | 'insumos' | 'produto' | 'lucro') => void;
  onAdicionarInsumo?: (novo: Omit<Insumo, 'id'>) => void;
}

export const PainelTab: React.FC<PainelTabProps> = ({
  insumos,
  produto,
  resumo,
  onMudarAba,
  onAdicionarInsumo,
}) => {
  return (
    <div className="space-y-6">
      {/* 4 Cards Grandes em Destaque com Paleta Gifts da Mirlla */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Custo por Unidade */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#0F5C3C]/15 shadow-xs flex flex-col justify-between hover:border-[#0F5C3C]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#07402A]/70 uppercase tracking-wider">
              Custo / Unidade
            </span>
            <span className="p-1.5 rounded-xl bg-[#FBF7F1] text-[#07402A] border border-[#0F5C3C]/15">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#07402A] font-mono-numbers">
              {formatBRLPreciso(resumo.custoInsumosTotal)}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#07402A]/70 mt-1 font-mono-numbers truncate">
              <span>Sem pres: {formatBRLPreciso(resumo.custoSemPresente)}</span>
              <span>· Pres: {formatBRLPreciso(resumo.custoComPresente)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Preço de Venda */}
        <div className="bg-[#FCE4EE]/70 rounded-2xl p-4 sm:p-5 border border-[#F59BC1]/50 shadow-xs flex flex-col justify-between hover:border-[#F59BC1] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#07402A] uppercase tracking-wider">
              Preço de Venda
            </span>
            <span className="p-1.5 rounded-xl bg-white text-[#07402A] border border-[#F59BC1]/40">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#07402A] font-mono-numbers">
              {formatBRL(resumo.precoVenda)}
            </span>
            <button
              onClick={() => onMudarAba('lucro')}
              className="text-[11px] font-bold text-[#07402A] hover:text-[#0F5C3C] flex items-center gap-1 mt-1 transition-colors underline decoration-[#F59BC1] decoration-2"
            >
              Ajustar preço <ArrowRight className="h-3 w-3 text-[#F59BC1]" />
            </button>
          </div>
        </div>

        {/* Card 3: Lucro por Unidade */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between transition-colors ${
            resumo.estaNoLucro
              ? 'bg-[#EAF5EF] border-[#0F5C3C]/30 text-[#07402A]'
              : 'bg-[#FFF1F2] border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                resumo.estaNoLucro ? 'text-[#07402A]' : 'text-rose-800'
              }`}
            >
              Lucro Líquido
            </span>
            <span
              className={`p-1.5 rounded-xl ${
                resumo.estaNoLucro
                  ? 'bg-[#07402A] text-[#FBF7F1]'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {resumo.estaNoLucro ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </span>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono-numbers ${
                resumo.estaNoLucro ? 'text-[#07402A]' : 'text-rose-700'
              }`}
            >
              {formatBRLPreciso(resumo.lucroPorUnidade)}
            </span>
            <p
              className={`text-[11px] font-semibold mt-1 ${
                resumo.estaNoLucro ? 'text-[#0F5C3C]' : 'text-rose-700'
              }`}
            >
              {resumo.estaNoLucro ? 'Livre por foto ímã' : 'Prejuízo por peça'}
            </p>
          </div>
        </div>

        {/* Card 4: Margem de Lucro */}
        <div
          className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between ${
            resumo.estaNoLucro
              ? 'bg-white border-[#0F5C3C]/15'
              : 'bg-[#FFF1F2] border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#07402A]/70 uppercase tracking-wider">
              Margem Real
            </span>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                resumo.estaNoLucro
                  ? 'bg-[#F59BC1] text-[#07402A]'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {resumo.estaNoLucro ? 'NO LUCRO' : 'NO PREJUÍZO'}
            </span>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono-numbers ${
                resumo.estaNoLucro ? 'text-[#07402A]' : 'text-rose-700'
              }`}
            >
              {formatPercent(resumo.margemPercent)}
            </span>
            <p className="text-[11px] text-[#07402A]/70 mt-1 font-mono-numbers">
              Markup: {formatPercent(resumo.markupPercent)}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de Rosca de Custos com Tons de Verde e Rosa */}
      <DonutChart
        detalhes={resumo.detalheParaGrafico || resumo.detalheInsumos}
        custoTotal={resumo.custoInsumosTotal}
      />

      {/* Comparação Shopee vs Temu */}
      <ShopeeTemuComparison
        insumos={insumos}
        onAdicionarInsumo={onAdicionarInsumo}
      />

      {/* Atalhos Rápidos e Simulador: Botão Principal Rosa #F59BC1 com texto verde escuro */}
      <div className="bg-[#FCE4EE]/70 rounded-2xl p-4 sm:p-5 border border-[#F59BC1]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 text-[#07402A]">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white border border-[#F59BC1]/50 text-base shadow-2xs shrink-0">
            🌸
          </span>
          <div>
            <p className="font-bold text-sm text-[#07402A]">
              Quer simular uma encomenda de lembrancinhas?
            </p>
            <p className="text-[#07402A]/75 mt-0.5">
              Calcule pedidos de 20, 50 ou 100 foto ímãs e veja o lucro total líquido em dinheiro.
            </p>
          </div>
        </div>

        {/* Botão Principal: Rosa #F59BC1 com texto Verde Escuro #07402A */}
        <button
          onClick={() => onMudarAba('lucro')}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#F59BC1] hover:bg-[#f38ab6] active:bg-[#ea75a7] text-[#07402A] font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 border border-[#ea75a7]"
        >
          <Sparkles className="h-4 w-4 text-[#07402A]" />
          Simular Encomenda <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
