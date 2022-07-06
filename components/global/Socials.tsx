import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const Socials: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed right-4 lg:right-20 bottom-0 my-10 flex flex-col justify-end child:ml-2 sm:max-w-fit"
    >
      <div className="relative cursor-pointer">
        <a target="_blank" rel="noreferrer" href="https://github.com/vishaaxl">
          <Image
            alt="github-icon"
            src="/images/icons8-github.svg"
            height="40"
            width="40"
          />
        </a>
      </div>
      <div className="relative cursor-pointer">
        <a target="_blank" rel="noreferrer" href="https://twitter.com/vishaaxl">
          <Image
            alt="twitter-icon"
            src="/images/icons8-twitter.svg"
            height="40"
            width="40"
          />
        </a>
      </div>
      <div className="relative cursor-pointer">
        <Image
          alt="linkedin-icon"
          src="/images/icons8-linkedin.svg"
          height="40"
          width="40"
        />
      </div>
      <div className="relative cursor-pointer">
        <a
          target="_blank"
          rel="noreferrer"
          href="whatsapp://send?text=hello vishal!&phone=+919651527769"
        >
          <Image
            alt="whatsapp-icon"
            src="/images/icons8-whatsapp.svg"
            height="40"
            width="40"
          />
        </a>
      </div>
    </motion.div>
  );
};

export default Socials;
