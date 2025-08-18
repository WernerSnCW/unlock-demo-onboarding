import { useState } from 'react';

export default function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Component Library</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Pre-built, accessible components ready for development.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Button Component */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Buttons</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-[#646cff] text-white rounded-lg font-medium hover:bg-[#646cff]/90 transition-colors duration-200">
                Primary Button
              </button>
              <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors duration-200">
                Secondary Button
              </button>
              <button className="w-full px-4 py-2 text-[#646cff] hover:text-[#646cff]/80 font-medium transition-colors duration-200">
                Text Button
              </button>
            </div>
          </div>

          {/* Form Component */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Form Elements</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Text input" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#646cff]/20 focus:border-[#646cff] outline-none transition-colors duration-200"
              />
              <select 
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#646cff]/20 focus:border-[#646cff] outline-none transition-colors duration-200"
              >
                <option value="">Select option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
              <textarea 
                placeholder="Textarea" 
                rows={2} 
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#646cff]/20 focus:border-[#646cff] outline-none transition-colors duration-200 resize-none"
              />
            </div>
          </div>

          {/* Card Component */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Cards</h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#646cff]/10 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-user text-[#646cff] text-sm"></i>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">John Doe</h4>
                  <p className="text-sm text-slate-600">Software Engineer</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">Sample card content with user information and status.</p>
            </div>
          </div>

          {/* Badge Component */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#10b981]/10 text-[#10b981]">Success</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f59e0b]/10 text-[#f59e0b]">Warning</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Error</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Info</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Default</span>
            </div>
          </div>

          {/* Loading Component */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Loading States</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#646cff] border-t-transparent"></div>
                <span className="text-sm text-slate-600">Loading...</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-[#646cff] h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#646cff] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#646cff] rounded-full animate-bounce animate-bounce-delayed-1"></div>
                <div className="w-2 h-2 bg-[#646cff] rounded-full animate-bounce animate-bounce-delayed-2"></div>
              </div>
            </div>
          </div>

          {/* Navigation Component */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Navigation</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-[#646cff] bg-[#646cff]/10 rounded-lg">
                <i className="fas fa-home mr-2"></i>
                Dashboard
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                <i className="fas fa-users mr-2"></i>
                Users
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                <i className="fas fa-cog mr-2"></i>
                Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
