"use client";

import Image from "next/image";
import Link from "next/link";
import { useCoffeesQuery } from "../../../../lib/redux/slices/CoffeeSlice";

interface Coffee {
  id: string;
  image?: string;
  title: string;
  price: number;
}

const Recommended: React.FC = () => {
  // Fetch coffee data using the useCoffeesQuery hook
  const { data: coffees, isLoading, isError } = useCoffeesQuery({});

  // Display only 4 coffees by default
  const displayedCoffees: Coffee[] = coffees?.slice(0, 4) || [];

  if (isLoading) {
    return <div className="text-center py-12">Loading product...</div>;
  }

  if (isError) {
    return <div className="text-center py-12 text-red-500">Error loading product.</div>;
  }

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-6">
        {/* Recommended By */}
        <div id="Recommendation" className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">RECOMMENDED BY</h2>
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {["bakery1.jpg", "bakery2.jpg", "bakery3.jpg", "package.jpeg"].map(
              (img, index) => (
                <div key={index} className="relative w-40 h-40">
                  <Image
                    src={`/images/${img}`}
                    alt="Recommended Coffee"
                    fill
                    sizes="160px"
                    className="rounded-lg shadow-md object-cover"
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Coffee Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayedCoffees.map((coffee: Coffee) => (
            <Link key={coffee.id} href={`/coffees/${coffee.id}`}>
              <div className="bg-white shadow-lg p-4 rounded-lg transform transition-all hover:scale-105 cursor-pointer">
                <div className="relative w-full h-64">
                  <Image
                    src={coffee.image || "/images/default-coffee.jpg"} // Use a default image if coffee.image is not available
                    alt={coffee.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 250px"
                    className="rounded-md object-cover"
                    unoptimized={!coffee.image?.startsWith("/")} // Disable optimization for external images
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800">{coffee.title}</h3>
                <p className="text-gray-600">RWF {coffee.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <Link href="/coffees">
            <button className="bg-black text-white py-3 px-6 rounded-lg text-lg font-semibold transition-all hover:bg-gray-800">
              View All
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Recommended;