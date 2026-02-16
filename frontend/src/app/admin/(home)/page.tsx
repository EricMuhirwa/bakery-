"use client"
import AdminCard from '@/components/admincomp/AdminCard'
import { Inbox } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useCoffeesQuery } from '@/lib/redux/slices/CoffeeSlice'
import { usePaymentsQuery } from '@/lib/redux/slices/PaymentSlice'
import { useGetMessagesQuery } from '@/lib/redux/slices/ContactSlice'

interface PaymentSummaryDTO {
    id?: string;
    email: string;
    planName: string;
    planPrice: number;
    paymentDate?: string;
}

const AdminHome = () => {
    const { data: userProfile } = useSession()
    const [totalCoffeeItems, setTotalCoffeeItems] = useState(0)
    const [totalMessages, setTotalMessages] = useState(0)
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    
    const { data: coffeeData, isLoading: isCoffeeLoading, error: coffeeError } = useCoffeesQuery({})

    const { data: paymentData, isLoading: isPaymentLoading, error: paymentError } = usePaymentsQuery({})

    const { data: messageData, isLoading: isMessageLoading, error: messageError } = useGetMessagesQuery({})

    useEffect(() => {
        console.log('Coffee Data:', coffeeData);
        console.log('Payment Data:', paymentData);
        console.log('Message Data:', messageData);

     
        if (coffeeError) console.error('Coffee Error:', coffeeError);
        if (paymentError) console.error('Payment Error:', paymentError);
        if (messageError) console.error('Message Error:', messageError);

        if (!isCoffeeLoading && coffeeData) {
            setTotalCoffeeItems(coffeeData.length)
        }

     
        if (!isPaymentLoading && paymentData) {
            const paymentsArray = Array.isArray(paymentData.data?.payments) ? paymentData.data.payments : [];
            console.log('Payments Array:', paymentsArray);

            const revenue: number = paymentsArray.reduce((sum: number, payment: PaymentSummaryDTO) => {
             
                const planPrice = typeof payment.planPrice === 'number' ? payment.planPrice : 0;
                console.log('Payment Plan Price:', payment.planPrice, 'Parsed Plan Price:', planPrice);
                return sum + planPrice;
            }, 0);

            console.log('Total Revenue:', revenue);
            setTotalRevenue(revenue);
        }

     
        if (!isMessageLoading && messageData) {
            const messagesArray = Array.isArray(messageData.data) ? messageData.data : [];
            setTotalMessages(messagesArray.length);
        }

   
        if (!isCoffeeLoading && !isPaymentLoading && !isMessageLoading) {
            setIsLoading(false)
        }
    }, [coffeeData, paymentData, messageData, isCoffeeLoading, isPaymentLoading, isMessageLoading, coffeeError, paymentError, messageError])

    if (isLoading) {
        return <div className="flex justify-center p-8">Loading...</div>
    }

    // const formattedTotalRevenue = `$${totalRevenue}`;

    return (
        <div className='flex flex-col gap-[16px] w-full'>
            <div className='flex flex-row items-center gap-[20px] justify-between w-full p-4'>
                <div className='flex flex-col gap-[4px]'>
                    <h1 className='text-[24px] font-bold'>Welcome Back {userProfile?.user?.name}</h1>
                    <span className='text-[14px] text-[#475367]'>Build Your world of bakery management Coffee Experience Here😉!!!</span>
                </div>
            </div>
            <div className='flex flex-col gap-[10px] px-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-[16px] '>
                    <AdminCard title='Total Bakery Items' number={totalCoffeeItems} icon={<Inbox size={24} />} percentage={0} />
                    <AdminCard title='Total Messages' number={totalMessages} icon={<Inbox size={24} />} percentage={0} />
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[16px] '>
                    <AdminCard title='Total Revenue' number={totalRevenue} icon={<Inbox size={24} />} percentage={0} />
                </div>
            </div>
        </div>
    )
}

export default AdminHome