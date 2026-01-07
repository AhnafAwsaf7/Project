import LandingNavbar from '../components/LandingNavbar';
import Hero from '../components/Hero';
import RoleCards from '../components/RoleCards';
import FeatureSection from '../components/FeatureSection';
import StatsCounter from '../components/StatsCounter';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />
      <main>
        <Hero />
        <RoleCards />
        <FeatureSection />
        <StatsCounter />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
