import { useState, useEffect } from 'react';
import { calcLossRelief, formatCurrency, formatPercentage, LossReliefInputs } from '../utils/calculators';

export default function LossReliefCalculator() {
  const [inputs, setInputs] = useState<LossReliefInputs>({
    scheme: 'EIS',
    subscription: 10000,
    saleProceeds: 0,
    offsetType: 'income',
    marginalIncomeRate: 0.45,
    cgtRate: 0.20
  });

  const [result, setResult] = useState(calcLossRelief(inputs));

  useEffect(() => {
    setResult(calcLossRelief(inputs));
  }, [inputs]);

  const updateInput = (field: keyof LossReliefInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          
          {/* Scheme Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-3">
              Scheme
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheme"
                  value="EIS"
                  checked={inputs.scheme === 'EIS'}
                  onChange={(e) => updateInput('scheme', e.target.value as 'EIS' | 'SEIS')}
                  className="mr-2 text-[var(--primary)]"
                />
                <span className="text-sm">EIS</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheme"
                  value="SEIS"
                  checked={inputs.scheme === 'SEIS'}
                  onChange={(e) => updateInput('scheme', e.target.value as 'EIS' | 'SEIS')}
                  className="mr-2 text-[var(--primary)]"
                />
                <span className="text-sm">SEIS</span>
              </label>
            </div>
          </div>

          {/* Investment Details */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Investment Details</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Subscription Amount (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.subscription}
                  onChange={(e) => updateInput('subscription', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Sale Proceeds (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.saleProceeds}
                  onChange={(e) => updateInput('saleProceeds', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)]"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Enter £0 if company failed
                </p>
              </div>
            </div>
          </div>

          {/* Upfront Relief */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Upfront Relief</h4>
            <div>
              <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                Actually Claimed (£)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={inputs.upfrontReliefActuallyClaimed ?? (inputs.subscription * (inputs.scheme === 'EIS' ? 0.30 : 0.50))}
                onChange={(e) => updateInput('upfrontReliefActuallyClaimed', Number(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)]"
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Default: {formatPercentage((inputs.scheme === 'EIS' ? 30 : 50), 0)} × subscription
              </p>
            </div>
          </div>

          {/* Offset Against */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Offset Against</h4>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="offsetType"
                    value="income"
                    checked={inputs.offsetType === 'income'}
                    onChange={(e) => updateInput('offsetType', e.target.value as 'income' | 'cgt')}
                    className="mr-2 text-[var(--primary)]"
                  />
                  <span className="text-sm">Income Tax</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="offsetType"
                    value="cgt"
                    checked={inputs.offsetType === 'cgt'}
                    onChange={(e) => updateInput('offsetType', e.target.value as 'income' | 'cgt')}
                    className="mr-2 text-[var(--primary)]"
                  />
                  <span className="text-sm">Capital Gains Tax</span>
                </label>
              </div>

              {inputs.offsetType === 'income' ? (
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    Marginal Income Tax Rate
                  </label>
                  <div className="flex gap-3">
                    {[0.20, 0.40, 0.45].map(rate => (
                      <label key={rate} className="flex items-center">
                        <input
                          type="radio"
                          name="marginalIncomeRate"
                          value={rate}
                          checked={inputs.marginalIncomeRate === rate}
                          onChange={(e) => updateInput('marginalIncomeRate', Number(e.target.value))}
                          className="mr-1 text-[var(--primary)]"
                        />
                        <span className="text-sm">{formatPercentage(rate * 100, 0)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    CGT Rate
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
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          
          {/* Headline Result */}
          <div className="bg-[var(--primary)]/10 rounded-[var(--radius-md)] p-4 border-l-4 border-[var(--primary)]">
            <h4 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">
              Net Loss After Tax Relief
            </h4>
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">
              {formatCurrency(result.netLossAfterAllRelief)}
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Reduction of {formatPercentage(result.reductionPct)} vs gross loss
            </p>
          </div>

          {/* Breakdown Table */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Breakdown</h4>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
              <table className="w-full">
                <tbody className="text-sm">
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 text-[var(--muted-foreground)]">Subscription</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(result.breakdown.subscription)}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 text-[var(--muted-foreground)]">Upfront relief</td>
                    <td className="p-3 text-right font-medium text-green-600">-{formatCurrency(result.breakdown.upfrontRelief)}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 text-[var(--muted-foreground)]">Sale proceeds</td>
                    <td className="p-3 text-right font-medium text-green-600">-{formatCurrency(result.breakdown.proceeds)}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 text-[var(--muted-foreground)]">Effective loss</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(result.breakdown.effectiveLoss)}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 text-[var(--muted-foreground)]">
                      {inputs.offsetType === 'income' ? 'Income tax' : 'CGT'} relief 
                      ({formatPercentage(result.breakdown.chosenRate * 100, 0)})
                    </td>
                    <td className="p-3 text-right font-medium text-green-600">-{formatCurrency(result.breakdown.lossReliefValue)}</td>
                  </tr>
                  <tr className="bg-[var(--muted)]">
                    <td className="p-3 font-semibold text-[var(--card-foreground)]">Final net loss</td>
                    <td className="p-3 text-right font-bold text-[var(--primary)]">{formatCurrency(result.breakdown.finalNetLoss)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            <span className="inline-block bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-xs font-medium">
              {inputs.scheme}
            </span>
            <span className="inline-block bg-[var(--secondary)]/10 text-[var(--secondary)] px-3 py-1 rounded-full text-xs font-medium">
              Offset: {inputs.offsetType === 'income' ? 'Income' : 'CGT'}
            </span>
          </div>

          {/* Info Note */}
          <div className="bg-[var(--info)]/10 rounded-[var(--radius-md)] p-3 border-l-4 border-[var(--info)]">
            <p className="text-xs text-[var(--muted-foreground)]">
              <i className="fas fa-info-circle text-[var(--info)] mr-1" aria-hidden="true"></i>
              Choosing CGT vs income offset depends on your circumstances; this tool does not optimize for you.
            </p>
          </div>
        </div>
      </div>

      {/* Worked Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--muted)] rounded-[var(--radius-md)] p-4 border-l-4 border-[var(--accent)]">
          <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-2">
            <i className="fas fa-calculator mr-2 text-[var(--accent)]" aria-hidden="true"></i>
            Example: EIS, 45% taxpayer
          </h4>
          <div className="text-sm text-[var(--muted-foreground)] space-y-1">
            <p>Subscription £10,000; proceeds £0. Upfront 30% = £3,000.</p>
            <p>Effective loss = £7,000. Loss relief = £7,000 × 45% = £3,150.</p>
            <p><strong>Net loss = £3,850 (61.5% reduction)</strong></p>
          </div>
        </div>
        
        <div className="bg-[var(--muted)] rounded-[var(--radius-md)] p-4 border-l-4 border-[var(--accent)]">
          <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-2">
            <i className="fas fa-calculator mr-2 text-[var(--accent)]" aria-hidden="true"></i>
            Example: SEIS, 20% taxpayer
          </h4>
          <div className="text-sm text-[var(--muted-foreground)] space-y-1">
            <p>Subscription £20,000; proceeds £5,000. Upfront 50% = £10,000.</p>
            <p>Effective loss = £5,000. Loss relief = £5,000 × 20% = £1,000.</p>
            <p><strong>Net loss = £4,000</strong></p>
          </div>
        </div>
      </div>

      {/* Tool Footnote */}
      <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
        <i className="fas fa-info-circle mr-1" aria-hidden="true"></i>
        Assumes qualifying loss with no disqualifying events. Ignores disposal costs and time value. 
        Illustrative only - not financial advice.
      </div>
    </div>
  );
}