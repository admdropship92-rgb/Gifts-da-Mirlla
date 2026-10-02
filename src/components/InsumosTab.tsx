import React, { useState } from 'react';
import { Insumo, LojaInsumo } from '../types';
import {
  calcularCustoUnitarioInsumo,
  formatBRL,
  formatBRLPreciso,
  formatDataBR,
  getDataHojeISO,
  parseNumeroSeguro,
} from '../utils/formatters';
import { isItemKitAntigo } from '../utils/calculations';
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Package,
  Check,
  X,
  Search,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  History,
  Sparkles,
} from 'lucide-react';

interface InsumosTabProps {
  insumos: Insumo[];
  onAdicionarInsumo: (insumo: Omit<Insumo, 'id'>) => void;
  onAtualizarInsumo: (insumo: Insumo) => void;
  onExcluirInsumo: (id: string) => void;
}

export const InsumosTab: React.FC<InsumosTabProps> = ({
  insumos,
  onAdicionarInsumo,
  onAtualizarInsumo,
  onExcluirInsumo,
}) => {
  // Controle de edição
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [loja, setLoja] = useState<LojaInsumo>('Outro');
  const [preco, setPreco] = useState('');
  const [frete, setFrete] = useState('0');
  const [quantidade, setQuantidade] = useState('');
  const [data, setData] = useState(getDataHojeISO());
  const [unidadeMedida, setUnidadeMedida] = useState('unidades');
  const [observacao, setObservacao] = useState('');

  // Expansão da seção de insumos históricos
  const [historicoExpandido, setHistoricoExpandido] = useState<boolean>(false);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroLoja, setFiltroLoja] = useState<'Todos' | 'Shopee' | 'Temu' | 'Outro'>('Todos');

  // Confirmação de exclusão
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState<string | null>(null);

  // Cálculo ao vivo do custo unitário do formulário
  const custoUnitarioPreview = calcularCustoUnitarioInsumo(
    parseNumeroSeguro(preco),
    parseNumeroSeguro(frete),
    parseNumeroSeguro(quantidade)
  );

  const resetFormulario = () => {
    setNome('');
    setLoja('Outro');
    setPreco('');
    setFrete('0');
    setQuantidade('');
    setData(getDataHojeISO());
    setUnidadeMedida('unidades');
    setObservacao('');
    setEditandoId(null);
  };

  const iniciarEdicao = (ins: Insumo) => {
    setEditandoId(ins.id);
    setNome(ins.nome);
    setLoja(ins.loja);
    setPreco(String(ins.preco));
    setFrete(String(ins.frete));
    setQuantidade(String(ins.quantidade));
    setData(ins.data || getDataHojeISO());
    setUnidadeMedida(ins.unidadeMedida || 'unidades');
    setObservacao(ins.observacao || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const precoNum = parseNumeroSeguro(preco);
    const freteNum = parseNumeroSeguro(frete);
    const qtdNum = Math.max(1, parseNumeroSeguro(quantidade));

    if (editandoId) {
      onAtualizarInsumo({
        id: editandoId,
        nome: nome.trim(),
        loja,
        preco: precoNum,
        frete: freteNum,
        quantidade: qtdNum,
        data,
        unidadeMedida: unidadeMedida.trim() || 'unidades',
        observacao: observacao.trim(),
        ativoNaReceita: true,
      });
    } else {
      onAdicionarInsumo({
        nome: nome.trim(),
        loja,
        preco: precoNum,
        frete: freteNum,
        quantidade: qtdNum,
        data,
        unidadeMedida: unidadeMedida.trim() || 'unidades',
        observacao: observacao.trim(),
        ativoNaReceita: true,
      });
    }

    resetFormulario();
  };

  // Filtra insumos pela busca e loja para o contador geral
  const insumosFiltrados = insumos.filter((item) => {
    const bateNome = item.nome.toLowerCase().includes(busca.toLowerCase());
    const bateLoja = filtroLoja === 'Todos' || item.loja === filtroLoja;
    return bateNome && bateLoja;
  });

  // Separação entre Insumos Ativos (usados na receita) e Insumos Históricos (antigos manta, vinil, saquinho)
  const insumosAtivos = insumosFiltrados.filter(
    (ins) => ins.ativoNaReceita !== false && !isItemKitAntigo(ins)
  );

  const insumosHistoricos = insumosFiltrados.filter(
    (ins) => ins.ativoNaReceita === false || isItemKitAntigo(ins)
  );

  return (
    <div className="space-y-6">
      {/* Formulário de Cadastro / Edição */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#0F5C3C]/15 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#0F5C3C]/10">
          <div>
            <h3 className="text-base font-bold text-[#07402A] flex items-center gap-2">
              {editandoId ? (
                <>
                  <Pencil className="h-4 w-4 text-[#F59BC1]" />
                  Editar Insumo
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 text-[#07402A]" />
                  Cadastrar Novo Insumo
                </>
              )}
            </h3>
            <p className="text-xs text-[#07402A]/70 mt-0.5">
              O custo por unidade é calculado automaticamente: (Preço + Frete) ÷ Quantidade
            </p>
          </div>

          {editandoId && (
            <button
              type="button"
              onClick={resetFormulario}
              className="text-xs font-bold px-2.5 py-1 text-[#07402A] hover:bg-[#FCE4EE] bg-[#FBF7F1] rounded-xl flex items-center gap-1 border border-[#0F5C3C]/20 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nome e Loja */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Nome do Insumo *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Kit Ímã, Embalagem Holográfica, Papel Seda..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F5C3C]/30 text-sm font-medium focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Onde comprou?
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['Shopee', 'Temu', 'Outro'] as LojaInsumo[]).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setLoja(op)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-all border text-center ${
                      loja === op
                        ? op === 'Shopee'
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : op === 'Temu'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-[#07402A] text-white border-[#07402A] shadow-xs'
                        : 'bg-[#FBF7F1] text-[#07402A] border-[#0F5C3C]/20 hover:bg-[#FCE4EE]'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preço, Frete, Quantidade e Data */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Preço Pago (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="29,90"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#0F5C3C]/30 text-sm font-mono-numbers font-medium focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Frete (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={frete}
                  onChange={(e) => setFrete(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#0F5C3C]/30 text-sm font-mono-numbers font-medium focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Qtd. no pacote *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Ex: 40, 50, 100..."
                className="w-full px-3 py-2.5 rounded-xl border border-[#0F5C3C]/30 text-sm font-mono-numbers font-medium focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#07402A] mb-1">
                Data da Compra
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl border border-[#0F5C3C]/30 text-xs font-medium focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden text-[#07402A]"
              />
            </div>
          </div>

          {/* Destaque do Cálculo Automático por Unidade */}
          <div className="bg-[#FBF7F1] border border-[#0F5C3C]/15 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#07402A]/80 font-medium">
              <span className="font-bold text-[#07402A]">Cálculo automático:</span>{' '}
              ({formatBRL(parseNumeroSeguro(preco))} + {formatBRL(parseNumeroSeguro(frete))}) ÷ {quantidade || '0'} un
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#0F5C3C]/20 shadow-2xs self-start sm:self-auto">
              <span className="text-xs text-[#07402A]/70 font-semibold">
                Custo por unidade:
              </span>
              <span className="text-base font-extrabold text-[#07402A] font-mono-numbers">
                {formatBRLPreciso(custoUnitarioPreview)}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {editandoId && (
              <button
                type="button"
                onClick={resetFormulario}
                className="px-4 py-2.5 rounded-xl border border-[#0F5C3C]/30 text-xs font-bold text-[#07402A] hover:bg-[#FBF7F1]"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#F59BC1] hover:bg-[#f38ab6] active:bg-[#ea75a7] text-[#07402A] text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 border border-[#ea75a7]"
            >
              <Check className="h-4 w-4" />
              {editandoId ? 'Salvar Alterações' : 'Cadastrar Insumo'}
            </button>
          </div>
        </form>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#07402A]/40" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar insumo pelo nome..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#0F5C3C]/20 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#F59BC1] focus:outline-hidden text-[#07402A]"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#0F5C3C]/15 self-start sm:self-auto shrink-0 shadow-2xs">
            {(['Todos', 'Shopee', 'Temu', 'Outro'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFiltroLoja(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filtroLoja === tab
                    ? 'bg-[#07402A] text-[#FBF7F1] shadow-2xs'
                    : 'text-[#07402A]/70 hover:text-[#07402A] hover:bg-[#FBF7F1]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Quantidade de Insumos Encontrados */}
        <div className="flex items-center justify-between text-xs text-[#07402A]/70 px-1">
          <span className="font-semibold">
            {insumosFiltrados.length}{' '}
            {insumosFiltrados.length === 1 ? 'insumo cadastrado' : 'insumos cadastrados'}
          </span>
          <span className="font-mono-numbers">Custos reais atualizados</span>
        </div>

        {/* SEÇÃO 1: INSUMOS ATIVOS DA RECEITA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#07402A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#07402A]"></span>
              Insumos Ativos da Marca (Usados na Receita)
            </h4>
            <span className="text-[11px] font-semibold text-[#07402A]/60">
              {insumosAtivos.length} {insumosAtivos.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {insumosAtivos.map((ins) => {
              const custoUnitario = ins.preco / ins.quantidade;
              const estaConfirmandoExclusao = confirmarExclusaoId === ins.id;
              const ehPapel = ins.nome.toLowerCase().includes('papel');

              return (
                <div
                  key={ins.id}
                  className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                    editandoId === ins.id
                      ? 'ring-2 ring-[#F59BC1] border-[#F59BC1] bg-[#FCE4EE]/20'
                      : 'border-[#0F5C3C]/15 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              ins.loja === 'Shopee'
                                ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                : ins.loja === 'Temu'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-[#07402A]/10 text-[#07402A] border border-[#0F5C3C]/20'
                            }`}
                          >
                            {ins.loja}
                          </span>
                          {ins.data && (
                            <span className="text-[11px] text-[#07402A]/60 flex items-center gap-1 font-mono-numbers">
                              <Calendar className="h-3 w-3" />
                              {formatDataBR(ins.data)}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-[#07402A] leading-snug">
                          {ins.nome}
                        </h4>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(ins)}
                          title="Editar insumo"
                          className="p-1.5 rounded-xl text-[#07402A]/60 hover:text-[#07402A] hover:bg-[#FCE4EE] transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmarExclusaoId(
                              estaConfirmandoExclusao ? null : ins.id
                            )
                          }
                          title="Excluir insumo"
                          className="p-1.5 rounded-xl text-[#07402A]/60 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {ins.observacao && (
                      <p className="text-[11px] text-[#07402A]/65 mt-1">
                        {ins.observacao}
                      </p>
                    )}
                  </div>

                  {/* Confirmação de Exclusão */}
                  {estaConfirmandoExclusao && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                        Deseja excluir este insumo?
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setConfirmarExclusaoId(null)}
                          className="px-2.5 py-1 text-slate-600 bg-white border border-slate-200 rounded-lg font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onExcluirInsumo(ins.id);
                            setConfirmarExclusaoId(null);
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Detalhes Financeiros */}
                  <div className="mt-3 pt-3 border-t border-[#0F5C3C]/10 flex items-center justify-between">
                    <div className="text-xs text-[#07402A]/70 font-mono-numbers">
                      <div>
                        Pacote: <strong className="text-[#07402A]">{formatBRL(ins.preco)}</strong>
                      </div>
                      <div className="text-[11px] text-[#07402A]/60">
                        {ins.quantidade} {ins.unidadeMedida || 'un'}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#07402A]/60 font-semibold block uppercase">
                        Custo Unitário
                      </span>
                      <span className="text-base font-extrabold text-[#07402A] font-mono-numbers">
                        {formatBRLPreciso(custoUnitario)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEÇÃO 2: INSUMOS ANTERIORES (Histórico / Não Usados na Receita) */}
        {insumosHistoricos.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#0F5C3C]/15 overflow-hidden shadow-2xs mt-6">
            <div
              onClick={() => setHistoricoExpandido(!historicoExpandido)}
              className="p-4 bg-[#FBF7F1] flex items-center justify-between cursor-pointer select-none hover:bg-[#FCE4EE]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-white text-[#07402A] border border-[#0F5C3C]/15">
                  <History className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#07402A]">
                    Insumos Anteriores (Histórico / Não Usados na Receita)
                  </h4>
                  <p className="text-[11px] text-[#07402A]/65">
                    Manta, Vinil, Saquinho 7x10 e papéis antigos preservados com segurança ({insumosHistoricos.length} compras)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#07402A]/10 text-[#07402A]">
                  Não usado na receita
                </span>
                {historicoExpandido ? (
                  <ChevronUp className="h-4 w-4 text-[#07402A]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#07402A]" />
                )}
              </div>
            </div>

            {historicoExpandido && (
              <div className="p-4 sm:p-5 bg-white border-t border-[#0F5C3C]/10 grid grid-cols-1 md:grid-cols-2 gap-3">
                {insumosHistoricos.map((ins) => {
                  const custoUnit = ins.preco / ins.quantidade;
                  const estaConfirmandoExclusao = confirmarExclusaoId === ins.id;

                  return (
                    <div
                      key={ins.id}
                      className="bg-[#FBF7F1]/60 rounded-2xl p-3.5 border border-[#0F5C3C]/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                  ins.loja === 'Shopee'
                                    ? 'bg-orange-100 text-orange-900'
                                    : ins.loja === 'Temu'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {ins.loja}
                              </span>
                              <span className="text-[10px] font-medium text-[#07402A]/60 bg-white px-2 py-0.5 rounded border border-[#0F5C3C]/10">
                                Histórico
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-[#07402A] leading-snug">
                              {ins.nome}
                            </h5>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => iniciarEdicao(ins)}
                              title="Editar"
                              className="p-1 rounded-lg text-[#07402A]/60 hover:text-[#07402A] hover:bg-white"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmarExclusaoId(
                                  estaConfirmandoExclusao ? null : ins.id
                                )
                              }
                              title="Excluir"
                              className="p-1 rounded-lg text-[#07402A]/60 hover:text-rose-600 hover:bg-white"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {estaConfirmandoExclusao && (
                        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                          <p className="text-[11px] text-rose-700 font-semibold">
                            Excluir este item histórico?
                          </p>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setConfirmarExclusaoId(null)}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px]"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onExcluirInsumo(ins.id);
                                setConfirmarExclusaoId(null);
                              }}
                              className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-[#0F5C3C]/10 flex items-center justify-between text-xs font-mono-numbers">
                        <span className="text-[#07402A]/60 text-[11px]">
                          Pacote: {formatBRL(ins.preco)} ({ins.quantidade} {ins.unidadeMedida || 'un'})
                        </span>
                        <strong className="text-[#07402A] font-extrabold">
                          {formatBRLPreciso(custoUnit)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
