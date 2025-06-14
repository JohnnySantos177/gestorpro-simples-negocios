
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';
import { Compra, Transacao, Cliente, Produto, Fornecedor } from '@/types';

interface ExportButtonsProps {
  data: Compra[] | Transacao[] | Cliente[] | Produto[] | Fornecedor[];
  type: 'vendas' | 'transacoes' | 'clientes' | 'produtos' | 'fornecedores';
  disabled?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  data, 
  type, 
  disabled = false 
}) => {
  const handleExportPDF = () => {
    const exportData = { [type]: data };
    exportToPDF(exportData, type);
  };

  const handleExportExcel = () => {
    const exportData = { [type]: data };
    exportToExcel(exportData, type);
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
