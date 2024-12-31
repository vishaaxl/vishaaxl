import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { PiFlowerFill } from "react-icons/pi";

export default function Home() {
  return (
    <main className="container">
      <div className="hero-text w-full font-bold text-8xl flex flex-col justify-center min-h-[70vh] lg:min-h-[40vh] lg:flex-row lg:items-center lg:text-[112px] lg:whitespace-nowrap mt-10">
        <span>Making</span>
        <span>Cool</span>
        <span>Sh#t</span>
        <span>Happen</span>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[50px] p-8 lg:p-10 flex flex-col justify-start lg:justify-center gap-5 overflow-hidden w-full bg-accent-beige min-h-[100vh] lg:min-h-[50vh] relative">
          <h2 className="feature-title text-5xl lg:text-6xl font-semibold leading-tight">
            Here to make you look
            <br />
            good and win business.
          </h2>
          <p className="feature-description text-right lg:text-left text-2xl max-w-[600px]">
            Websites that convert and apps that feel effortless. Clean, clear,
            and thoughtfully designed.
          </p>
          <a
            href="mailto:vishaaxl@gmail.com"
            className="cta-button max-w-fit mt-4 font-medium py-4 px-8 rounded-full bg-foreground text-background flex items-center gap-4"
          >
            Get in Touch <FaArrowRight className="float" />
          </a>
          <PiFlowerFill className="flower-icon text-accent-red absolute bottom-[-145px] right-[-100px] text-[500px] rotate" />
        </div>

        <div className="px-8 py-20">
          <span className="font-medium">What I do</span>
          <h2 className="feature-title md:text-6xl text-5xl font-semibold leading-tight">
            Whatever It Takes
          </h2>
          <div className="grid lg:grid-cols-3 gap-8 pt-20">
            <div>
              <span className="font-semibold block mb-4 text-slate-700 text-sm">
                .01
              </span>
              <h4 className="font-semibold text-2xl pb-4">Design</h4>
              <p className="leading-[1.8] text-slate-700">
                I create intuitive and visually stunning designs that leave a
                lasting impression. From user interface layouts to branding,
                every detail is crafted to connect.
              </p>
            </div>
            <div>
              <span className="font-semibold block mb-4 text-slate-700 text-sm">
                .02
              </span>
              <h4 className="font-semibold text-2xl pb-4">Development</h4>
              <p className="leading-[1.8] text-slate-700">
                With expertise in modern technologies, I develop clean,
                efficient, and scalable applications. Whether it’s a web
                platform, a mobile app, or a complex system.
              </p>
            </div>
            <div>
              <span className="font-semibold block mb-4 text-slate-700 text-sm">
                .03
              </span>
              <h4 className="font-semibold text-2xl pb-4">Deployment</h4>
              <p className="leading-[1.8] text-slate-700">
                I handle end-to-end deployment processes, ensuring your product
                is live and accessible to the world. With a focus on
                scalability, performance, and uptime.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-20">
          <div className="text-center">
            <span className="font-medium">Projects</span>
            <h2 className="feature-title md:text-6xl text-5xl font-semibold leading-tight">
              Some of my works
            </h2>
          </div>
        </div>

        <div className="py-10 flex px-8 flex-col gap-2 justify-center pb-24">
          <h2 className="feature-title text-6xl font-semibold leading-tight">
            Wanna Connect ?
          </h2>
          <a
            href="mailto:vishaaxl@gmail.com"
            className="cta-button max-w-fit mt-4 font-medium py-4 px-8 rounded-full bg-foreground text-background flex items-center gap-4"
          >
            Drop an email <FaArrowRight className="float" />
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
