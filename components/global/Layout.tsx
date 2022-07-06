import React, { ReactNode } from "react";

import Navigation from "components/global/Navigation";
import { LoadingProgress } from "components/global/Loader";

interface Props {
  children: ReactNode;
  loading: boolean;
}

const Layout: React.FC<Props> = ({ children, loading }) => {
  return (
    <>
      {loading && <LoadingProgress key="progress-bar" />}
      <Navigation />
      <div className="wrapper">{children}</div>
      {/* footer */}
    </>
  );
};

export default Layout;
