import { FaArrowRight } from "react-icons/fa";

import { PiFlowerFill } from "react-icons/pi";

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
      <div className="ml-auto max-w-fit sticky top-0 z-[100] bg-foreground text-background rounded-b-[20px] py-3 hover:text-accent-beige transition-all">
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

      <div className="hero-text w-full font-bold text-8xl flex flex-col  justify-center min-h-[70vh] lg:min-h-[40vh] lg:flex-row lg:items-center lg:text-[112px] lg:whitespace-nowrap mt-10">
        <span>Making</span>
        <span>Cool</span>
        <span>Sh#t</span>
        <span>Happen</span>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[50px] p-8 lg:p-10 flex flex-col justify-start lg:justify-center gap-5 overflow-hidden w-full bg-accent-beige min-h-[100vh] lg:min-h-[50vh] relative">
          <h2 className="feature-title text-5xl lg:text-6xl font-semibold leading-tight">
            {config.featureSection.title}
          </h2>
          <p className="feature-description text-right lg:text-left text-2xl max-w-[600px]">
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
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="py-16 min-h-[40vh] flex lg:px-6 flex-col gap-10 justify-start relative">
            <div>
              <h2 className="text-5xl font-semibold leading-tight">
                Designing digital products with emphasis on visual design
              </h2>
              <span className="text-2xl font-semibold block mt-2">
                Working Experience
              </span>
            </div>

            <div>
              <h2 className="font-medium text-2xl">- Virtue Analytics</h2>
              <p className="mt-2 text-lg">
                <span className="font-medium">Role:</span> Full-Stack Developer
              </p>
              <p className="text-sm italic text-gray-600">
                May 2023 – Present | Lucknow, India
              </p>
              <ul className="[&>*]:mb-4 mt-4">
                <li className="text-justify">
                  Managed a HIPAA-compliant healthcare application for a US
                  client, ensuring full compliance with data security and
                  privacy regulations. Implemented encryption, access control,
                  and best practices to safeguard sensitive patient data.
                </li>
                <li className="text-justify">
                  Led front-end development for an EdTech application designed
                  to help students select colleges based on interests, academic
                  profiles, and budgets. Collaborated with a team to integrate
                  predictive AI models, simplifying the college selection
                  process.
                </li>
                <li>
                  <span className="font-medium">Techs used:</span> Next.js,
                  React Native, Firebase, Node.js, Vercel
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-medium text-2xl">- Ample Media Agency</h2>
              <p className="mt-2 text-lg">
                <span className="font-medium">Role:</span> Full Stack Web and
                Mobile Developer
              </p>
              <p className="text-sm italic text-gray-600">
                Jun 2020 – Apr 2023 | Remote, India
              </p>
              <ul className="[&>*]:mb-4 mt-4">
                <li className="text-justify">
                  Designed and deployed a full-stack portal for legal
                  professionals, creating both web and mobile applications. This
                  platform streamlined the case filing process and improved
                  operational effectiveness by efficiently matching lawyers with
                  cases.
                </li>
                <li className="text-justify">
                  Guided a client through the entire design journey from concept
                  to product launch, securing funding for their startup.
                  Developed an e-commerce app with location-based functionality
                  connecting wholesalers and retailers.
                </li>
                <li>
                  <span className="font-medium">Techs used:</span> Next.js,
                  Strapi, Express, Docker, PostgreSQL, MongoDB, Go, AWS
                </li>
              </ul>
            </div>
          </div>

          <div className=""></div>

          <div className="rounded-l-[50px] bg-accent-beige min-h-[80vh] lg:min-h-[50vh] flex px-14 flex-col gap-14 justify-center">
            <h2 className="feature-title max-w-[90%] text-4xl font-semibold leading-tight">
              {config.designSection.leftTitle}
            </h2>
            <p className="text-lg text-justify">
              {config.designSection.leftDescription}
            </p>
          </div>
          <div className="rounded-r-[50px] bg-foreground text-background min-h-[80vh] lg:min-h-[50vh] flex px-14 flex-col gap-14 justify-center">
            <h2 className="feature-title max-w-[90%] ml-auto text-4xl leading-tight text-right">
              {config.designSection.rightTitle}
            </h2>
            <p className="text-lg text-justify">
              {config.designSection.rightDescription}
            </p>
          </div>
        </div>

        <div className="py-10 flex px-6 flex-col gap-2 justify-center pb-24">
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
