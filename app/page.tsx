import { HeroSection } from '../components/sections/HeroSection/HeroSection';
import { CategoriesSection } from '../components/sections/CategoriesSection/CategoriesSection';
import { AdvantagesSection } from '../components/sections/AdvantagesSection/AdvantagesSection';
import { ProductsSection } from '../components/sections/ProductsSection/ProductsSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <AdvantagesSection />
      <ProductsSection />
    </>
  );
}