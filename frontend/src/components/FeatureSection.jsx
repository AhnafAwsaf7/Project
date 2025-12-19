import { Shield, Video, Users } from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Verified Trust',
      description:
        'Our robust verification system ensures that every entrepreneur, investor, and mentor on the platform is legitimate. Submit documents or verify your domain to build credibility and unlock advanced features.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      color: 'primary',
      reverse: false,
    },
    {
      icon: Video,
      title: 'Live Pitch Events',
      description:
        'Join virtual pitch events where entrepreneurs showcase their ideas to a curated audience of investors. Network in real-time, ask questions, and discover the next big thing in your industry.',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
      color: 'success',
      reverse: true,
    },
    {
      icon: Users,
      title: 'Direct Networking',
      description:
        'Connect directly with investors, mentors, and fellow entrepreneurs. Send partnership inquiries, request mentorship, and build meaningful relationships that drive your startup forward.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      color: 'primary',
      reverse: false,
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose StartupConnect?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to grow your startup, all in one platform
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isPrimary = feature.color === 'primary';
            const isReverse = feature.reverse;

            return (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  isReverse ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* Image */}
                <div
                  className={`relative ${
                    isReverse ? 'lg:col-start-2' : ''
                  }`}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${
                        isPrimary
                          ? 'from-primary-900/20 to-transparent'
                          : 'from-success-900/20 to-transparent'
                      }`}
                    />
                  </div>
                  
                  {/* Decorative Element */}
                  <div
                    className={`absolute -bottom-6 -right-6 w-32 h-32 ${
                      isPrimary ? 'bg-primary-100' : 'bg-success-100'
                    } rounded-full -z-10`}
                  />
                </div>

                {/* Content */}
                <div className={`${isReverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 ${
                      isPrimary
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-success-100 text-success-600'
                    }`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>

                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Feature List */}
                  <ul className="mt-6 space-y-3">
                    {feature.title === 'Verified Trust' && (
                      <>
                        <li className="flex items-start">
                          <svg
                            className={`w-5 h-5 ${
                              isPrimary ? 'text-primary-600' : 'text-success-600'
                            } mr-3 mt-0.5 flex-shrink-0`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">
                            Document verification for businesses
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className={`w-5 h-5 ${
                              isPrimary ? 'text-primary-600' : 'text-success-600'
                            } mr-3 mt-0.5 flex-shrink-0`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">
                            Domain verification for investors
                          </span>
                        </li>
                      </>
                    )}
                    {feature.title === 'Live Pitch Events' && (
                      <>
                        <li className="flex items-start">
                          <svg
                            className={`w-5 h-5 ${
                              isPrimary ? 'text-primary-600' : 'text-success-600'
                            } mr-3 mt-0.5 flex-shrink-0`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">
                            Real-time virtual meetings
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className={`w-5 h-5 ${
                              isPrimary ? 'text-primary-600' : 'text-success-600'
                            } mr-3 mt-0.5 flex-shrink-0`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">
                            Track attendance and engagement
                          </span>
                        </li>
                      </>
                    )}
                    {feature.title === 'Direct Networking' && (
                      <>
                        <li className="flex items-start">
                          <svg
                            className={`w-5 h-5 ${
                              isPrimary ? 'text-primary-600' : 'text-success-600'
                            } mr-3 mt-0.5 flex-shrink-0`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">
                            Send partnership and funding inquiries
                          </span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className={`w-5 h-5 ${
                              isPrimary ? 'text-primary-600' : 'text-success-600'
                            } mr-3 mt-0.5 flex-shrink-0`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">
                            Request mentorship from experts
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;




