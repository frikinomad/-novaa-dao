import React from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import './FooterLeft.css';
import Link from 'next/link';
import { Sparkles } from "lucide-react";

export default function FooterLeft(props) {
  const { username, description, song } = props;

  const router = useRouter();

  const handleStakeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/dashboard');
  };

  return (
    <div className="footer-container">
      <div className="w-full relative z-10"> {/* Added relative positioning and z-index to ensure clickability */}
        <Link
          href={`/dashboard/${username}`}
          className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-white text-center 
          bg-gradient-to-r from-slate-600 via-slate-500 to-indigo-600 shadow-[0_4px_14px_rgba(0,0,0,0.2)] 
          hover:shadow-[0_8px_20px_rgba(100,116,139,0.4)] hover:scale-[1.02] 
          active:shadow-inner active:scale-[0.98] transition-all duration-200 
          flex items-center justify-center gap-2"
          style={{ pointerEvents: 'auto' }} /* Ensure pointer events are not blocked */
        >
          <Sparkles className="h-4 w-4" />
          Stake & Become more than just a fan
        </Link>
      </div>

      <div className="footer-left">
        <div className="text">
          <h3>@{username}</h3>
          <p>{description}</p>
          <div className="ticker">
            <FontAwesomeIcon icon={faMusic} style={{ width: '30px' }} />
            {/* eslint-disable-next-line jsx-a11y/no-distracting-elements */}
            <marquee direction="left" scrollamount="2">
              <span>{song}</span>
            </marquee>
          </div>
        </div>
      </div>
      <div className="w-full relative z-10">
        <Link
          href={`/initialize_dao/${username}`}
          className="w-full px-4 py-2 rounded-2xl text-sm font-semibold text-white text-center 
          bg-gradient-to-r from-[#4c51bf] to-[#3b82f6] shadow-[0_3px_12px_rgba(0,0,0,0.2)] 
          hover:shadow-[0_6px_16px_rgba(59,130,246,0.5)] hover:scale-102 
          active:shadow-inner active:scale-98 transition-all duration-250 
          flex items-center justify-center gap-2"
          style={{ pointerEvents: 'auto' }}
        >
          <Sparkles className="h-3 w-3" />
          Launch your DAO
        </Link>
      </div>
    </div>
  );
}
