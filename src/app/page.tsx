"use client";

import RetroText from "@/components/RetroText";
import Image from "next/image";
import { motion } from "framer-motion";
import OppositeScroll from "@/components/OppositeScroll";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    handleResize(); // Set initial dimensions

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* short intro */}
      <section className="">
        {" "}
        <div id="section-1" className="container h-[100vh] flex items-center">
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
      </section>

      {/* Experience and about */}
      <section className="">
        {" "}
        <div
          id="section-skills"
          className="container h-[200vh] lg:h-[100vh] grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-6"
        >
          <div className="border-2 border-black bg-brightNeonGreen h-[95%] lg:h-[80%] rounded-md"></div>
          <div
            ref={containerRef}
            className="overflow-hidden bg-fadedBlue w-full border-2 rounded-md border-black h-[95%] lg:h-[80%] flex items-center"
          >
            <OppositeScroll
              width={dimensions.width}
              height={dimensions.height}
            />
          </div>
        </div>
      </section>

      {/* Experience and about */}
      <section className="pages">
        <div
          id="section-2"
          className="container h-[100vh] flex flex-col items-start justify-around"
        >
          {/* <div className="pb-4 lg:pb-0">
          <RetroText text="Experience"></RetroText>
        </div> */}

          <div className="grid bg-white grid-cols-12 h-[95%] lg:h-[80%] gap-4 w-full">
            <div className="border-2 border-black rounded-sm col-span-12 lg:col-span-9 p-4 flex flex-col justify-around"></div>
            <div className="col-span-3 bg-brightYellow border-2 border-black rounded-sm hidden lg:block"></div>
            <div className="col-span-3 bg-fadedRed border-2 border-black rounded-sm hidden lg:block"></div>
            <div className="rounded-sm border-2 border-black col-span-12 lg:col-span-9 p-4 flex flex-col justify-around"></div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="pages">
        {" "}
        <div id="section-3" className="container h-[100vh] flex items-center">
          <div className="grid bg-white lg:grid-cols-12 h-[95%] lg:h-[80%] gap-4 w-full">
            <div className="bg-brightNeonGreen border-2 border-black lg:col-span-7 rounded-sm"></div>
            <div className="bg-fadedBlack border-2 border-black rounded-sm lg:col-span-5"></div>
            <div className="bg-brightYellow border-2 border-black w-full rounded-sm lg:col-span-5"></div>
            <div className="bg-fadedBlue border-2 border-black w-full rounded-sm lg:col-span-7"></div>
          </div>
        </div>
      </section>

      {/* Contact me */}
      <section className="pages">
        <div id="section-4" className="container  h-[100vh] flex items-center">
          <div className="bg-white  w-full border-2 border-black h-[95%] lg:h-[80%] rounded-md p-8 flex items-center"></div>
        </div>
      </section>
    </>
  );
}
