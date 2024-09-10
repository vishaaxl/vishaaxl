"use client";

import RetroText from "@/components/RetroText";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="container">
      {/* short intro */}
      <div id="section-1" className="section h-[100vh] flex items-center">
        <div className="relative bg-brightYellow border-2 border-black w-full h-[95%] lg:h-[80%] rounded-md flex flex-col items-center justify-center gap-4">
          <RetroText text="Making cool sh#t happen since 2019"></RetroText>
          <div className="flex flex-col items-center lg:flex-row justify-between">
            <p className="max-w-4xl text-left text-sm lg:text-xl font-semibold px-4">
              From the shadows, a self-taught full-stack web developer emerges
              with a flair for building and occasionally designing impressive
              web apps. I seamlessly blend backend prowess with frontend
              creativity to craft powerful, dynamic digital experiences.
            </p>

            <motion.div
              // animate={{ y: [0, -5, 0] }} // Float up and down
              // transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
              className="relative top-10 cursor-pointer opacity-80 max-w-fit"
            >
              <Image
                src="/images/sayhi.png"
                className=""
                alt="link-to-email"
                width={200}
                height={200}
              />
              <span className="absolute text-xl font-semibold uppercase left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                Say hiiii
              </span>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }} // Float up and down
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
            className="absolute bottom-10"
          >
            <Image
              src="/images/scroll-down.png"
              className="rotate-90"
              alt="scroll-down-icon"
              width={125}
              height={125}
            />
          </motion.div>
        </div>
      </div>

      {/* Experience and about */}
      <div
        id="section-2"
        className="section h-[100vh] flex flex-col items-start justify-around"
      >
        {/* <div className="pb-4 lg:pb-0">
          <RetroText text="Experience"></RetroText>
        </div> */}

        <div className="grid grid-cols-12 h-[95%] lg:h-[80%] gap-4 w-full">
          <div className="border-2 border-black rounded-sm col-span-12 lg:col-span-9 p-4 flex flex-col justify-around">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="relative">
                  <h2 className="retro text-5xl text-white whitespace-nowrap">
                    Full Stack Developer
                  </h2>
                  <h2 className="absolute left-[2px] top-0 retro text-5xl whitespace-nowrap">
                    Full Stack Developer
                  </h2>
                  <Image
                    src="/images/doodle.png"
                    className="absolute"
                    alt="scroll-down-icon"
                    width={125}
                    height={125}
                  />
                </div>
                <h4 className="font-medium relative bottom-2">
                  @virtue analytics
                </h4>
              </div>
              <span className="text-sm font-semibold">May 2023 - Current</span>
            </div>
            <ul className="font-medium text-base grid gap-4">
              <li>
                - Successfully managed a HIPAA-compliant healthcare application
                for a US-based client, ensuring full compliance with data
                security and privacy regulations.
              </li>
              <li>
                - Successfully managed a HIPAA-compliant healthcare application
                for a US-based client, ensuring full compliance with data
                security and privacy regulations.
              </li>
            </ul>
          </div>
          <div className="col-span-3 bg-brightYellow rounded-sm hidden lg:block"></div>
          <div className="col-span-3 bg-fadedRed rounded-sm hidden lg:block"></div>
          <div className="rounded-sm border-2 border-black col-span-12 lg:col-span-9 p-4 flex flex-col justify-around">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="relative">
                  <h2 className="retro text-5xl text-white whitespace-nowrap">
                    Full Stack Developer
                  </h2>
                  <h2 className="absolute left-[2px] top-0 retro text-5xl whitespace-nowrap">
                    Full Stack Developer
                  </h2>
                  <Image
                    src="/images/doodle.png"
                    className="absolute rotate-180 lg:left-10"
                    alt="scroll-down-icon"
                    width={125}
                    height={125}
                  />
                </div>
                <h4 className="font-medium relative bottom-2">@ample media</h4>
              </div>
              <span className="text-sm font-semibold">
                June 2020 - April 2023
              </span>
            </div>
            <ul className="font-medium text-base grid gap-4">
              <li>
                - Successfully managed a HIPAA-compliant healthcare application
                for a US-based client, ensuring full compliance with data
                security and privacy regulations.
              </li>
              <li>
                - Successfully managed a HIPAA-compliant healthcare application
                for a US-based client, ensuring full compliance with data
                security and privacy regulations.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div id="section-3" className="section h-[100vh] flex items-center">
        <div className="grid lg:grid-cols-12 h-[95%] lg:h-[80%] gap-4 w-full">
          <div className="bg-brightNeonGreen lg:col-span-7 rounded-sm"></div>
          <div className="bg-fadedBlack rounded-sm lg:col-span-5"></div>
          <div className="bg-brightYellow w-full rounded-sm lg:col-span-5"></div>
          <div className="bg-fadedBlue w-full rounded-sm lg:col-span-7"></div>
        </div>
      </div>

      {/* Contact me */}
      <div id="section-4" className="section h-[100vh] flex items-center">
        <div className="bg-fadedRed w-full h-[95%] lg:h-[80%] rounded-md p-8 flex items-center"></div>
      </div>
    </div>
  );
}
