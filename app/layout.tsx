'use client';

import React, { useState } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="fr">
      <head>
        <title>ATLAS BTP Maroc — ERP Gestion Commerciale & Chantiers (Sage 100)</title>
        <meta name="description" content="ERP complet de gestion commerciale BTP Maroc type Sage 100 : Chantiers, DQE, Ventes, Achats, Stocks, Pointage et Trésorerie" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
