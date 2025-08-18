import { useState } from 'react';
import alertsData from '../mocks/alerts.json';

interface AlertsCentreProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertsCentre({ isOpen, onClose }: AlertsCentreProps) {
  const highPriorityAlerts = alertsData.filter(alert => alert.priority === 'high');
  
  const handleManageAlerts = () => {
    onClose();
    // Focus would jump to preferences panel on /news
    const preferencesPanel = document.querySelector('[data-preferences-panel]');
    if (preferencesPanel) {
      preferencesPanel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-[var(--card)] border-l border-[var(--border)] shadow-xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
              <i className="fas fa-bell mr-2 text-[var(--primary)]" aria-hidden="true"></i>
              Alerts Centre
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--muted)] rounded-[var(--radius-sm)] transition-colors"
              aria-label="Close alerts centre"
            >
              <i className="fas fa-times text-[var(--muted-foreground)]" aria-hidden="true"></i>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            
            {/* Recent Alerts */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-[var(--card-foreground)] mb-3">Recent Alerts</h3>
              <div className="space-y-3">
                {alertsData.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 bg-[var(--background)] rounded-[var(--radius-md)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.priority === 'high' 
                        ? 'bg-[var(--destructive)]' 
                        : 'bg-[var(--accent)]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--card-foreground)] line-clamp-2">
                        {alert.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {alert.timeAgo}
                        </span>
                        {alert.ticker && (
                          <span className="text-xs bg-[var(--primary)] text-[var(--primary-foreground)] px-1.5 py-0.5 rounded">
                            {alert.ticker}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Rules */}
            <div className="p-4 border-t border-[var(--border)]">
              <h3 className="text-sm font-medium text-[var(--card-foreground)] mb-3">Active Rules</h3>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--background)] rounded-[var(--radius-md)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--card-foreground)]">
                      Major regulatory filings
                    </span>
                    <div className="flex gap-1">
                      <span className="text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] px-2 py-1 rounded-full">
                        In-app
                      </span>
                      <span className="text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] px-2 py-1 rounded-full">
                        Email
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    EIS/SEIS updates, regulatory changes
                  </p>
                </div>
                
                <div className="p-3 bg-[var(--background)] rounded-[var(--radius-md)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--card-foreground)]">
                      Price movements &gt;5%
                    </span>
                    <div className="flex gap-1">
                      <span className="text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] px-2 py-1 rounded-full">
                        In-app
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    VOD.L, BARC.L, LLOY.L watchlist
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border)]">
            <button
              onClick={handleManageAlerts}
              className="w-full px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-md)] text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              Manage Alert Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
}