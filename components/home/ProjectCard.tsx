import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  data: {
    name: string;
    description: string;
    projectLink: string;
  };
}

const ProjectCard: React.FC<Props> = ({ data }) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
      }}
      className="my-4 lg:mx-4 p-6 bg-lightNavy text-slate rounded-xl cursor-pointer relative"
    >
      <div className="mb-5">
        <Image
          alt="github-icon"
          src="/images/icons8-github.svg"
          height="40"
          width="40"
        />
      </div>
      <h3 className="h1 font-bold mb-4 text-lightSlate">{data.name}</h3>

      <p className="para child:pr-5">
        {data.description}
        <br />
        <br />
        {/* <Link href={data.projectLink}>
          <span className="text-green cursor-pointer font-semibold">
            Casestudy
          </span>
        </Link> */}
        <a href={data.projectLink} target="_blank" rel="noreferrer">
          <span className="text-green cursor-pointer font-semibold">
            View Project
          </span>
        </a>
      </p>
    </motion.div>
  );
};

export default ProjectCard;
