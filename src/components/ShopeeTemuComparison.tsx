import React, { useState } from 'react';
import { Insumo } from '../types';
import {
  calcularCustoUnitarioInsumo,
  formatBRL,
  formatBRLPreciso,
  formatPercent,
  parseNumeroSeguro,
} from '../utils/formatters';
import { CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';

interface ShopeeTemuComparisonProps {
  insumos: Insumo[];
  onAdicionarInsumo?: (novo: Omit<Insumo, 'id'>) => void;
}

interface ParComparacao {
  nomeBase: string;
  itemShopee?: Insumo;
  itemTemu?: Insumo;
  custoShopee?: number;
  custoTemu?: number;
  diferencaPercent?: number;
  maisBarato?: 'Shopee' | 'Temu' | 'Empate';
  economiaUnitario?: number;
}

// Normaliza nome do produto para agrupamento inteligente
function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(shopee|temu|pct|pcte|pacote|com|de|para|a4|unidades|un|folhas)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(' ');
}

export const ShopeeTemuComparison: React.FC<ShopeeTemuComparisonProps> = ({
  insumos,
  onAdicionarInsumo,
}) => {
  const [mostrarSimulador, setMostrarSimulador] = useState(false);

  // Estados do Comparador Rápido Avulso
  const [simNome, setSimNome] = useState('Manta Magnética 0.3mm');
  const [shopeePreco, setShopeePreco] = useState('39.90');
  const [shopeeFrete, setShopeeFrete] = useState('0');
  const [shopeeQtd, setShopeeQtd] = useState('20');

  const [temuPreco, setTemuPreco] = useState('44.00');
  const [temuFrete, setTemuFrete] = useState('6.00');
  const [temuQtd, setTemuQtd] = useState('25');

  // Encontra itens cadastrados para comparar Shopee x Temu
  const itensShopee = insumos.filter((i) => i.loja === 'Shopee');
  const itensTemu = insumos.filter((i) => i.loja === 'Temu');

  const pares: ParComparacao[] = [];

  // Mapeia por similaridade de nome
  itensShopee.forEach((s) => {
    const chaveS = normalizarNome(s.nome);
    const parTemu = itensTemu.find((t) => {
      const chaveT = normalizarNome(t.nome);
      return (
        chaveS.includes(chaveT) ||
        chaveT.includes(chaveS) ||
        (chaveS.length > 3 && chaveT.length > 3 && (chaveS.startsWith(chaveT.slice(0, 4)) || chaveT.startsWith(chaveS.slice(0, 4))))
      );
    });

    const custoS = calcularCustoUnitarioInsumo(s.preco, s.frete, s.quantidade);

    if (parTemu) {
      const custoT = calcularCustoUnitarioInsumo(parTemu.preco, parTemu.frete, parTemu.quantidade);
      let maisBarato: 'Shopee' | 'Temu' | 'Empate' = 'Empate';
      let difPercent = 0;
      let economia = 0;

      if (custoS < custoT) {
        maisBarato = 'Shopee';
        difPercent = custoT > 0 ? ((custoT - custoS) / custoT) * 100 : 0;
        economia = custoT - custoS;
      } else if (custoT < custoS) {
        maisBarato = 'Temu';
        difPercent = custoS > 0 ? ((custoS - custoT) / custoS) * 100 : 0;
        economia = custoS - custoT;
      }

      pares.push({
        nomeBase: s.nome,
        itemShopee: s,
        itemTemu: parTemu,
        custoShopee: custoS,
        custoTemu: custoT,
        diferencaPercent: difPercent,
        maisBarato,
        economiaUnitario: economia,
      });
    }
  });

  // Cálculos do simulador rápido
  const simCustoShopee = calcularCustoUnitarioInsumo(
    parseNumeroSeguro(shopeePreco),
    parseNumeroSeguro(shopeeFrete),
    parseNumeroSeguro(shopeeQtd)
  );

  const simCustoTemu = calcularCustoUnitarioInsumo(
    parseNumeroSeguro(temuPreco),
    parseNumeroSeguro(temuFrete),
    parseNumeroSeguro(temuQtd)
  );

  let simVencedor: 'Shopee' | 'Temu' | 'Empate' = 'Empate';
  let simEconomiaPercent = 0;
  let simEconomiaUnit = 0;

  if (simCustoShopee > 0 && simCustoTemu > 0) {
    if (simCustoShopee < simCustoTemu) {
      simVencedor = 'Shopee';
      simEconomiaPercent = ((simCustoTemu - simCustoShopee) / simCustoTemu) * 100;
      simEconomiaUnit = simCustoTemu - simCustoShopee;
    } else if (simCustoTemu < simCustoShopee) {
      simVencedor = 'Temu';
      simEconomiaPercent = ((simCustoShopee - simCustoTemu) / simCustoShopee) * 100;
      simEconomiaUnit = simCustoShopee - simCustoTemu;
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#0F5C3C]/15 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FCE4EE] text-[#07402A]">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-[#07402A]">
              Shopee vs. Temu: Onde compensa mais comprar?
            </h3>
          </div>
          <p className="text-xs text-[#07402A]/70 mt-0.5">
            Comparação real de custo por folha ou unidade com frete embutido
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarSimulador(!mostrarSimulador)}
          className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-xl border border-[#0F5C3C]/30 bg-[#FBF7F1] text-[#07402A] hover:bg-[#FCE4EE] active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#F59BC1]" />
          {mostrarSimulador ? 'Fechar comparador rápido' : 'Comparar duas ofertas agora'}
        </button>
      </div>

      {/* Simulador Rápido Interativo com Identidade Gifts da Mirlla */}
      {mostrarSimulador && (
        <div className="bg-[#FBF7F1] border-2 border-[#F59BC1] rounded-2xl p-4 text-xs space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#07402A] text-sm">
              Comparador Rápido de Anúncios
            </span>
            <span className="text-[11px] text-[#0F5C3C] font-semibold">
              Simule antes de finalizar a compra nos apps
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#07402A] mb-1">
              Nome do material:
            </label>
            <input
              type="text"
              value={simNome}
              onChange={(e) => setSimNome(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#0F5C3C]/30 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
              placeholder="Ex: Manta magnética, Papel fotográfico..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Lado Shopee */}
            <div className="bg-white p-3 rounded-xl border border-orange-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-600 flex items-center gap-1">
                  🛒 Oferta na Shopee
                </span>
                <span className="font-mono-numbers font-extrabold text-[#07402A]">
                  {formatBRLPreciso(simCustoShopee)}/un
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold">Preço (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={shopeePreco}
                    onChange={(e) => setShopeePreco(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold">Frete (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={shopeeFrete}
                    onChange={(e) => setShopeeFrete(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold">Qtd. veio</span>
                  <input
                    type="number"
                    value={shopeeQtd}
                    onChange={(e) => setShopeeQtd(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>
              </div>
            </div>

            {/* Lado Temu */}
            <div className="bg-white p-3 rounded-xl border border-amber-300 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  📦 Oferta na Temu
                </span>
                <span className="font-mono-numbers font-extrabold text-[#07402A]">
                  {formatBRLPreciso(simCustoTemu)}/un
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold">Preço (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={temuPreco}
                    onChange={(e) => setTemuPreco(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold">Frete (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={temuFrete}
                    onChange={(e) => setTemuFrete(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold">Qtd. veio</span>
                  <input
                    type="number"
                    value={temuQtd}
                    onChange={(e) => setTemuQtd(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Veredito do Comparador */}
          {simVencedor !== 'Empate' ? (
            <div className="bg-[#EAF5EF] border border-[#0F5C3C]/30 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#07402A] shrink-0" />
                <span className="font-bold text-[#07402A]">
                  {simVencedor} é {formatPercent(simEconomiaPercent)} mais barata!
                </span>
              </div>
              <span className="font-mono-numbers font-extrabold text-[#07402A]">
                Economia de {formatBRLPreciso(simEconomiaUnit)} por unidade
              </span>
            </div>
          ) : (
            <div className="bg-white p-2.5 rounded-xl text-center text-[#07402A]/70 text-xs border border-slate-200">
              Preços unitários equivalentes ou aguardando preenchimento.
            </div>
          )}
        </div>
      )}

      {/* Lista de Comparações Automáticas Cadastradas */}
      {pares.length > 0 ? (
        <div className="space-y-3">
          {pares.map((par, idx) => (
            <div
              key={idx}
              className="bg-[#FBF7F1] rounded-2xl p-3.5 border border-[#0F5C3C]/15 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <h4 className="text-sm font-bold text-[#07402A]">
                  {par.nomeBase}
                </h4>
                <div className="flex items-center gap-3 text-xs text-[#07402A]/70 mt-1 font-mono-numbers">
                  <span>
                    Shopee:{' '}
                    <strong className="text-[#07402A]">
                      {formatBRLPreciso(par.custoShopee || 0)}/un
                    </strong>
                  </span>
                  <span>·</span>
                  <span>
                    Temu:{' '}
                    <strong className="text-[#07402A]">
                      {formatBRLPreciso(par.custoTemu || 0)}/un
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {par.maisBarato === 'Shopee' && (
                  <div className="bg-orange-50 border border-orange-200 text-orange-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Shopee é {formatPercent(par.diferencaPercent || 0)} mais barata</span>
                    <span className="text-[11px] text-orange-700 font-mono-numbers">
                      (-{formatBRLPreciso(par.economiaUnitario || 0)}/un)
                    </span>
                  </div>
                )}

                {par.maisBarato === 'Temu' && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Temu é {formatPercent(par.diferencaPercent || 0)} mais barata</span>
                    <span className="text-[11px] text-amber-700 font-mono-numbers">
                      (-{formatBRLPreciso(par.economiaUnitario || 0)}/un)
                    </span>
                  </div>
                )}

                {par.maisBarato === 'Empate' && (
                  <div className="bg-white text-[#07402A] border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    Mesmo custo unitário
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#FBF7F1] rounded-2xl p-4 border border-dashed border-[#0F5C3C]/20 text-center">
          <p className="text-xs text-[#07402A] font-semibold">
            Cadastre o mesmo tipo de insumo comprado na <strong>Shopee</strong> e na <strong>Temu</strong> para ver o comparativo automático de onde está mais barato.
          </p>
        </div>
      )}
    </div>
  );
};
