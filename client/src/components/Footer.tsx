import { Link } from 'wouter';

export default function Footer() {
  const resourceLinks = [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '#' },
    { name: 'Examples', href: '#' },
    { name: 'Community', href: '#' }
  ];

  const supportLinks = [
    { name: 'Getting Started', href: '#' },
    { name: 'Troubleshooting', href: '#' },
    { name: 'Report Issues', href: '#' },
    { name: 'Contributing', href: '#' }
  ];

  const socialLinks = [
    { icon: 'fab fa-github', href: '#' },
    { icon: 'fab fa-twitter', href: '#' },
    { icon: 'fab fa-discord', href: '#' }
  ];

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <i className="fas fa-bolt text-[#646cff] text-xl"></i>
              <span className="text-xl font-bold">DevStack</span>
            </Link>
            <p className="text-slate-400 mb-4 max-w-md">
              A modern development stack built with Vite, React, and TypeScript. 
              Fast, scalable, and developer-friendly.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} className="text-slate-400 hover:text-white transition-colors duration-200">
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-slate-400">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('#') ? (
                    <a href={link.href} className="hover:text-white transition-colors duration-200">{link.name}</a>
                  ) : (
                    <Link href={link.href}>
                      <a className="hover:text-white transition-colors duration-200">{link.name}</a>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-white transition-colors duration-200">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2024 DevStack. Built with modern web technologies.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors duration-200">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
