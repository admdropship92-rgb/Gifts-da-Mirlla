import React, { useRef, useState } from 'react';
import { AppData } from '../types';
import { exportarBackupJSON, importarBackupJSON, DADOS_INICIAIS } from '../utils/storage';
import {
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  FileJson,
} from 'lucide-react';

interface BackupModalProps {
  aberto: boolean;
  dados: AppData;
  onFechar: () => void;
  onRestaurarDados: (novosDados: AppData) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  aberto,
  dados,
  onFechar,
  onRestaurarDados,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [confirmarReset, setConfirmarReset] = useState(false);

  if (!aberto) return null;

  const handleExportar = () => {
    try {
      exportarBackupJSON(dados);
      setMensagemSucesso('Backup baixado com sucesso! Guarde este arquivo em local seguro.');
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch (err) {
      setMensagemErro('Erro ao gerar arquivo de backup.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dadosImportados = await importarBackupJSON(file);
      onRestaurarDados(dadosImportados);
      setMensagemSucesso('Backup restaurado com sucesso!');
      setMensagemErro(null);
      setTimeout(() => {
        setMensagemSucesso(null);
        onFechar();
      }, 1500);
    } catch (err: any) {
      setMensagemErro(err.message || 'Falha ao ler o arquivo de backup.');
      setMensagemSucesso(null);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetExemplo = () => {
    onRestaurarDados(DADOS_INICIAIS);
    setConfirmarReset(false);
    setMensagemSucesso('Dados restaurados com os exemplos de fábrica!');
    setTimeout(() => {
      setMensagemSucesso(null);
      onFechar();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07402A]/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#0F5C3C]/20 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#0F5C3C]/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-[#FCE4EE] text-[#07402A]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#07402A]">
                Backup e Segurança dos Dados
              </h3>
              <p className="text-xs text-[#07402A]/70">
                Seus dados ficam salvos apenas no seu celular
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 rounded-xl text-[#07402A]/60 hover:text-[#07402A] hover:bg-[#FBF7F1] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mensagemSucesso && (
          <div className="bg-[#EAF5EF] border border-[#0F5C3C]/30 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#07402A]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#07402A]" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {mensagemErro && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{mensagemErro}</span>
          </div>
        )}

        {/* Opção 1: Fazer Backup (Botão Principal Rosa #F59BC1) */}
        <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-[#07402A]" />
              <h4 className="text-xs font-bold text-[#07402A]">
                1. Fazer Backup (Download JSON)
              </h4>
            </div>
          </div>
          <p className="text-[11px] text-[#07402A]/70">
            Baixa um arquivo .json com todos os seus insumos, receitas e configurações. Guarde no WhatsApp, Google Drive ou no celular.
          </p>
          <button
            type="button"
            onClick={handleExportar}
            className="w-full py-2.5 px-4 bg-[#F59BC1] hover:bg-[#f38ab6] active:bg-[#ea75a7] text-[#07402A] rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 border border-[#ea75a7]"
          >
            <Download className="h-4 w-4 text-[#07402A]" />
            Baixar Arquivo de Backup
          </button>
        </div>

        {/* Opção 2: Restaurar Backup (Botão Secundário Verde Escuro #07402A com texto creme #FBF7F1) */}
        <div className="bg-[#FBF7F1] p-4 rounded-2xl border border-[#0F5C3C]/15 space-y-2">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-[#07402A]" />
            <h4 className="text-xs font-bold text-[#07402A]">
              2. Restaurar Backup
            </h4>
          </div>
          <p className="text-[11px] text-[#07402A]/70">
            Se trocou de celular ou limpou o histórico do navegador, selecione o arquivo .json para recuperar tudo.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-[#07402A] hover:bg-[#0F5C3C] active:bg-[#053220] text-[#FBF7F1] rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4 text-[#F59BC1]" />
            Selecionar Arquivo .JSON
          </button>
        </div>

        {/* Opção 3: Restaurar Dados de Exemplo */}
        <div className="pt-2 border-t border-[#0F5C3C]/10 flex items-center justify-between">
          <span className="text-[11px] text-[#07402A]/70">
            {dados.insumos.length} insumos salvos localmente
          </span>

          {!confirmarReset ? (
            <button
              type="button"
              onClick={() => setConfirmarReset(true)}
              className="text-xs text-[#07402A]/70 hover:text-[#07402A] font-bold flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Restaurar exemplos
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-rose-600 font-bold">Tem certeza?</span>
              <button
                type="button"
                onClick={handleResetExemplo}
                className="px-2 py-1 bg-rose-600 text-white font-bold rounded-lg"
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setConfirmarReset(false)}
                className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg"
              >
                Não
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
