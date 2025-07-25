import React from 'react'
import { PricingTable } from '@clerk/nextjs'

function Billing() {
  return (
    <div className='px-10 md:px-24 lg:px-4'>
        <h2 className='font-bold text-3xl mb-10'>Join Subscription</h2>
        <PricingTable />
    </div>
  )
}

export default Billing