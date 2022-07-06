import Link from "next/link";
import React from "react";

const Hero: React.FC = () => {
  return (
    <div className="sm:my-[8vh] my-[5vh] flex flex-col justify-center">
      <div className="group">
        <p className="h1 mb-3 sm:mt-3">
          <span className="font-mono">
            def{" "}
            <span className="before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-pink-500 relative inline-block">
              <span className="relative text-white"> intro():</span>
            </span>
          </span>
        </p>
        <div className="text-slate pl-10 md:pl-12 font-thin text-xl sm:text-3xl sm:mt-2 md:w-[90%] lg:w-[80%] text-justify lg:text-start">
          &quot;Hi! my name is{" "}
          <span className="text-green cursor-pointer"> Vishal Shukla.</span>{" "}
          I&apos;m a self taught full-stack web developer specializing in
          building (and occasionally designing) awesome web-apps and native
          mobile applications.
          <Link href="#about">
            <span className="text-green cursor-pointer"> Read more</span>
          </Link>
          &quot;
        </div>
      </div>
      <div className="sm:my-10 my-5 cursor-pointer">
        <Link href="#contact">
          <span className="primary-button">- I wanna be awesome too</span>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
