"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Benefits from "../Landing/Benefits/page";

const coffeeTypes = [
  { name: "Wedding Cakes", image: "/images/wedding cake.jpg" },
  { name: "Baguette", image: "/images/baguette.jpg" },
  { name: "Fiber Bread", image: "/images/Fiberbread.jpg" },
  { name: "Cheese Bread", image: "/images/cheesebread.jpg" },
];

const OurCoffee: React.FC = () => {
  const router = useRouter();

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white text-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/me5.webp')" }}></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Hero Content */}
        <div className="relative z-10 px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover the World Through CEBK Bakery Ltd</h1>
          <p className="mb-6 text-lg max-w-lg mx-auto">
            Explore single-origin breads from the best bakers worldwide. Delivered fresh to your door.
          </p>
          <button
            onClick={() => router.push("/coffees")}
            className="bg-yellow-500 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-yellow-600 transition"
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {coffeeTypes.map((coffee) => (
              <div
                key={coffee.name}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 cursor-pointer"
                onClick={() => router.push(`/coffees`)}
              >
                <Image
                  src={coffee.image}
                  alt={coffee.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold">{coffee.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-transparent">
        <Benefits />
      </section>
    </>
  );
};

export default OurCoffee;
