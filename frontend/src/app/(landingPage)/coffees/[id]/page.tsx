"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSingleCoffeeQuery } from "../../../../lib/redux/slices/CoffeeSlice";
import * as React from "react";
import ShippingForm from "@/components/ShippingForm";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface CoffeePageProps {
  params: Promise<{ id: string }>;

}


const CoffeePage: React.FC<CoffeePageProps> = ({ params: paramsPromise }) => {
  const params = React.use(paramsPromise);
  const { id } = params;
  const [isPay, setIsPay] = useState<boolean>(false)
  const { data: session } = useSession()

  const { data: coffee, isLoading, isError } = useSingleCoffeeQuery(id);
  const [quantity, setQuantity] = useState(1);

  // Payment mutation
  // const [createPayment, { isLoading: isPaymentLoading }] = useCreatePaymentMutation();


  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center pt-32">
        <div className="animate-pulse text-xl">Loading product details...</div>
      </div>
    );
  }

  if (isError || !coffee) {
    return (
      <div className="h-screen flex items-center justify-center pt-32">
        <div className="text-red-500 text-xl">
          Sorry, we couldn&rsquo;t find this product.
          <div className="mt-4">
            <Link
              href="/coffees"
              className="bg-black text-white py-2 px-4 rounded-lg"
            >
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, value));
  };

  // const handlePayNow = async () => {
  //   try {
  //     // Calculate total amount
  //     const totalAmount = coffee.price * quantity;

  //     // Prepare payment data according to PaymentDTO
  //     const paymentData = {
  //       email: "user@example.com", // Replace with actual user email
  //       cardNumber: "4242424242424242", // Replace with actual card number
  //       expiryDate: "12/25", // Replace with actual expiry date
  //       cvv: "123", // Replace with actual CVV
  //       firstName: "John", // Replace with actual first name
  //       lastName: "Doe", // Replace with actual last name
  //       address: "123 Main St", // Replace with actual address
  //       apartment: "Apt 4B", // Replace with actual apartment (optional)
  //       city: "New York", // Replace with actual city
  //       zipCode: "10001", // Replace with actual ZIP code
  //       phone: "123-456-7890", // Replace with actual phone number
  //       textOffers: false, // Replace with actual user preference
  //       planName: coffee.title,
  //       planPrice: totalAmount,
  //       userId: "user_123", // Replace with actual user ID
  //       subscriptionId: "sub_123", // Replace with actual subscription ID (if applicable)
  //       paymentMethodId: "pm_123456789", // Replace with actual payment method ID
  //     };

  //     // Call the payment mutation
  //     const result = await createPayment(paymentData).unwrap();

  //     if (result.success) {
  //       alert("Payment successful! Thank you for your purchase.");
  //       router.push("/dashboard"); // Redirect to dashboard or confirmation page
  //     } else {
  //       alert("Payment failed. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Payment error:", error);
  //     alert("An error occurred during payment. Please try again.");
  //   }
  // };

  const handleVerify = ()=>{
    if(session?.user){
      setIsPay(true)
    }else{
      toast.error("You are not logged in !!  please login")
    }
  }

  return (
    <section className="pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-black">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/coffees" className="text-gray-500 hover:text-black">
            Products
          </Link>{" "}
          / <span className="text-gray-900 font-medium">{coffee.title}</span>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative h-96 md:h-full overflow-hidden bg-gray-100">
              <Image
                src={coffee.image || "/images/default-coffee.jpg"}
                alt={coffee.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                unoptimized={!coffee.image?.startsWith("/")}
              />
            </div>

            <div className="p-8 md:p-10 flex flex-col">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {coffee.title}
                </h1>
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">(42 reviews)</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-6">
                  RWF {(coffee.price * quantity).toFixed(2)}
                </p>

                <div className="prose prose-sm text-gray-600 mb-8">
                  <p className="mb-4">
                    {coffee.description ||
                      `Experience our premium ${coffee.title} coffee. This exceptional brew offers a rich, aromatic profile with notes of ${coffee.title.includes("Dark")
                        ? "chocolate and caramel"
                        : "citrus and berries"
                      } that will delight your senses.`}
                  </p>
                  <p>
                  If thou tastest a crust of bread, thou tastest all the stars and all the heavens{" "}
                    {coffee.title.includes("Espresso")
                      ? "a morning energy boost"
                      : "a relaxing afternoon break"}.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Roast Level
                  </h3>
                  <div className="flex space-x-2">
                    {["Light", "Medium", "Dark"].map((roast) => (
                      <button
                        key={roast}
                        className={`px-4 py-2 text-sm font-medium rounded-full ${coffee.title.includes(roast)
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {roast}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      className="px-3 py-2 text-gray-600 hover:text-black"
                      onClick={() => handleQuantityChange(quantity - 1)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      className="w-12 text-center border-0 focus:ring-0"
                      value={quantity}
                      min={1}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value))
                      }
                    />
                    <button
                      className="px-3 py-2 text-gray-600 hover:text-black"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={handleVerify}
                    // disabled={isPaymentLoading}
                    className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                  >
                   Pay Now
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Free shipping on orders over RWF 45000</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>30-day hassle-free returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isPay && (
        <ShippingForm isPay={isPay} setIsPay={setIsPay} coffee={coffee} quantity={quantity} />
      )}
    </section>
  );
};

export default CoffeePage;