import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const sliding = {
  hidden: {
    opacity: 0,
    y: -100,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      duration: 1,
    },
  },
};

const Navigation: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => {
    setNavOpen((prev) => !prev);
  };

  return (
    <motion.header variants={sliding} initial="hidden" animate="visible">
      <nav className="wrapper flex justify-between items-center py-8">
        <Link href="/">
          <div
            className="logo text-2xl tracking-wider text-agreen cursor-pointer"
            onClick={() => setNavOpen(false)}
          >
            &#128511;
          </div>
        </Link>

        {/* desktop menu */}
        <ul className="hidden text-2xl items-center child:ml-8 child:cursor-pointer child-hover:hover-animation-link child:w-max py-2 md:flex">
          <Link href="/#about">
            <li>about</li>
          </Link>
          <Link href="/#work">
            <li>work</li>
          </Link>
          <Link href="/#contact">
            <li>contact</li>
          </Link>
          <Link href="/blog">
            <li>blog</li>
          </Link>
        </ul>

        {/* hamburger menu button */}
        <div
          className="hamburgerIcon flex flex-col items-end child:mb-1 child:rounded cursor-pointer group md:hidden child:bg-white"
          onClick={toggleNav}
        >
          <span className="w-4 h-1 group-hover:bg-green block"></span>
          <span className="w-8 h-1 group-hover:bg-green block"></span>
          <span className="w-8 h-1 group-hover:bg-green block mb-0"></span>
        </div>
      </nav>

      {/* mobile navigation panel */}
      <nav
        className={`overflow-hidden md:hidden origin-top transition-all duration-500 linear-ease bg-[#f4f4f4] text-navy ${
          navOpen ? "max-h-[200px]" : "max-h-0"
        }`}
      >
        <ul className="text-2xl flex flex-col child:my-2 child:cursor-pointer py-2 ">
          <Link href="/#about">
            <li
              onClick={toggleNav}
              className="center child-hover:hover-animation-link"
            >
              <span>about</span>
            </li>
          </Link>
          <Link href="/#work">
            <li
              onClick={toggleNav}
              className="center child-hover:hover-animation-link"
            >
              <span>work</span>
            </li>
          </Link>
          <Link href="/#contact">
            <li
              onClick={toggleNav}
              className="center child-hover:hover-animation-link"
            >
              <span>contact</span>
            </li>
          </Link>
          <Link href="/blog">
            <li
              onClick={toggleNav}
              className="center child-hover:hover-animation-link"
            >
              <span>blog</span>
            </li>
          </Link>
        </ul>
      </nav>
    </motion.header>
  );
};

export default Navigation;
