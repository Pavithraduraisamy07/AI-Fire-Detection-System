/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { AIPredictionView } from './views/AIPredictionView';
import { AlertsView } from './views/AlertsView';
import { PreventionControlView } from './views/PreventionControlView';
import { IoTIntegrationView } from './views/IoTIntegrationView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { ProjectExportView } from './views/ProjectExportView';
import { AuthView } from './views/AuthView';

function MainLayout() {
  const { user } = useApp();
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If user is logged out, show the Auth screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
        <AuthView onSuccess={() => setCurrentTab('dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentTab === 'dashboard' && <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />}
            {currentTab === 'live-monitoring' && <LiveMonitoringView />}
            {currentTab === 'ai-prediction' && <AIPredictionView />}
            {currentTab === 'alerts' && <AlertsView />}
            {currentTab === 'prevention' && <PreventionControlView />}
            {currentTab === 'iot-device' && <IoTIntegrationView />}
            {currentTab === 'analytics' && <AnalyticsView />}
            {currentTab === 'settings' && <SettingsView />}
            {currentTab === 'export-zip' && <ProjectExportView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
