import { Link } from 'react-router-dom';
import { Rocket, TrendingUp, Lightbulb } from 'lucide-react';

const RoleCards = () => {
  const roles = [
    {
      icon: Rocket,
      title: 'For Entrepreneurs',
      description: 'Raise funds, find mentors, and pitch at live events.',
      color: 'primary',
      link: '/register',
    },
    {
      icon: TrendingUp,
      title: 'For Investors',
      description: 'Access vetted deal flow and track high-potential startups.',
      color: 'success',
      link: '/register',
    },
    {
      icon: Lightbulb,
      title: 'For Mentors',
      description: 'Give back to the community and shape the next unicorn.',
      color: 'primary',
      link: '/register',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Path
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're building, investing, or mentoring, we have a place for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isPrimary = role.color === 'primary';
            
            return (
              <Link
                key={index}
                to={role.link}
                className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary-600 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                    isPrimary
                      ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white'
                      : 'bg-success-100 text-success-600 group-hover:bg-success-600 group-hover:text-white'
                  } transition-all duration-300`}
                >
                  <Icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {role.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {role.description}
                </p>

                {/* Arrow Indicator */}
                <div
                  className={`mt-6 inline-flex items-center text-sm font-semibold ${
                    isPrimary ? 'text-primary-600' : 'text-success-600'
                  } group-hover:translate-x-2 transition-transform`}
                >
                  Get Started
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                {/* Decorative Corner */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 ${
                    isPrimary ? 'bg-primary-50' : 'bg-success-50'
                  } rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;




