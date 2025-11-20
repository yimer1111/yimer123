import React, { useState, useEffect } from 'react';
import { Product, RegulatoryCategory, MARGIN_LIMITS, CATEGORY_LABELS, CATEGORY_COLORS, User } from '../types';
import { exportProductsToExcel } from '../services/excelService';

interface ProductManagerProps {
  products: Product[];
  onAddProduct: (p: Product) => void;
  currentUser: User;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, onAddProduct, currentUser }) => {
  const [showForm, setShowForm] = useState(false);
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'pharmacist';
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RegulatoryCategory>(RegulatoryCategory.LIBRE_VENTA);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [associatedCosts, setAssociatedCosts] = useState<number>(0);
  const [marginInput, setMarginInput] = useState<number>(20);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [invima, setInvima] = useState('');
  const [expiry, setExpiry] = useState('');

  // Validation State
  const [marginError, setMarginError] = useState<string | null>(null);

  // Auto-calculate Price
  useEffect(() => {
    const costBase = purchasePrice + associatedCosts;
    const calculatedPrice = costBase * (1 + marginInput / 100);
    setSalePrice(Math.round(calculatedPrice));

    const limits = MARGIN_LIMITS[category];
    if (marginInput < limits.min || marginInput > limits.max) {
      setMarginError(`El margen para ${CATEGORY_LABELS[category]} debe estar entre ${limits.min}% y ${limits.max}%`);
    } else {
      setMarginError(null);
    }
  }, [purchasePrice, associatedCosts, marginInput, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (marginError) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      category,
      purchasePrice,
      associatedCosts,
      salePrice,
      currentStock: stock,
      initialStock: stock, // Initial assumption
      soldQuantity: 0,
      expiryDate: expiry,
      lotNumber: 'L-' + Math.floor(Math.random() * 10000),
      invimaRegistration: invima,
    };

    onAddProduct(newProduct);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPurchasePrice(0);
    setAssociatedCosts(0);
    setStock(0);
    setInvima('');
    setExpiry('');
  };

  const handleExport = () => {
    exportProductsToExcel(products);
  };

  const getActionLabel = (rotation: number) => {
    if (rotation > 3) return { label: 'Reordenar', color: 'text-red-600 bg-red-50 border-red-200' };
    if (rotation > 2) return { label: 'Promocionar', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { label: 'Revisar', color: 'text-gray-600 bg-gray-50 border-gray-200' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar Excel
          </button>
          {canEdit && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
            >
              {showForm ? 'Cancelar' : '+ Nuevo Producto'}
            </button>
          )}
        </div>
      </div>

      {/* Add Product Form */}
      {showForm && canEdit && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Registro con Validación Regulatoria</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Regulatoria</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value as RegulatoryCategory)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(RegulatoryCategory).map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <p className={`text-xs mt-1 ${CATEGORY_COLORS[category].replace('bg-', 'text-')}`}>
                Margen Permitido: {MARGIN_LIMITS[category].min}% - {MARGIN_LIMITS[category].max}%
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra ($)</label>
              <input required type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costos Asociados ($)</label>
              <input required type="number" value={associatedCosts} onChange={e => setAssociatedCosts(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Margen de Beneficio (%)</label>
                 <input 
                  required 
                  type="number" 
                  step="0.1"
                  value={marginInput} 
                  onChange={e => setMarginInput(Number(e.target.value))} 
                  className={`w-full border rounded-lg p-2 ${marginError ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300'}`} 
                />
                {marginError && <p className="text-red-500 text-xs mt-1 font-medium">{marginError}</p>}
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta Sugerido ($)</label>
                 <input readOnly type="number" value={salePrice} className="w-full bg-gray-200 border border-gray-300 rounded-lg p-2 font-bold text-gray-700" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
              <input required type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registro INVIMA</label>
              <input required type="text" value={invima} onChange={e => setInvima(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento</label>
              <input required type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>

            <div className="col-span-2 flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={!!marginError}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${marginError ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'}`}
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Producto</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b text-right">Precio Compra<br/>(COP)</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b text-right">Costo Total<br/>(Unitario)</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b text-center">Cant.<br/>Inicial</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b text-center">Cant.<br/>Vendida</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b text-right">Precio Venta<br/>(COP)</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b text-right">Margen<br/>(%)</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b text-center">Acción<br/>Sugerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {products.map(p => {
                const totalUnitCost = p.purchasePrice + p.associatedCosts;
                const margin = ((p.salePrice - totalUnitCost) / p.salePrice) * 100;
                
                // Rotation Calculation: Sold / Average Inventory
                // Avg Inventory = (Initial + Current) / 2
                const avgInventory = (p.initialStock + p.currentStock) / 2;
                const rotation = avgInventory > 0 ? p.soldQuantity / avgInventory : 0;
                const action = getActionLabel(rotation);

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${CATEGORY_COLORS[p.category]}`}>
                          {CATEGORY_LABELS[p.category].split(' ')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-gray-600 font-mono">${p.purchasePrice.toLocaleString()}</td>
                    <td className="p-3 text-right text-gray-600 font-mono bg-gray-50/50">${totalUnitCost.toLocaleString()}</td>
                    <td className="p-3 text-center text-gray-600">{p.initialStock}</td>
                    <td className="p-3 text-center text-gray-600">{p.soldQuantity}</td>
                    <td className="p-3 text-right font-bold text-gray-900 font-mono">${p.salePrice.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${margin < MARGIN_LIMITS[p.category].min ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-xs border px-2 py-1 rounded-full font-medium ${action.color}`}>
                        {action.label}
                      </span>
                      <div className="text-[9px] text-gray-400 mt-1">Rot: {rotation.toFixed(1)}</div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No hay productos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;