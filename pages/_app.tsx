import "../styles/globals.css";
import { AnimatePresence } from "framer-motion";
import type { AppProps } from "next/app";

import Router from "next/router";
import { useEffect, useState } from "react";

import Layout from "components/global/Layout";
import Loader from "components/global/Loader";

function MyApp({ Component, pageProps }: AppProps) {
  const [preLoader, setPreLoader] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    //initial load
    setTimeout(() => {
      setPreLoader(false);
    }, 2500);
  }, []);

  useEffect(() => {
    const handleStart = (url: string) =>
      url !== Router.asPath && setLoading(true);

    const handleComplete = (url: string) =>
      url === Router.asPath &&
      setTimeout(() => {
        setLoading(false);
      }, 1000);

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleComplete);
    Router.events.on("routeChangeError", handleComplete);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleComplete);
      Router.events.off("routeChangeError", handleComplete);
    };
  }, []);

  return (
    <AnimatePresence exitBeforeEnter>
      {preLoader ? (
        <Loader key="preloader" />
      ) : (
        <Layout loading={loading}>
          <Component {...pageProps} />
        </Layout>
      )}
    </AnimatePresence>
  );
}

export default MyApp;
