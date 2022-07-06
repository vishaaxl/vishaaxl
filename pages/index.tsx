import type { NextPage } from "next";

import Head from "next/head";

import Transition from "components/global/Transition";
import Hero from "components/home/Hero";
import About from "components/home/About";
import Contact from "components/home/Contact";
import Socials from "components/global/Socials";
import Projects from "components/home/Project";

const Home: NextPage = () => {
  return (
    <Transition id="home">
      <div>
        <Head>
          <title>Vishal Shukla | Web app</title>
          <meta
            name="description"
            content="Web app to store and manage all your invoices"
          />
          <link
            rel="icon"
            href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🗿</text></svg>"
          />
        </Head>
        <Hero />
        <Projects />
        <About />
        <Contact />
        <Socials />
      </div>
    </Transition>
  );
};

export default Home;
