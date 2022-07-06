import React from "react";

const Contact: React.FC = () => {
  return (
    <div className="py-10" id="contact">
      <h1 className="title mb-10">/ Contact me </h1>
      <p className="text-slate  font-thin text-xl sm:text-3xl sm:mt-2 md:w-[90%] lg:w-[80%] text-justify lg:text-start">
        &quot;There may be 101 ways to be cool / awesome but not even one of
        them tops having your own cool website.&quot;
        <br />{" "}
        <span className="text-right block">
          -Marcus Aurelius (<span className="text-green"> probably </span>)
        </span>
        <br />
        Have a project in mind, feel free to hit me up .
      </p>
      <br />
      <a href="mailto:vishaaxl@gmail.com">
        <div className="primary-button flex items-center max-w-fit md:scale-120">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span>Say hi!</span>
        </div>
      </a>
    </div>
  );
};

export default Contact;
