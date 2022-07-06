import React from "react";
import ProjectCard from "./ProjectCard";

import { projectsData } from "utils/data";

const Projects: React.FC = () => {
  return (
    <div className="sm:my-[8vh] my-[5vh]" id="work">
      <h1 className="title mb-10">/ Projects showcase</h1>
      <div className="lg:flex">
        {projectsData.slice(0, 2).map((data) => (
          <ProjectCard key={data.name} data={data} />
        ))}
      </div>
      <div className="lg:flex">
        {projectsData.slice(2, 4).map((data) => (
          <ProjectCard key={data.name} data={data} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
