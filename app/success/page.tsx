"use client"

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWindowSize } from 'react-use';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

const SuccessPage = () => {
  const { width, height } = useWindowSize();

  return (
    <div className='flex flex-col items-center justify-center' style={{ height: 'calc(100vh - 89px)' }}>
      {width && height && (
        <Confetti
          width={width}
          height={height}
        />
      )}
      <div className='flex flex-col items-center gap-10'>
        <div className='text-3xl font-bold'>
            Congratulations, you completed the study!
        </div>
        <Link href={`https://app.prolific.com/submissions/complete?cc=C18TDBPU`} className="cursor-pointer text-4xl font-bold p-5 py-4 border bg-[#B10034] hover:scale-110 transition duration-500 rounded-full text-white hover:text-[#B10034] hover:bg-white hover:border-spacing-6 border-hidden border-neutral-300">
            Claim your reward on Prolific
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
