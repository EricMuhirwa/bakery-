import Link from 'next/link';

export default function Banner() {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Video Background */}

      {/* Text Overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-center z-10 px-4">
        <div className="text-white max-w-4xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
             “Taste Breads from Every Corner of the World”
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl mb-8">
            Bread of the all times, delivering exotic bread to your door
          </h2>
          <Link href="/subscription">
            <button className="bg-yellow-500 text-black text-lg font-semibold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}