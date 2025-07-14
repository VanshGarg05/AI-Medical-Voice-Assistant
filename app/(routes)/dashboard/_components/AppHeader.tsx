import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const menuOptions = [
    {
        id:1,
        name:'Home',
        path:'/'
    },
    {
        id:2,
        name:'History',
        path:'/dashboard/history'
    },
    {
        id:3,
        name:'Pricing',
        path:'/dashboard/billing'
    },
    {
        id:4,
        name:'Profile',
        path:'/profile'
    },
]



function AppHeader() {
  return (
    <div className='flex items-center justify-between p-4 shadow px-10 md:px-20 lg:px-40'>
        <Image src={'/logo.svg'} alt='logo' width={120} height={60} />
        <div className='flex gap-12 items-center'>
            {menuOptions.map((option,index)=>(
                <Link href={option.path} key={index} className="">
                    <h2 className='hover:font-bold cursor-pointer transition-all'>{option.name}</h2>
                </Link>
            ))}
        </div>
        <UserButton/>
    </div>
  )
}

export default AppHeader