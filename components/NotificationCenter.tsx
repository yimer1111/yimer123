import React, { useState } from 'react';
import { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onDismiss }) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[9px] text-white flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-20 border border-gray-200 overflow-hidden animate-fade-in-down">
            <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-sm text-gray-700">Notificaciones</h3>
               <span className="text-xs text-gray-500">{unreadCount} nuevas</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  No hay notificaciones pendientes.
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${notification.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                  >
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      notification.type === 'critical' ? 'bg-red-500' : 
                      notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                       <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                       <p className="text-xs text-gray-400 mt-1">{notification.timestamp.toLocaleTimeString()}</p>
                    </div>
                    <button 
                      onClick={() => onDismiss(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;