import React, { useState, useRef } from 'react';
import { analyzeProductImage } from '../services/geminiService';
import { Product } from '../types';

interface ScannerProps {
  onScanComplete: (data: Partial<Product>) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      setLoading(true);
      
      // Call Gemini
      const data = await analyzeProductImage(base64.split(',')[1]);
      
      setLoading(false);
      
      if (data) {
         // Map Gemini response to our internal format
         const scannedData: Partial<Product> = {
            name: data.productName || '',
            invimaRegistration: data.registrationNumber || '',
            lotNumber: data.lotNumber || '',
            expiryDate: data.expiryDate || '',
         };
         onScanComplete(scannedData);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Escaneo Inteligente (OCR)</h2>
      <p className="text-gray-600 mb-4 text-sm">Sube una foto de la caja del medicamento. Gemini identificará el lote, vencimiento y registro INVIMA.</p>
      
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
           onClick={() => fileInputRef.current?.click()}>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        {image ? (
          <img src={image} alt="Preview" className="max-h-48 rounded-lg shadow-sm" />
        ) : (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-1 text-sm text-gray-600">Click para subir imagen</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Procesando con Gemini Pro...</span>
        </div>
      )}
    </div>
  );
};

export default Scanner;