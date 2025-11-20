import React from 'react';

export enum RegulatoryCategory {
  MONOPOLIO_ESTADO = 'MONOPOLIO_ESTADO',
  FONDO_NACIONAL = 'FONDO_NACIONAL',
  MONOPOLIO_CIRCULAR = 'MONOPOLIO_CIRCULAR',
  LIBRE_VENTA = 'LIBRE_VENTA'
}

export interface Product {
  id: string;
  name: string;
  category: RegulatoryCategory;
  purchasePrice: number;
  associatedCosts: number; // Transport, storage per unit
  salePrice: number;
  currentStock: number;
  initialStock: number; // For rotation calc period
  soldQuantity: number; // For rotation calc period
  expiryDate: string;
  lotNumber: string;
  invimaRegistration: string;
}

export interface FinancialMetrics {
  marginPercent: number;
  rotation: number;
  daysInventory: number;
  action: 'Reordenar' | 'Promocionar' | 'Revisar' | 'OK';
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles: Role[];
}

export type Role = 'admin' | 'pharmacist' | 'viewer';

export interface User {
  username: string;
  name: string;
  role: Role;
}

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  read: boolean;
}

export const MARGIN_LIMITS = {
  [RegulatoryCategory.FONDO_NACIONAL]: { min: 20, max: 25 },
  [RegulatoryCategory.MONOPOLIO_ESTADO]: { min: 20, max: 22 },
  [RegulatoryCategory.MONOPOLIO_CIRCULAR]: { min: 25, max: 35 },
  [RegulatoryCategory.LIBRE_VENTA]: { min: 0, max: 100 },
};

export const CATEGORY_COLORS = {
  [RegulatoryCategory.FONDO_NACIONAL]: 'bg-fondo-nacional',
  [RegulatoryCategory.MONOPOLIO_ESTADO]: 'bg-monopolio-estado',
  [RegulatoryCategory.MONOPOLIO_CIRCULAR]: 'bg-monopolio-circular',
  [RegulatoryCategory.LIBRE_VENTA]: 'bg-neutral-gray',
};

export const CATEGORY_LABELS = {
  [RegulatoryCategory.FONDO_NACIONAL]: 'Fondo Nacional de Estupefacientes',
  [RegulatoryCategory.MONOPOLIO_ESTADO]: 'Monopolio del Estado',
  [RegulatoryCategory.MONOPOLIO_CIRCULAR]: 'Monopolio Circular',
  [RegulatoryCategory.LIBRE_VENTA]: 'Venta Libre / OTC',
};