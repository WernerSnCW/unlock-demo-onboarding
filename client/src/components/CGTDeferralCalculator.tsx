import { useState, useEffect } from 'react';
import { calcCGTDeferral, formatCurrency, formatPercentage, CGTDeferralInputs } from '../utils/calculators';

export default function CGTDeferralCalculator() {
  const [inputs, setInputs] = useState<CGTDeferralInputs>({
    mode: 'EIS_DEFERRAL',
    originalGain: 150000,
    subscription: 120000,
    dateOfDisposal: new Date('2024-06-01'),
    dateOfShareIssue: new Date('2024-12-01'),
    cgtRate: 0.20
  });

  const [result, setResult] = useState(calcCGTDeferral(inputs));

  useEffect(() => {
    setResult(calcCGTDeferral(inputs));
  }, [inputs]);

  const updateInput = (field: keyof CGTDeferralInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-3">
              Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="EIS_DEFERRAL"
                  checked={inputs.mode === 'EIS_DEFERRAL'}
                  onChange={(e) => updateInput('mode', e.target.value as 'EIS_DEFERRAL' | 'SEIS_REINVESTMENT')}
                  className="mr-2 text-[var(--primary)]"
                />
                <span className="text-sm">EIS Deferral Relief</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="SEIS_REINVESTMENT"
                  checked={inputs.mode === 'SEIS_REINVESTMENT'}
                  onChange={(e) => updateInput('mode', e.target.value as 'EIS_DEFERRAL' | 'SEIS_REINVESTMENT')}
                  className="mr-2 text-[var(--primary)]"
                />
                <span className="text-sm">SEIS Reinvestment (50% exemption)</span>
              </label>
            </div>
          </div>

          {/* Gain & Investment */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Gain & Investment</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Original Gain (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.originalGain}
                  onChange={(e) => updateInput('originalGain', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  {inputs.mode === 'EIS_DEFERRAL' ? 'EIS' : 'SEIS'} Subscription (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.subscription}
                  onChange={(e) => updateInput('subscription', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)]"
                />
                {inputs.mode === 'SEIS_REINVESTMENT' && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    SEIS limit: £200k invested → £100k gain exempt
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Timeline</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Date of Disposal
                </label>
                <input
                  type="date"
                  value={inputs.dateOfDisposal.toISOString().split('T')[0]}
                  onChange={(e) => updateInput('dateOfDisposal', new Date(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Date of Share Issue
                </label>
                <input
                  type="date"
                  value={inputs.dateOfShareIssue.toISOString().split('T')[0]}
                  onChange={(e) => updateInput('dateOfShareIssue', new Date(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)]"
                />
              </div>
              
              {inputs.mode === 'EIS_DEFERRAL' && (
                <div className={`text-xs p-2 rounded ${
                  result.windowPass 
                    ? 'bg-green-50 text-green-800 border-l-4 border-green-500' 
                    : 'bg-red-50 text-red-800 border-l-4 border-red-500'
                }`}>
                  {result.windowPass ? (
                    <span>✓ EIS window valid (1y before to 3y after disposal)</span>
                  ) : (
                    <span>✗ EIS deferral window is 1 year before to 3 years after disposal date</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CGT Rate */}
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
              Your CGT Rate
            </label>
            <div className="flex gap-3">
              {[0.10, 0.20].map(rate => (
                <label key={rate} className="flex items-center">
                  <input
                    type="radio"
                    name="cgtRate"
                    value={rate}
                    checked={inputs.cgtRate === rate}
                    onChange={(e) => updateInput('cgtRate', Number(e.target.value))}
                    className="mr-1 text-[var(--primary)]"
                  />
                  <span className="text-sm">{formatPercentage(rate * 100, 0)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          
          {/* Headline Result */}
          <div className="bg-[var(--primary)]/10 rounded-[var(--radius-md)] p-4 border-l-4 border-[var(--primary)]">
            <h4 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">
              Estimated CGT {inputs.mode === 'EIS_DEFERRAL' ? 'Deferred' : 'Saved'}
            </h4>
            <div className="text-2xl font-bold text-[var(--primary)]">
              {formatCurrency(result.cgtDeferredOrSaved)}
            </div>
          </div>

          {/* Breakdown Table */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Breakdown</h4>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
              <table className="w-full">
                <tbody className="text-sm">
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 text-[var(--muted-foreground)]">Original gain</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(result.breakdown.originalGain)}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 text-[var(--muted-foreground)]">Amount matched</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(result.breakdown.amountMatched)}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 text-[var(--muted-foreground)]">Rate used</td>
                    <td className="p-3 text-right font-medium">{formatPercentage(result.breakdown.rateUsed * 100, 0)}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 text-[var(--muted-foreground)]">
                      {inputs.mode === 'EIS_DEFERRAL' ? 'Deferred' : 'Exempted'}
                    </td>
                    <td className="p-3 text-right font-medium text-[var(--primary)]">{formatCurrency(result.breakdown.deferredOrExempted)}</td>
                  </tr>
                  <tr className="bg-[var(--muted)]">
                    <td className="p-3 font-semibold text-[var(--card-foreground)]">
                      {inputs.mode === 'EIS_DEFERRAL' ? 'Deferred until disposal' : 'Remaining gain'}
                    </td>
                    <td className="p-3 text-right font-bold">
                      {inputs.mode === 'EIS_DEFERRAL' ? 
                        formatCurrency(result.deferrableAmount ?? 0) : 
                        formatCurrency(result.remainingGain ?? 0)
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline for EIS */}
          {inputs.mode === 'EIS_DEFERRAL' && result.minHoldDate && (
            <div>
              <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-[var(--muted-foreground)] rounded-full"></div>
                  <span>{formatDate(inputs.dateOfDisposal)} - Disposal</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-3 h-3 rounded-full ${result.windowPass ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{formatDate(inputs.dateOfShareIssue)} - Share issue {result.windowPass ? '✓' : '✗'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-[var(--primary)] rounded-full"></div>
                  <span>{formatDate(result.minHoldDate)} - Minimum hold (3 years)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                  <div className="w-3 h-3 bg-[var(--warning)] rounded-full"></div>
                  <span>CGT due on disposal</span>
                </div>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span className="inline-block bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-xs font-medium">
              {inputs.mode === 'EIS_DEFERRAL' ? 'EIS Deferral' : 'SEIS Exemption'}
            </span>
            {inputs.mode === 'EIS_DEFERRAL' && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                result.windowPass 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                Window: {result.windowPass ? 'Valid' : 'Invalid'}
              </span>
            )}
          </div>

          {/* Validation Errors */}
          {result.validationErrors.length > 0 && (
            <div className="space-y-1">
              {result.validationErrors.map((error, index) => (
                <div key={index} className="text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 px-3 py-2 rounded border-l-4 border-[var(--destructive)]">
                  <i className="fas fa-exclamation-triangle mr-1" aria-hidden="true"></i>
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Worked Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--muted)] rounded-[var(--radius-md)] p-4 border-l-4 border-[var(--accent)]">
          <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-2">
            <i className="fas fa-calculator mr-2 text-[var(--accent)]" aria-hidden="true"></i>
            Example: EIS Deferral
          </h4>
          <div className="text-sm text-[var(--muted-foreground)] space-y-1">
            <p>Gain £150,000; invest £120,000; CGT 20%; share issue 6 months after disposal.</p>
            <p>Deferrable = £120,000; CGT deferred = £24,000;</p>
            <p><strong>Minimum hold date = issue + 3 years</strong></p>
          </div>
        </div>
        
        <div className="bg-[var(--muted)] rounded-[var(--radius-md)] p-4 border-l-4 border-[var(--accent)]">
          <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-2">
            <i className="fas fa-calculator mr-2 text-[var(--accent)]" aria-hidden="true"></i>
            Example: SEIS Reinvestment
          </h4>
          <div className="text-sm text-[var(--muted-foreground)] space-y-1">
            <p>Gain £180,000; invest £160,000 in SEIS; CGT 20%.</p>
            <p>Eligible = £160,000; Gain exempt = 50% × £160k = £80,000;</p>
            <p><strong>CGT saved = £16,000; Remaining gain = £100,000</strong></p>
          </div>
        </div>
      </div>

      {/* Tool Footnote */}
      <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
        <i className="fas fa-info-circle mr-1" aria-hidden="true"></i>
        Does not model detailed share identification rules or partial disposals. 
        Illustrative only - not financial advice.
      </div>
    </div>
  );
}