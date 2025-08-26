import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

interface ChartData {
  date: string;
  index: number;
  yoyChange: number;
  averagePrice: number;
  detachedIndex: number;
  semiDetachedIndex: number;
  terracedIndex: number;
  flatIndex: number;
  monthlyChange: number;
  salesVolume: number;
}

interface PropertyChartsProps {
  trendData: ChartData[];
  propertyType?: string;
  geography: string;
  yoyChange: number;
  chartConfidence: string;
  chartConfidenceScore: number;
}

// Custom tooltip for better UX
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--card)] p-3 rounded-[var(--radius-sm)] border border-[var(--border)] shadow-lg">
        <p className="font-medium text-[var(--card-foreground)]">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Regional HPI Sparkline
export const RegionalSparkline: React.FC<{ data: ChartData[]; yoyChange: number }> = ({ data, yoyChange }) => {
  // Sort data by date and take the last 60 months chronologically
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last60Months = sortedData.slice(-60); // Take the most recent 60 months
  
  return (
    <div className="h-32 w-full min-h-0">
      <ResponsiveContainer width="100%" height={120} minWidth={0} minHeight={0}>
        <LineChart data={last60Months} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="index" 
            stroke="var(--primary)" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-xs text-center mt-1 text-[var(--muted-foreground)]">
        5-year HPI trend • Latest: {yoyChange >= 0 ? '+' : ''}{yoyChange.toFixed(1)}% YoY
      </div>
    </div>
  );
};

// 2. Property Type Comparison
export const PropertyTypeComparison: React.FC<{ data: ChartData[]; userPropertyType?: string }> = ({ data, userPropertyType }) => {
  // Sort data by date and take the last 36 months chronologically
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last36Months = sortedData.slice(-36);
  const userType = userPropertyType?.toLowerCase();
  
  // Check if we have property type data
  const hasPropertyTypeData = last36Months.some(d => 
    d.detachedIndex > 0 || d.semiDetachedIndex > 0 || d.terracedIndex > 0 || d.flatIndex > 0
  );

  if (!hasPropertyTypeData) {
    return (
      <div className="h-48 flex items-center justify-center bg-[var(--muted)]/50 rounded-[var(--radius-sm)]">
        <div className="text-center text-[var(--muted-foreground)]">
          <i className="fas fa-info-circle text-lg mb-2"></i>
          <p className="text-sm">Property type breakdown not available for this region</p>
          <p className="text-xs">Using overall regional index instead</p>
        </div>
      </div>
    );
  }
  
  const getTypeKey = (type: string) => {
    switch (type) {
      case 'detached': return 'detachedIndex';
      case 'semi-detached': return 'semiDetachedIndex'; 
      case 'terraced': return 'terracedIndex';
      case 'flat': case 'apartment': return 'flatIndex';
      default: return 'index';
    }
  };

  const userTypeKey = userType ? getTypeKey(userType) : 'index';
  
  return (
    <div className="h-48 min-h-0">
      <div className="mb-2 flex items-center justify-between">
        <h6 className="text-sm font-medium text-[var(--card-foreground)]">Property Type Performance</h6>
        {userType && (
          <span className="text-xs px-2 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full">
            Your type: {userType}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={170} minWidth={0} minHeight={0}>
        <LineChart data={last36Months} margin={{ top: 5, right: 30, left: 5, bottom: 35 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="detachedIndex" 
            stroke="#8884d8" 
            strokeWidth={userTypeKey === 'detachedIndex' ? 3 : 1}
            name="Detached"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="semiDetachedIndex" 
            stroke="#82ca9d" 
            strokeWidth={userTypeKey === 'semiDetachedIndex' ? 3 : 1}
            name="Semi-Detached"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="terracedIndex" 
            stroke="#ffc658" 
            strokeWidth={userTypeKey === 'terracedIndex' ? 3 : 1}
            name="Terraced"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="flatIndex" 
            stroke="#ff7300" 
            strokeWidth={userTypeKey === 'flatIndex' ? 3 : 1}
            name="Flat"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. YoY Change Bars (Market Pulse)
export const MarketPulseBars: React.FC<{ data: ChartData[]; currentYoY: number }> = ({ data, currentYoY }) => {
  // Sort data by date and take the last 24 months chronologically
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last24Months = sortedData.slice(-24);
  
  return (
    <div className="h-32 min-h-0">
      <div className="mb-2">
        <h6 className="text-sm font-medium text-[var(--card-foreground)]">Market Pulse</h6>
        <p className="text-xs text-[var(--muted-foreground)]">
          Regional prices {currentYoY >= 0 ? '+' : ''}{currentYoY.toFixed(1)}% YoY
        </p>
      </div>
      <ResponsiveContainer width="100%" height={90} minWidth={0} minHeight={0}>
        <BarChart data={last24Months} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
          <Bar 
            dataKey="yoyChange" 
            fill="var(--primary)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Average Price vs Index (Dual View)
export const DualPriceIndexView: React.FC<{ data: ChartData[] }> = ({ data }) => {
  // Sort data by date and take the last 36 months chronologically
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last36Months = sortedData.slice(-36);
  
  // Check if we have price data
  const hasPriceData = last36Months.some(d => d.averagePrice > 0);
  const hasIndexData = last36Months.some(d => d.index > 0);

  if (!hasPriceData && !hasIndexData) {
    return (
      <div className="h-32 flex items-center justify-center bg-[var(--muted)]/50 rounded-[var(--radius-sm)]">
        <div className="text-center text-[var(--muted-foreground)]">
          <i className="fas fa-info-circle text-lg mb-2"></i>
          <p className="text-sm">Price and index data not available for detailed analysis</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 gap-4 h-32 min-h-0">
      <div>
        <h6 className="text-xs font-medium text-[var(--card-foreground)] mb-1">Average Price (£)</h6>
        {hasPriceData ? (
          <ResponsiveContainer width="100%" height={100} minWidth={0} minHeight={0}>
            <LineChart data={last36Months} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="averagePrice" 
                stroke="var(--primary)" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[100px] flex items-center justify-center bg-[var(--muted)]/30 rounded">
            <span className="text-xs text-[var(--muted-foreground)]">No price data</span>
          </div>
        )}
      </div>
      <div>
        <h6 className="text-xs font-medium text-[var(--card-foreground)] mb-1">Index (2015=100)</h6>
        {hasIndexData ? (
          <ResponsiveContainer width="100%" height={100} minWidth={0} minHeight={0}>
            <LineChart data={last36Months} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="index" 
                stroke="var(--secondary)" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[100px] flex items-center justify-center bg-[var(--muted)]/30 rounded">
            <span className="text-xs text-[var(--muted-foreground)]">No index data</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Confidence Badge
export const ConfidenceBadge: React.FC<{ confidence: string; score: number }> = ({ confidence, score }) => {
  const badgeColor = confidence === 'High' 
    ? 'bg-[var(--success)]/20 text-[var(--success)]' 
    : confidence === 'Medium'
    ? 'bg-[var(--warning)]/20 text-[var(--warning)]'
    : 'bg-[var(--destructive)]/20 text-[var(--destructive)]';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
      <i className="fas fa-chart-line"></i>
      Chart Confidence: {confidence} ({score}/5)
    </div>
  );
};

// Main Property Charts Component
const PropertyCharts: React.FC<PropertyChartsProps> = ({ 
  trendData, 
  propertyType, 
  geography, 
  yoyChange, 
  chartConfidence, 
  chartConfidenceScore 
}) => {
  if (!trendData || trendData.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted-foreground)]">
        <i className="fas fa-chart-line text-2xl mb-2"></i>
        <p>No trend data available for charting</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Confidence Badge */}
      <div className="flex justify-center">
        <ConfidenceBadge confidence={chartConfidence} score={chartConfidenceScore} />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Regional Sparkline */}
        <div className="p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)] min-h-0">
          <h5 className="font-medium text-[var(--card-foreground)] mb-2 text-sm">
            Regional HPI Trend - {geography}
          </h5>
          <RegionalSparkline data={trendData} yoyChange={yoyChange} />
        </div>

        {/* Market Pulse */}
        <div className="p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)] min-h-0">
          <MarketPulseBars data={trendData} currentYoY={yoyChange} />
        </div>
      </div>

      {/* Property Type Comparison */}
      <div className="p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)] min-h-0">
        <PropertyTypeComparison data={trendData} userPropertyType={propertyType} />
      </div>

      {/* Dual Price/Index View */}
      <div className="p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)] min-h-0">
        <h5 className="font-medium text-[var(--card-foreground)] mb-2 text-sm">
          Price vs Index Analysis
        </h5>
        <DualPriceIndexView data={trendData} />
        <p className="text-xs text-[var(--muted-foreground)] mt-2">
          Left: Actual prices in £ • Right: Index values (2015=100 baseline)
        </p>
      </div>
    </div>
  );
};

export default PropertyCharts;