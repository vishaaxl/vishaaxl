import Link from "next/link";
import React from "react";

const techLeft = ["Javascript", "Nextjs", "Typescript"];
const techRight = ["React native", "FastAPI", "MongoDB"];

const About: React.FC = () => {
  return (
    <div className="py-10" id="about">
      <h1 className="title mb-10">/ About me </h1>
      <p className="text-slate font-thin text-xl sm:text-3xl sm:mt-2 md:w-[90%] lg:w-[80%] text-justify lg:text-start">
        I&apos;m a self taught{" "}
        <span className="text-green font-semibold">full-stack</span> web
        developer based in India. I&apos;ve been doing freelance projects from
        the last two years. During the period I created scalable and high
        functioning softwares.
        <br />
        <br />
        Here are some of the technologies I&apos;ve been working with:
      </p>

      <div className="flex justify-between text-slate text-xl sm:text-3xl mt-5 child:flex-1 lg:max-w-[60%]">
        <ul className="">
          {techLeft.map((item) => (
            <li className="flex items-center" key={item}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="#64ffda"
              >
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {item}{" "}
            </li>
          ))}
        </ul>
        <ul className="">
          {techRight.map((item) => (
            <li className="flex items-center" key={item}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="#64ffda"
              >
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {item}{" "}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-slate  font-thin text-xl sm:text-3xl sm:mt-2 sm:leading-snug md:w-[90%] lg:w-[80%] text-justify lg:text-start">
        <br />
        <br />
        Apart from my coding career, I am also a graduate in Buiness
        Administration and I like to write. Feel free to read some of my
        <Link href="/blog">
          <span className="text-green font-semibold cursor-pointer">
            {" "}
            blogposts.
          </span>
        </Link>
      </p>
    </div>
  );
};

export default About;
