import React from 'react'
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

function Header() {
  return (
    <div>
        <div className="flex p-4 justify-between">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle-dashed mr-2">
            <path d="M13.5 3.1c-.5 0-1-.1-1.5-.1s-1 .1-1.5.1"></path>
            <path d="M19.3 6.8a10.45 10.45 0 0 0-2.1-2.1"></path>
            <path d="M20.9 13.5c.1-.5.1-1 .1-1.5s-.1-1-.1-1.5"></path>
            <path d="M17.2 19.3a10.45 10.45 0 0 0 2.1-2.1"></path>
            <path d="M10.5 20.9c.5.1 1 .1 1.5.1s1-.1 1.5-.1"></path>
            <path d="M3.5 17.5c-.5 0-1-.1-1.5-.1s-1 .1-1.5.1"></path>
            <path d="M3.1 10.5c0 .5.1 1 .1 1.5s-.1 1-.1 1.5"></path>
            <path d="M6.8 4.7a10.45 10.45 0 0 0-2.1 2.1"></path>
          </svg>
          Intervue.cloud
        </div>
    </div>
  )
}

export default Header