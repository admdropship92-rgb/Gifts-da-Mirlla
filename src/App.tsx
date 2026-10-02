/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AppData, Insumo, ProdutoConfig, SimuladorConfig } from './types';
import { carregarDados, salvarDados } from './utils/storage';
import { calcularResumoFinanceiro } from './utils/calculations';
import { PainelTab } from './components/PainelTab';
import { InsumosTab } from './components/InsumosTab';
import { ProdutoTab } from './components/ProdutoTab';
import { LucroTab } from './components/LucroTab';
import { BackupModal } from './components/BackupModal';
import { LOGO_BASE64 } from './assets/logo';
import {
  LayoutDashboard,
  Package,
  Layers,
  TrendingUp,
  DownloadCloud,
  CheckCircle,
} from 'lucide-react';

type AbaAtiva = 'painel' | 'insumos' | 'produto' | 'lucro';

export default function App() {
  const [dados, setDados] = useState<AppData>(() => carregarDados());
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('painel');
  const [modalBackupAberto, setModalBackupAberto] = useState(false);
  const [salvoRecentemente, setSalvoRecentemente] = useState(false);

  // Auto-salva no localStorage sempre que dados forem alterados
  useEffect(() => {
    salvarDados(dados);
    setSalvoRecentemente(true);
    const timer = setTimeout(() => setSalvoRecentemente(false), 2000);
    return () => clearTimeout(timer);
  }, [dados]);

  // Cálculo financeiro consolidado em tempo real
  const resumo = useMemo(() => {
    return calcularResumoFinanceiro(
      dados.insumos,
      dados.produto,
      Boolean(dados.simulador.ehPresente)
    );
  }, [dados.insumos, dados.produto, dados.simulador.ehPresente]);

  // Manipuladores de Insumos
  const handleAdicionarInsumo = (novoInsumo: Omit<Insumo, 'id'>) => {
    const id = `insumo-${Date.now()}`;
    const criado: Insumo = { ...novoInsumo, id };
    setDados((prev) => ({
      ...prev,
      insumos: [criado, ...prev.insumos],
    }));
  };

  const handleAtualizarInsumo = (insumoAtualizado: Insumo) => {
    setDados((prev) => ({
      ...prev,
      insumos: prev.insumos.map((item) =>
        item.id === insumoAtualizado.id ? insumoAtualizado : item
      ),
    }));
  };

  const handleExcluirInsumo = (id: string) => {
    setDados((prev) => ({
      ...prev,
      insumos: prev.insumos.filter((item) => item.id !== id),
      produto: {
        ...prev.produto,
        itens: prev.produto.itens.filter((item) => item.insumoId !== id),
      },
    }));
  };

  // Manipuladores de Produto e Simulador
  const handleAtualizarProduto = (novoProduto: ProdutoConfig) => {
    setDados((prev) => ({
      ...prev,
      produto: novoProduto,
    }));
  };

  const handleAtualizarSimulador = (novoSimulador: SimuladorConfig) => {
    setDados((prev) => ({
      ...prev,
      simulador: novoSimulador,
    }));
  };

  const handleRestaurarDados = (novosDados: AppData) => {
    setDados(novosDados);
    salvarDados(novosDados);
  };

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-[#07402A] flex flex-col font-sans pb-24 md:pb-12">
      {/* Top Bar da Marca Gifts da Mirlla: Fundo Verde Escuro #07402A */}
      <header className="sticky top-0 z-30 bg-[#07402A] border-b border-[#0F5C3C] px-4 py-3 sm:px-6 shadow-md text-[#FBF7F1]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo e Títulos da Marca */}
          <div className="flex items-center gap-3">
            <img
              src={LOGO_BASE64}
              alt="Gifts da Mirlla - Fotoímãs Personalizados"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0 border-2 border-[#F59BC1] shadow-sm ring-2 ring-[#0F5C3C]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-brand font-bold text-[#FBF7F1] tracking-tight leading-tight">
                  Painel de Lucro
                </h1>
                {salvoRecentemente && (
                  <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-bold text-[#07402A] bg-[#F59BC1] px-2 py-0.5 rounded-full transition-opacity shadow-xs">
                    <CheckCircle className="h-2.5 w-2.5" /> Salvo
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#F59BC1] tracking-wide">
                Gifts da Mirlla <span className="text-[#FBF7F1]/60 font-normal">· Fotoímãs Personalizados</span>
              </p>
            </div>
          </div>

          {/* Botão de Backup: Secundário (Verde Escuro com borda clara) ou Destaque */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalBackupAberto(true)}
              className="px-3 py-2 bg-[#0F5C3C] hover:bg-[#147a50] active:bg-[#07402A] text-[#FBF7F1] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-[#F59BC1]/40 shadow-xs"
              title="Backup e Restauração de dados"
            >
              <DownloadCloud className="h-4 w-4 text-[#F59BC1]" />
              <span className="hidden sm:inline">Backup & Dados</span>
              <span className="sm:hidden">Backup</span>
            </button>
          </div>
        </div>

        {/* Abas no Desktop: Verde Escuro com Aba Ativa em Rosa #F59BC1 */}
        <div className="max-w-4xl mx-auto hidden md:flex items-center gap-1.5 mt-3 pt-2.5 border-t border-[#0F5C3C]/60">
          {[
            { id: 'painel', rotulo: 'Painel Geral', icone: LayoutDashboard },
            { id: 'insumos', rotulo: 'Insumos (Shopee/Temu)', icone: Package },
            { id: 'produto', rotulo: 'Receita do Foto Ímã', icone: Layers },
            { id: 'lucro', rotulo: 'Lucro & Simulador', icone: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icone;
            const ativo = abaAtiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id as AbaAtiva)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  ativo
                    ? 'bg-[#F59BC1] text-[#07402A] shadow-sm font-extrabold'
                    : 'text-[#FBF7F1]/85 hover:text-[#FBF7F1] hover:bg-[#0F5C3C]/70'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.rotulo}
              </button>
            );
          })}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-1">
        {abaAtiva === 'painel' && (
          <PainelTab
            insumos={dados.insumos}
            produto={dados.produto}
            resumo={resumo}
            onMudarAba={setAbaAtiva}
            onAdicionarInsumo={handleAdicionarInsumo}
          />
        )}

        {abaAtiva === 'insumos' && (
          <InsumosTab
            insumos={dados.insumos}
            onAdicionarInsumo={handleAdicionarInsumo}
            onAtualizarInsumo={handleAtualizarInsumo}
            onExcluirInsumo={handleExcluirInsumo}
          />
        )}

        {abaAtiva === 'produto' && (
          <ProdutoTab
            insumos={dados.insumos}
            produto={dados.produto}
            resumo={resumo}
            onAtualizarProduto={handleAtualizarProduto}
            onMudarAba={setAbaAtiva}
          />
        )}

        {abaAtiva === 'lucro' && (
          <LucroTab
            produto={dados.produto}
            resumo={resumo}
            simulador={dados.simulador}
            onAtualizarProduto={handleAtualizarProduto}
            onAtualizarSimulador={handleAtualizarSimulador}
          />
        )}
      </main>

      {/* Barra de Navegação Inferior Fixa para Celular: Fundo Verde Escuro #07402A, Aba Ativa em Rosa #F59BC1 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07402A] border-t border-[#0F5C3C] shadow-2xl">
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {[
            { id: 'painel', rotulo: 'Painel', icone: LayoutDashboard },
            { id: 'insumos', rotulo: 'Insumos', icone: Package },
            { id: 'produto', rotulo: 'Produto', icone: Layers },
            { id: 'lucro', rotulo: 'Lucro', icone: TrendingUp },
          ].map((item) => {
            const Icon = item.icone;
            const ativo = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setAbaAtiva(item.id as AbaAtiva);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
                  ativo ? 'text-[#F59BC1] font-bold' : 'text-[#FBF7F1]/70 font-medium'
                }`}
              >
                {ativo && (
                  <span className="absolute top-0 w-8 h-1 bg-[#F59BC1] rounded-full shadow-xs" />
                )}
                <Icon className={`h-5 w-5 ${ativo ? 'text-[#F59BC1] scale-110' : 'text-[#FBF7F1]/70'}`} />
                <span className="text-[10px] mt-1 tracking-tight">
                  {item.rotulo}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modal de Backup / Restauração */}
      <BackupModal
        aberto={modalBackupAberto}
        dados={dados}
        onFechar={() => setModalBackupAberto(false)}
        onRestaurarDados={handleRestaurarDados}
      />
    </div>
  );
}
