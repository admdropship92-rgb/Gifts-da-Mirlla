import React, { useState } from 'react';
import { formatBRLPreciso, formatPercent } from '../utils/formatters';

interface DonutSlice {
  label: string;
  valor: number;
  percent: number;
  color: string;
}

interface DonutChartProps {
  detalhes: {
    nome: string;
    loja: string;
    custoNesteProduto: number;
    pesoPercent: number;
  }[];
  custoTotal: number;
}

// Tons harmoniosos de verde escuro e rosa da marca Gifts da Mirlla
const PALETA_CORES_MARCA = [
  '#07402A', // Verde escuro principal
  '#F59BC1', // Rosa principal
  '#0F5C3C', // Verde médio floresta
  '#E882AD', // Rosa fúcsia suave
  '#1E7E55', // Verde esmeralda artesanal
  '#F8B4D0', // Rosa claro
  '#2C9668', // Verde folha
  '#C75888', // Rosa queimado
];

export const DonutChart: React.FC<DonutChartProps> = ({ detalhes, custoTotal }) => {
  const [sliceAtivo, setSliceAtivo] = useState<number | null>(null);

  if (!detalhes || detalhes.length === 0 || custoTotal <= 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-dashed border-[#0F5C3C]/20 text-center">
        <p className="text-sm text-[#07402A] font-bold">
          Nenhum insumo adicionado ao produto ainda.
        </p>
        <p className="text-xs text-[#07402A]/60 mt-1">
          Vá na aba "Produto" para selecionar os insumos do seu foto ímã.
        </p>
      </div>
    );
  }

  // Prepara fatias
  const slices: DonutSlice[] = detalhes.map((item, index) => ({
    label: item.nome,
    valor: item.custoNesteProduto,
    percent: item.pesoPercent,
    color: PALETA_CORES_MARCA[index % PALETA_CORES_MARCA.length],
  }));

  // Parâmetros do SVG Donut
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let acumuladoPercent = 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#0F5C3C]/15 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#07402A]">
            Divisão do Custo por Insumo
          </h3>
          <p className="text-xs text-[#07402A]/70">
            Quanto cada material pesa em 1 foto ímã
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-[#FBF7F1] text-[#07402A] border border-[#0F5C3C]/15 rounded-full font-mono-numbers">
          Total: {formatBRLPreciso(custoTotal)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Gráfico Circular de Rosca SVG */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Círculo base de fundo */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#FBF7F1"
              strokeWidth={strokeWidth}
            />

            {/* Fatias */}
            {slices.map((slice, i) => {
              const dashLength = (slice.percent / 100) * circumference;
              const dashOffset = -((acumuladoPercent / 100) * circumference);
              acumuladoPercent += slice.percent;

              const isSelected = sliceAtivo === i;

              return (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setSliceAtivo(i)}
                  onMouseLeave={() => setSliceAtivo(null)}
                  onClick={() => setSliceAtivo(sliceAtivo === i ? null : i)}
                />
              );
            })}
          </svg>

          {/* Centro da Rosca */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {sliceAtivo !== null && slices[sliceAtivo] ? (
              <>
                <span className="text-[11px] font-bold text-[#07402A]/70 truncate max-w-[120px]">
                  {slices[sliceAtivo].label}
                </span>
                <span className="text-lg font-black text-[#07402A] font-mono-numbers">
                  {formatPercent(slices[sliceAtivo].percent)}
                </span>
                <span className="text-xs text-[#0F5C3C] font-mono-numbers font-semibold">
                  {formatBRLPreciso(slices[sliceAtivo].valor)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-semibold text-[#07402A]/60">
                  Custo Insumos
                </span>
                <span className="text-lg font-black text-[#07402A] font-mono-numbers">
                  {formatBRLPreciso(custoTotal)}
                </span>
                <span className="text-[10px] text-[#07402A]/60 font-medium">
                  {slices.length} {slices.length === 1 ? 'material' : 'materiais'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legenda dos Insumos */}
        <div className="flex-1 w-full space-y-2">
          {slices.map((slice, i) => {
            const isHovered = sliceAtivo === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setSliceAtivo(i)}
                onMouseLeave={() => setSliceAtivo(null)}
                onClick={() => setSliceAtivo(sliceAtivo === i ? null : i)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  isHovered
                    ? 'bg-[#FCE4EE] ring-1 ring-[#F59BC1]'
                    : 'hover:bg-[#FBF7F1]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-black/10"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-bold text-[#07402A] truncate">
                    {slice.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono-numbers">
                  <span className="text-[#07402A]/70">
                    {formatBRLPreciso(slice.valor)}
                  </span>
                  <span className="font-extrabold text-[#07402A] min-w-[42px] text-right">
                    {formatPercent(slice.percent)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
