/**
 * Funções de formatação e cálculos financeiros em Reais (R$)
 */

// Formata valores numéricos para moeda brasileira: R$ 1.250,50
export function formatBRL(valor: number): string {
  if (isNaN(valor) || valor === null || valor === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

// Formata valores pequenos com até 3 casas se necessário (ex: R$ 0,185 por folha/ímã)
export function formatBRLPreciso(valor: number): string {
  if (isNaN(valor) || valor === null || valor === undefined) return 'R$ 0,00';
  const casas = valor < 1 && valor > 0 ? 3 : 2;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: casas,
  }).format(valor);
}

// Formata percentual: 45,5%
export function formatPercent(valor: number): string {
  if (isNaN(valor) || valor === null || valor === undefined) return '0,0%';
  return `${valor.toFixed(1).replace('.', ',')}%`;
}

// Formata data brasileira: DD/MM/AAAA a partir de YYYY-MM-DD
export function formatDataBR(dataISO: string): string {
  if (!dataISO) return '';
  const partes = dataISO.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataISO;
}

// Retorna data de hoje em formato YYYY-MM-DD
export function getDataHojeISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Calcula o custo unitário do insumo: (preço + frete) ÷ quantidade
export function calcularCustoUnitarioInsumo(preco: number, frete: number, quantidade: number): number {
  const precoValido = Number(preco) || 0;
  const freteValido = Number(frete) || 0;
  const qtdValida = Number(quantidade) || 0;
  if (qtdValida <= 0) return 0;
  return (precoValido + freteValido) / qtdValida;
}

// Converte string de input numérico para number seguro
export function parseNumeroSeguro(valor: string | number): number {
  if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;
  if (!valor) return 0;
  const normalizado = String(valor).replace(',', '.').trim();
  const num = parseFloat(normalizado);
  return isNaN(num) ? 0 : num;
}
