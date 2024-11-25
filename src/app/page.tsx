import { FaArrowRight, FaPython } from "react-icons/fa";
import { FaDocker } from "react-icons/fa";
import {
  SiMongodb,
  SiTypescript,
  SiNextdotjs,
  SiKubernetes,
  SiNodedotjs,
} from "react-icons/si";
import { PiFlowerFill } from "react-icons/pi";
import { FaGolang } from "react-icons/fa6";
import { BiLogoPostgresql } from "react-icons/bi";

const config = {
  headerLinks: [
    { text: "Github", href: "https://github.com/vishaaxl" },
    { text: "Resume", href: "https://flowcv.com/resume/g86v5tef43" },
    { text: "Email", href: "mailto:vishaaxl@gmail.com" },
  ],
  heroText: "MakingCoolSh#t",
  featureSection: {
    title: "Here to make you look\ngood and win business.",
    description:
      "Websites that convert and apps that feel effortless. Clean, clear, and thoughtfully designed.",
    ctaText: "Get in Touch",
    ctaLink: "mailto:vishaaxl@gmail.com",
  },
  experience: [
    {
      company: "Virtue Analytics",
      date: "May 2023 - present",
      description:
        "Websites that convert and apps that feel effortless. Clean, clear, and thoughtfully designed. Websites that convert and apps that feel effortless. Clean, clear, and thoughtfully designed.",
    },
    {
      company: "Ample Media Agency",
      date: "January 2020 - February 2023",
      description:
        "Websites that convert and apps that feel effortless. Clean, clear, and thoughtfully designed. Websites that convert and apps that feel effortless. Clean, clear, and thoughtfully designed.",
    },
  ],
  finalSection: {
    title: "Wanna Connect ?",
    ctaText: "Drop an email",
    ctaLink: "mailto:vishaaxl@gmail.com",
  },
  designSection: {
    leftTitle: "From design to development\n to deployment.",
    leftDescription:
      "Every project kicks off with an idea and wraps up with something awesome. I'll make sure everything runs smoothly, from the first brainstorm to the final launch.",
    rightTitle: "Can't think of another\n catchy line.",
    rightDescription:
      "The technical jargon and me convincing you can wait—let’s get your project off the ground and into the world. Let’s keep it simple: I build cool stuff that works.",
  },
};

export default function Home() {
  return (
    <main className="container">
      <div className="fixed left-[50%] translate-x-[-50%] top-0 z-10 bg-foreground text-background rounded-b-[20px] py-3 hover:text-accent-beige transition-all">
        {config.headerLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener"
            className="px-6 border-r-2 last:border-0 border-accent-beige cursor-pointer"
          >
            {link.text}
          </a>
        ))}
      </div>

      <div className="hero-text w-full font-bold text-[165px] flex justify-between items-center min-h-[40vh] mt-10">
        {config.heroText}
      </div>

      <div className="grid gap-4">
        <div className="rounded-[50px] px-10 flex flex-col justify-center gap-5 overflow-hidden w-full bg-accent-beige min-h-[50vh] relative">
          <h2 className="feature-title text-6xl font-semibold leading-tight">
            {config.featureSection.title}
          </h2>
          <p className="feature-description text-2xl max-w-[600px]">
            {config.featureSection.description}
          </p>
          <a
            href={config.featureSection.ctaLink}
            className="cta-button max-w-fit mt-4 font-medium py-4 px-8 rounded-full bg-foreground text-background flex items-center gap-4"
          >
            {config.featureSection.ctaText} <FaArrowRight className="float" />
          </a>
          <PiFlowerFill className="flower-icon text-accent-red absolute bottom-[-145px] right-[-100px] text-[500px] rotate" />
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-2 gap-4">
          <div className="py-16 min-h-[40vh] flex px-6 flex-col gap-14 justify-center relative">
            <div className="">
              <h2 className="feature-title text-6xl font-semibold leading-tight">
                Hi, Nice to meet you
              </h2>
              <span className="text-4xl">I am Vishal aka the guy</span>
              <p className="text-lg text-justify max-w-[800px] mt-14">
                The technical jargon and me convincing you can wait—let’s get
                your project off the ground and into the world. Let’s keep it
                simple: I build cool stuff that works.
              </p>
            </div>
          </div>
          <div className="bg-accent-beige min-h-[80vh] rounded-l-[50px] flex items-center justify-center">
            <div className="grid grid-cols-3 gap-6">
              <div className="flex justify-center items-center bg-foreground text-background w-[100px] h-[100px] rounded-[20px]">
                <SiNextdotjs className="text-6xl" />
              </div>
              <div className="flex justify-center items-center bg-foreground text-background w-[100px] h-[100px] rounded-[20px]">
                <FaGolang className="text-6xl" />
              </div>
              <div className="flex justify-center items-center bg-foreground text-background w-[100px] h-[100px] rounded-[20px]">
                <SiMongodb className="text-6xl" />
              </div>
              <div className="flex justify-center items-center bg-foreground text-background w-[100px] h-[100px] rounded-[20px]">
                <BiLogoPostgresql className="text-6xl" />
              </div>
              <div className="flex justify-center items-center bg-foreground text-background w-[100px] h-[100px] rounded-[20px]">
                <SiNodedotjs className="text-6xl" />
              </div>

              <div className="flex justify-center items-center bg-foreground text-background w-[100px] h-[100px] rounded-[20px]">
                <SiTypescript className="text-6xl" />
              </div>
              <div className="flex justify-center items-center bg-foreground text-background w-[100px] h-[100px] rounded-[20px]">
                <FaDocker className="text-6xl" />
              </div>
              <div className="flex justify-center items-center bg-foreground text-background w-[100px] h-[100px] rounded-[20px]">
                <SiKubernetes className="text-6xl" />
              </div>
              <div className="flex justify-center items-center bg-foreground text-background w-[100px] h-[100px] rounded-[20px]">
                <FaPython className="text-6xl" />
              </div>
            </div>
          </div>

          <div className="rounded-l-[50px] bg-accent-beige min-h-[40vh] flex px-14 flex-col gap-14 justify-center">
            <h2 className="feature-title max-w-[90%] text-4xl font-semibold leading-tight">
              {config.designSection.leftTitle}
            </h2>
            <p className="text-lg text-justify">
              {config.designSection.leftDescription}
            </p>
          </div>
          <div className="rounded-r-[50px] bg-foreground text-background min-h-[40vh] flex px-14 flex-col gap-14 justify-center">
            <h2 className="feature-title max-w-[90%] ml-auto text-4xl leading-tight text-right">
              {config.designSection.rightTitle}
            </h2>
            <p className="text-lg text-justify">
              {config.designSection.rightDescription}
            </p>
          </div>
        </div>

        <div className="py-10 flex px-6 flex-col gap-2 justify-center">
          <h2 className="feature-title text-6xl font-semibold leading-tight">
            {config.finalSection.title}
          </h2>
          <a
            href={config.finalSection.ctaLink}
            className="cta-button max-w-fit mt-4 font-medium py-4 px-8 rounded-full bg-foreground text-background flex items-center gap-4"
          >
            {config.finalSection.ctaText} <FaArrowRight className="float" />
          </a>
        </div>

        <footer className="text-center pb-2 text-sm">
          Crafted with ❤️ by Vishal, © {new Date().getFullYear()}. All rights
          reserved.
        </footer>
      </div>
    </main>
  );
}
