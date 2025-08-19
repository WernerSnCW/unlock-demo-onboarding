import Logo from './Logo';

interface NewsletterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsItems: any[];
  frequency: string;
}

export default function NewsletterPreviewModal({ 
  isOpen, 
  onClose, 
  newsItems, 
  frequency 
}: NewsletterPreviewModalProps) {
  if (!isOpen) return null;

  const topItems = newsItems.slice(0, 3);
  const today = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        aria-hidden="true"
      >
        {/* Modal */}
        <div 
          className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="newsletter-preview-title"
          aria-modal="true"
        >
          
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-gray-50">
            <h2 id="newsletter-preview-title" className="text-lg font-semibold text-gray-800">
              Newsletter Preview
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              aria-label="Close newsletter preview"
            >
              <i className="fas fa-times text-gray-600" aria-hidden="true"></i>
            </button>
          </div>

          {/* Newsletter Email Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            
            {/* Email Header with Branding */}
            <div className="bg-white border-b-2 border-[#F8D49B] p-6">
              <div className="mb-2">
                <Logo variant="email" />
              </div>
              <div className="h-1 bg-[#F8D49B] w-full"></div>
            </div>

            {/* Email Body */}
            <div className="bg-white p-6">
              
              {/* Personalized Greeting */}
              <div className="mb-8">
                <p className="text-lg text-gray-800 mb-1">
                  Hello Thomas, here's your <strong>weekly investment intelligence</strong> update.
                </p>
                <p className="text-sm text-gray-600">
                  Week of {today}
                </p>
              </div>

              <div className="flex gap-8">
                {/* Main Content */}
                <div className="flex-1">
                  
                  {/* Top Stories Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-[#62C4C3] mb-1 border-b border-gray-200 pb-2">
                      Top Stories
                    </h2>
                    <div className="space-y-6 mt-4">
                      {topItems.map((item, index) => (
                        <div key={item.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                          <div className="flex gap-4">
                            <div className="w-8 h-8 bg-[#5193B3] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight hover:text-[#5193B3] cursor-pointer">
                                <a href="#" className="text-decoration-line: underline">
                                  {item.title}
                                </a>
                              </h3>
                              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                                {item.summary}
                              </p>
                              <div className="bg-gray-50 p-3 rounded border-l-4 border-[#F8D49B] mb-3">
                                <p className="text-xs font-medium text-gray-800 mb-1">
                                  <i className="fas fa-lightbulb text-[#F8D49B] mr-1" aria-hidden="true"></i>
                                  Why this matters
                                </p>
                                <p className="text-xs text-gray-600">
                                  Relevant to: {item.sector}, {item.tags?.slice(0, 2).join(', ')} • Impact: Medium Risk
                                </p>
                              </div>
                              <div className="text-xs text-gray-500">
                                <span>{item.source}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(item.publishedAt || item.dateISO).toLocaleDateString('en-GB')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Sidebar */}
                <div className="w-72 bg-gray-50 p-4 border-l border-gray-200">
                  
                  {/* Market Snapshot */}
                  <div className="mb-6">
                    <h3 className="text-md font-bold text-[#62C4C3] mb-3 border-b border-gray-300 pb-1">
                      📊 Market Snapshot
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">FTSE 100</span>
                        <span className="text-green-600 font-medium">+0.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GBP/USD</span>
                        <span className="text-gray-800 font-medium">1.2845</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gold</span>
                        <span className="text-red-600 font-medium">-0.2%</span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="mb-6">
                    <h3 className="text-md font-bold text-[#62C4C3] mb-3 border-b border-gray-300 pb-1">
                      🔔 Upcoming Events
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-800">HMRC EIS Changes Webinar</p>
                        <p className="text-xs text-gray-600">Thursday, 2:00 PM</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Fintech Investment Panel</p>
                        <p className="text-xs text-gray-600">Next Monday, 9:30 AM</p>
                      </div>
                    </div>
                  </div>

                  {/* Your Portfolio */}
                  <div>
                    <h3 className="text-md font-bold text-[#62C4C3] mb-3 border-b border-gray-300 pb-1">
                      💼 Your Focus
                    </h3>
                    <div className="space-y-1 text-xs">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1">Fintech</span>
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-1 mb-1">Biotech</span>
                      <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded mr-1 mb-1">EIS/SEIS</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Newsletter Footer */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center bg-gray-50 -mx-6 px-6 py-6">
                <div className="space-y-3">
                  <div className="flex justify-center gap-6 text-sm">
                    <a href="#" className="text-[#5193B3] hover:underline font-medium">
                      Update your interests
                    </a>
                    <a href="#" className="text-[#5193B3] hover:underline font-medium">
                      Alert frequency
                    </a>
                    <a href="#" className="text-gray-600 hover:underline">
                      Unsubscribe
                    </a>
                  </div>
                  
                  <div className="text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    <p className="mb-2">
                      <strong>Disclaimer:</strong> This newsletter is for informational purposes only. 
                      Unlock does not provide financial advice. All investment decisions should be made 
                      in consultation with qualified financial advisors.
                    </p>
                    <p>
                      © 2025 Unlock Investment Intelligence. All rights reserved. 
                      This email was sent to thomas@example.com because you subscribed to our investment updates.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-300 bg-gray-50">
            <p className="text-sm text-gray-600">
              This preview shows how your newsletter will look in email
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#5193B3] text-white rounded-md text-sm font-medium hover:bg-[#4A8399] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5193B3] focus:ring-offset-2"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </>
  );
}