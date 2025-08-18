export default function FeaturesSection() {
  const features = [
    {
      icon: 'fas fa-folder',
      title: '/src/components',
      description: 'Reusable React components with TypeScript interfaces',
      files: ['Button.tsx', 'Modal.tsx', 'Layout.tsx'],
      iconBg: 'bg-[#646cff]/10',
      iconColor: 'text-[#646cff]'
    },
    {
      icon: 'fas fa-file-code',
      title: '/src/pages',
      description: 'Page components with React Router integration',
      files: ['Home.tsx', 'About.tsx', 'NotFound.tsx'],
      iconBg: 'bg-[#41d1ff]/10',
      iconColor: 'text-[#41d1ff]'
    },
    {
      icon: 'fas fa-palette',
      title: '/src/styles',
      description: 'CSS tokens and global styles with Tailwind CSS',
      files: ['tokens.css', 'globals.css', 'components.css'],
      iconBg: 'bg-[#10b981]/10',
      iconColor: 'text-[#10b981]'
    },
    {
      icon: 'fas fa-database',
      title: '/src/mocks',
      description: 'Mock data and API responses for development',
      files: ['users.json', 'api.ts', 'fixtures.ts'],
      iconBg: 'bg-[#f59e0b]/10',
      iconColor: 'text-[#f59e0b]'
    },
    {
      icon: 'fas fa-book',
      title: '/docs',
      description: 'Project documentation and development guides',
      files: ['setup.md', 'components.md', 'deployment.md'],
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600'
    },
    {
      icon: 'fas fa-cog',
      title: 'Configuration',
      description: 'TypeScript, Vite, and tooling configuration',
      files: ['vite.config.ts', 'tsconfig.json', 'tailwind.config.js'],
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Project Structure</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Clean, organized, and scalable architecture following modern best practices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className={`p-2 ${feature.iconBg} rounded-lg mr-3`}>
                  <i className={`${feature.icon} ${feature.iconColor}`}></i>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              </div>
              <p className="text-slate-600 text-sm mb-3">{feature.description}</p>
              <div className="text-xs text-slate-500 font-mono bg-white p-2 rounded border">
                {feature.files.map((file, index) => (
                  <div key={file}>{file}{index < feature.files.length - 1 ? <br /> : ''}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
