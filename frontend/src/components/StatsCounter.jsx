import { useState, useEffect, useRef } from 'react';

const StatsCounter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const stats = [
    { value: 500, suffix: '+', label: 'Entrepreneurs', color: 'primary' },
    { value: 2, suffix: 'M+', label: 'Funds Raised', color: 'success' },
    { value: 100, suffix: '+', label: 'Verified Mentors', color: 'primary' },
    { value: 50, suffix: '+', label: 'Live Events Hosted', color: 'success' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const Counter = ({ end, suffix, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let startTime = null;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return (
      <span>
        {count}
        {suffix}
      </span>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-r from-primary-600 to-success-500"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center text-white"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-lg sm:text-xl text-white/90 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;




