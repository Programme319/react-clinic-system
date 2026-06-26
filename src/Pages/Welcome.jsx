import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Users, 
  Globe, 
  Clock, 
  TrendingUp,
  Check
} from 'lucide-react';

export default function Welcome({ auth }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'Welcome - My App';
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold tracking-tight">
              MyApp
            </Link>
            
            <div className="flex items-center gap-6">
              {auth?.user ? (
                <Link
                  to="/dashboard"
                  className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Build amazing things{' '}
            <span className="text-slate-400">faster than ever</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            A powerful platform that helps you ship products people love. 
            No complexity, no compromises.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Start Building Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
          </div>
          
          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-6">
              Trusted by 10,000+ teams worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-slate-300 text-sm font-semibold">
              {['Vercel', 'Stripe', 'Notion', 'Linear', 'Figma'].map((brand) => (
                <span key={brand} className="hover:text-slate-400 transition-colors">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <div className="pt-12 pb-8 px-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-48 bg-white rounded-xl border border-slate-200 shadow-sm" />
                <div className="h-48 bg-white rounded-xl border border-slate-200 shadow-sm" />
                <div className="h-32 bg-white rounded-xl border border-slate-200 shadow-sm" />
                <div className="col-span-2 h-32 bg-white rounded-xl border border-slate-200 shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              We've built the essential tools so you can focus on what matters — building great products.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-5 h-5 text-amber-600" />,
                title: 'Lightning Fast',
                desc: 'Optimized for speed with edge caching and a global CDN. Your users never wait.'
              },
              {
                icon: <Shield className="w-5 h-5 text-emerald-600" />,
                title: 'Enterprise Security',
                desc: 'SOC 2 certified with end-to-end encryption. Your data is always protected.'
              },
              {
                icon: <Users className="w-5 h-5 text-blue-600" />,
                title: 'Built for Teams',
                desc: 'Real-time collaboration with role-based access and detailed audit logs.'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Active Users', icon: <Users className="w-4 h-4" /> },
              { value: '99.9%', label: 'Uptime SLA', icon: <Clock className="w-4 h-4" /> },
              { value: '150+', label: 'Countries', icon: <Globe className="w-4 h-4" /> },
              { value: '<50ms', label: 'Avg Response', icon: <TrendingUp className="w-4 h-4" /> }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-400 mb-10 max-w-md mx-auto">
            Join thousands of developers and teams building the next generation of web applications.
          </p>
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            No credit card required. Free forever for personal projects.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <Link to="/" className="text-xl font-bold tracking-tight inline-block mb-4">
                MyApp
              </Link>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                Building the future of web development. Open source and free forever.
              </p>
            </div>
            
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Changelog', 'Docs']
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Press']
              },
              {
                title: 'Resources',
                links: ['Community', 'Support', 'Status', 'Security']
              }
            ].map((group, i) => (
              <div key={i}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link 
                        to={`/${link.toLowerCase()}`}
                        className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} MyApp. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <Link 
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}