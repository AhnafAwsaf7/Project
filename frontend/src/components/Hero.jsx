import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-success-50 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              The Ecosystem Where{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Ideas Meet Capital
              </span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Connect with verified investors, find expert mentors, and launch your startup journey. 
              All in one secure platform.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all"
              >
                Explore Campaigns
                <TrendingUp className="ml-2 w-5 h-5" />
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary-600 rounded-full" />
                <span>Verified Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary-600 rounded-full" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary-600 rounded-full" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </div>

      {/* Trust Bar - Social Proof */}
      <div className="mt-20 border-t border-slate-200 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-600 mb-6">Trusted by top innovators</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
            {/* Placeholder logos - using text for now */}
            <div className="text-2xl font-bold text-slate-400">TechCorp</div>
            <div className="text-2xl font-bold text-slate-400">InnovateLab</div>
            <div className="text-2xl font-bold text-slate-400">VentureHub</div>
            <div className="text-2xl font-bold text-slate-400">StartupX</div>
            <div className="text-2xl font-bold text-slate-400">GrowthFund</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

