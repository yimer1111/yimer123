import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Product, RegulatoryCategory, CATEGORY_COLORS } from '../types';
import { analyzeFinancialHealth } from '../services/geminiService';
import { exportFinancialReport } from '../services/excelService';
import { ThinkingIcon } from './Icons';

interface DashboardProps {
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // KPI Calculation
  const stats = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + (p.salePrice * p.currentStock), 0);
    const lowStockCount = products.filter(p => p.currentStock < 10).length;
    
    // Count by category
    const byCategory = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<RegulatoryCategory, number>);

    return { totalValue, lowStockCount, byCategory };
  }, [products]);

  // Data for Chart
  const chartData = useMemo(() => {
    return Object.keys(stats.byCategory).map(key => ({
      name: key.replace('_', ' '),
      count: stats.byCategory[key as RegulatoryCategory]
    }));
  }, [stats]);

  const handleDeepAnalysis = async () => {
    setIsThinking(true);
    const result = await analyzeFinancialHealth(products);
    setAnalysisResult(result);
    setIsThinking(false);
  };

  const handleExport = () => {
    exportFinancialReport(stats);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Resumen Financiero y Regulatorio</h2>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Exportar Excel
        </button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Valor Total Inventario</p>
          <p className="text-3xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Alertas Stock Bajo</p>
          <p className="text-3xl font-bold text-red-600">{stats.lowStockCount}</p>
          <p className="text-xs text-gray-400">Productos requieren reorden</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Referencias</p>
          <p className="text-3xl font-bold text-blue-600">{products.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80">
          <h3 className="text-lg font-semibold mb-4">Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 10}} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ThinkingIcon />
              Análisis Estratégico (Gemini 3 Pro)
            </h3>
            <button 
              onClick={handleDeepAnalysis}
              disabled={isThinking || products.length === 0}
              className={`text-sm px-4 py-2 rounded-full ${isThinking ? 'bg-gray-100 text-gray-400' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
            >
              {isThinking ? 'Pensando...' : 'Analizar Rentabilidad'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
            {analysisResult ? (
              <div className="prose prose-sm max-w-none">
                {analysisResult.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
              </div>
            ) : (
              <p className="text-gray-400 italic text-center mt-10">
                Haz clic en "Analizar Rentabilidad" para usar el razonamiento profundo de Gemini sobre tus márgenes y rotación.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;