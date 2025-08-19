interface AssessmentSection {
  score: number;
  status: string;
  keyPoints: string[];
  concerns: string[];
}

interface DetailedAssessment {
  company: AssessmentSection;
  complianceCheck: AssessmentSection;
  fraudRisk: AssessmentSection;
  financialHealth: AssessmentSection;
  management: AssessmentSection;
  marketing: AssessmentSection;
  claimsManagement: AssessmentSection;
  investorValidation: AssessmentSection;
}

interface DetailedSnapshotProps {
  assessment: DetailedAssessment;
}

export function DetailedSnapshot({ assessment }: DetailedSnapshotProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'very low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'strong':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'good':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'watch':
      case 'moderate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'company': return 'fas fa-building';
      case 'complianceCheck': return 'fas fa-shield-alt';
      case 'fraudRisk': return 'fas fa-exclamation-triangle';
      case 'financialHealth': return 'fas fa-chart-line';
      case 'management': return 'fas fa-users';
      case 'marketing': return 'fas fa-bullhorn';
      case 'claimsManagement': return 'fas fa-gavel';
      case 'investorValidation': return 'fas fa-handshake';
      default: return 'fas fa-info-circle';
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'company': return 'Company';
      case 'complianceCheck': return 'Compliance Check';
      case 'fraudRisk': return 'Fraud Risk Assessment';
      case 'financialHealth': return 'Financial Health';
      case 'management': return 'Management';
      case 'marketing': return 'Marketing & Brand Management';
      case 'claimsManagement': return 'Claims Management';
      case 'investorValidation': return 'Investor Validation';
      default: return section;
    }
  };

  const sections = Object.entries(assessment);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#5193B3] to-[#62C4C3] rounded-lg flex items-center justify-center">
          <i className="fas fa-clipboard-check text-white" aria-hidden="true"></i>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Detailed Due Diligence Assessment
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive analysis across 8 key investment criteria
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map(([sectionKey, section]) => (
          <div 
            key={sectionKey}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <i className={`${getSectionIcon(sectionKey)} text-[#5193B3]`} aria-hidden="true"></i>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {getSectionTitle(sectionKey)}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getScoreColor(section.score)}`}>
                  {section.score}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(section.status)}`}>
                  {section.status}
                </span>
              </div>
            </div>

            {/* Key Points */}
            {section.keyPoints.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Strengths
                </h4>
                <ul className="space-y-1">
                  {section.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <i className="fas fa-check text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true"></i>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {section.concerns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Areas for Consideration
                </h4>
                <ul className="space-y-1">
                  {section.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <i className="fas fa-exclamation-circle text-yellow-500 mt-0.5 flex-shrink-0" aria-hidden="true"></i>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No concerns message */}
            {section.concerns.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <i className="fas fa-shield-check" aria-hidden="true"></i>
                <span>No significant concerns identified</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}