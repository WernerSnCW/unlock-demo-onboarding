export default function TechnicalSpecs() {
  const techStack = [
    { label: 'Build Tool', value: 'Vite 5.x', color: 'text-[#646cff]' },
    { label: 'Framework', value: 'React 18.x', color: 'text-[#41d1ff]' },
    { label: 'Language', value: 'TypeScript 5.x', color: 'text-blue-600' },
    { label: 'Routing', value: 'React Router 6.x', color: 'text-slate-700' },
    { label: 'Styling', value: 'Tailwind CSS 3.x', color: 'text-cyan-600' }
  ];

  const features = [
    {
      icon: 'fas fa-lightning',
      iconColor: 'text-[#f59e0b]',
      title: 'Lightning Fast',
      description: 'Instant HMR and optimized build times'
    },
    {
      icon: 'fas fa-shield-alt',
      iconColor: 'text-blue-600',
      title: 'Type Safety',
      description: 'Full TypeScript integration with strict mode'
    },
    {
      icon: 'fas fa-mobile-alt',
      iconColor: 'text-purple-600',
      title: 'Mobile First',
      description: 'Responsive design with Tailwind utilities'
    },
    {
      icon: 'fas fa-tools',
      iconColor: 'text-slate-600',
      title: 'Developer Experience',
      description: 'Hot reload, error boundaries, and dev tools'
    }
  ];

  const commands = [
    {
      comment: '# Install dependencies',
      command: 'npm install'
    },
    {
      comment: '# Start development server',
      command: 'npm run dev'
    },
    {
      comment: '# Build for production',
      command: 'npm run build'
    },
    {
      comment: '# Type checking',
      command: 'npm run type-check'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Technical Specifications</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Modern development stack with best practices built-in.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Development Stack */}
          <div className="bg-slate-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <i className="fas fa-code mr-3 text-[#646cff]"></i>
              Development Stack
            </h3>
            <div className="space-y-4">
              {techStack.map((tech) => (
                <div key={tech.label} className="flex items-center justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">{tech.label}</span>
                  <span className={`${tech.color} font-semibold`}>{tech.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features & Benefits */}
          <div className="bg-slate-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <i className="fas fa-check-circle mr-3 text-[#10b981]"></i>
              Features & Benefits
            </h3>
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start">
                  <i className={`${feature.icon} ${feature.iconColor} mt-1 mr-3`}></i>
                  <div>
                    <h4 className="font-medium text-slate-900">{feature.title}</h4>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Command Line Instructions */}
        <div className="mt-12 bg-slate-900 rounded-xl p-8 text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <i className="fas fa-terminal mr-3 text-[#10b981]"></i>
            Quick Start Commands
          </h3>
          <div className="space-y-4 font-mono text-sm">
            {commands.map((cmd, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-4">
                <div className="text-slate-400 mb-2">{cmd.comment}</div>
                <div className="text-[#10b981]">{cmd.command}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
