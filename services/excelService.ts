import * as XLSX from 'xlsx';
import { Product, RegulatoryCategory } from '../types';

export const exportProductsToExcel = (products: Product[]) => {
  const data = products.map(p => {
    const totalUnitCost = p.purchasePrice + p.associatedCosts;
    const margin = ((p.salePrice - totalUnitCost) / p.salePrice) * 100;
    
    const avgInventory = (p.initialStock + p.currentStock) / 2;
    const rotation = avgInventory > 0 ? p.soldQuantity / avgInventory : 0;
    let action = 'Revisar';
    if (rotation > 3) action = 'Reordenar';
    else if (rotation > 2) action = 'Promocionar';

    return {
      'PRODUCTO': p.name,
      'CATEGORÍA': p.category,
      'PRECIO COMPRA (COP)': p.purchasePrice,
      'COSTO TOTAL UNITARIO (COP)': totalUnitCost,
      'CANTIDAD INICIAL': p.initialStock,
      'CANTIDAD VENDIDA': p.soldQuantity,
      'PRECIO DE VENTA (COP)': p.salePrice,
      'MARGEN (%)': margin.toFixed(2),
      'ACCIÓN SUGERIDA': action,
      'STOCK ACTUAL': p.currentStock,
      'LOTE': p.lotNumber,
      'VENCIMIENTO': p.expiryDate
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-width for columns
  const wscols = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length + 5, 15) }));
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

  // Generate file
  XLSX.writeFile(workbook, `Inventario_PharmaControl_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportFinancialReport = (stats: any) => {
    // This would be customized based on the stats object structure
    const reportData = [
        { Concepto: 'Valor Total Inventario', Valor: stats.totalValue },
        { Concepto: 'Alertas Stock Bajo', Valor: stats.lowStockCount },
        ...Object.entries(stats.byCategory).map(([cat, count]) => ({
            Concepto: `Total ${cat}`,
            Valor: count
        }))
    ];

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resumen Financiero");
    
    XLSX.writeFile(workbook, `Reporte_Financiero_${new Date().toISOString().split('T')[0]}.xlsx`);
};