import ProductList from "@/components/ProductList";
import HeroCarousel from "@/components/HeroCarousel";

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}): Promise<JSX.Element> => {
  const category = (await searchParams).category;

  return (
    <div className="">
      <div>
        {/* Modern Interactive Hero Carousel */}
        <HeroCarousel />

        {/* Product List Grid */}
        <ProductList category={category} params="homepage" />
      </div>
    </div>
  );
};

export default Homepage;