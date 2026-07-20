import ProductList from "@/components/ProductList";
import Image from "next/image";

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;
  console.log(category);
  return (
    // <div className="bg-[linear-gradient( 180deg, #DC2628_0%, #fcfcfc_40%, #ffffff_100%)]">
    <div className="">
    {/* // <div className="bg-[#fcfcfc]"> */}
      <div>
        <div className="relative aspect-3/1 mb-12 rounded-lg overflow-hidden">
          <Image src="/poster2.png" alt="Featured Product" fill />
        </div>
        <ProductList category={category} params="homepage"/>
      </div>
      
    </div>
  );
};

export default Homepage;