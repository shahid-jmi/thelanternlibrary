import Divider from '@/app/components/Divider';
import HeroSection from './home/HeroSection';
import FeaturedBooksSection from './home/FeaturedBooksSection';
import FeaturedProductsSection from './home/FeaturedProductsSection';
import OfferSection from './home/OfferSection';
import LibraryCabinetBanner from './home/LibraryCabinetBanner';
import FeelingSection from './home/FeelingSection';
import TestimonialsSection from './home/TestimonialsSection';
import HowToOrderSection from './home/HowToOrderSection';
import AboutSection from './home/AboutSection';
import InstagramSection from './home/InstagramSection';
import ContactSection from './home/ContactSection';

export default function HomePage() {
  return (
    <main id="home">
      <HeroSection />
      <Divider />
      <FeaturedBooksSection />
      <Divider />
      <FeaturedProductsSection />
      <Divider />
      <OfferSection />
      <LibraryCabinetBanner />
      <FeelingSection />
      <TestimonialsSection />
      <Divider />
      <HowToOrderSection />
      <Divider />
      <AboutSection />
      <Divider />
      <InstagramSection />
      <Divider />
      <ContactSection />
    </main>
  );
}
