import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import NextImage from "next/image";

interface MatterComponentProps {
  width: number;
  height: number;
}

const techSvgs = [
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-plain.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rabbitmq/rabbitmq-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nginx/nginx-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azuresqldatabase/azuresqldatabase-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
];

const MatterComponent: React.FC<MatterComponentProps> = ({ width, height }) => {
  const scene = useRef<HTMLDivElement>(null);
  const [warningTouched, setWarningTouched] = useState(false);

  //   useEffect(() => {
  //     // Observer for checking if the container is in the viewport
  //     const observer = new IntersectionObserver(
  //       (entries) => {
  //         entries.forEach((entry) => {
  //           if (entry.isIntersecting) {
  //             setWarningTouched(true); // Start the animation
  //           }
  //         });
  //       },
  //       {
  //         threshold: 1.0, // Trigger only when 100% of the element is visible
  //       }
  //     );

  //     // Start observing the scene
  //     if (scene.current) {
  //       observer.observe(scene.current);
  //     }

  //     return () => {
  //       if (scene.current) {
  //         observer.unobserve(scene.current);
  //       }
  //     };
  //   }, []);

  useEffect(() => {
    const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint } =
      Matter;

    // Create engine
    const engine = Engine.create();
    const world = engine.world;

    // Create renderer
    const render = Render.create({
      element: scene.current!,
      engine: engine,
      options: {
        width: width,
        height: height,
        background: "transparent",
        wireframes: false,
      },
    });

    if (warningTouched) Render.run(render);

    // Create runner
    const runner = Runner.create();
    let idRAF = null;
    Runner.run(runner, engine);

    // Preload all SVGs as images
    const loadSvgImages = techSvgs.map((src) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });
    });

    // When all SVGs are preloaded, create Matter.js bodies
    Promise.all(loadSvgImages).then((images) => {
      [...images].forEach((img, i) => {
        let size = width < 400 ? 60 : 80 + Math.random() * 20; // Random size between 120 and 140
        let randomX = 40 + Math.random() * (width - 80); // Random starting X position
        let randomY = 80; // Random starting Y position above the canvas

        const texture = img.src;
        let randomFrictionAir = 0.001 + Math.random() * 0.01;

        World.add(
          engine.world,
          Bodies.rectangle(randomX, randomY, size, size, {
            render: {
              sprite: {
                texture: texture, // Use the SVG as texture
                xScale: size / img.width,
                yScale: size / img.height,
              },
            },
            restitution: 0.75, // Bounciness
            frictionAir: randomFrictionAir, // Slow down speed in the air
            density: 0.5, // Allow interaction
          })
        );
      });
    });

    for (let i = 0; i < 50; i++) {
      let radius = 2 + Math.random() * 20;
      if (width < 400) continue;
      World.add(
        engine.world,
        Bodies.circle(
          40 + Math.random() * width - 80,
          40 + Math.random() * 100,
          radius,
          {
            render: {
              fillStyle: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"][
                Math.round(Math.random() * 3)
              ],
            },
            restitution: 0.0125, // Bounciness
            density: 0.5,
          }
        )
      );
    }

    // Add invisible walls (static bodies)
    World.add(world, [
      Bodies.rectangle(width / 2, -25, width, 50, {
        isStatic: true,
        render: { visible: false },
      }), // Top
      Bodies.rectangle(width / 2, height + 25, width, 50, {
        isStatic: true,
        render: { visible: false },
      }), // Bottom
      Bodies.rectangle(width + 25, height / 2, 50, height, {
        isStatic: true,
        render: { visible: false },
      }), // Right
      Bodies.rectangle(-25, height / 2, 50, height, {
        isStatic: true,
        render: { visible: false },
      }), // Left
    ]);

    // // Create a Mouse object and bind it to the render
    // const mouse = Mouse.create(render.canvas);
    // const mouseConstraint = MouseConstraint.create(engine, {
    //   mouse: mouse,
    //   constraint: {
    //     stiffness: 0.1,
    //     render: {
    //       visible: false,
    //     },
    //   },
    // });

    let inc = 0;

    engine.gravity.y = 2;
    function update() {
      if (inc > 12) {
        engine.gravity.x = Math.cos(inc / 90);
        engine.gravity.y = Math.sin(inc / 90);
      }
      inc++;
      idRAF = requestAnimationFrame(update);
    }

    update();

    return () => {
      Matter.Render.stop(render);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [width, height, warningTouched]);

  return (
    <div
      ref={scene}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        className={`absolute flex items-center justify-center inset-0 top-10 cursor-pointer opacity-80 w-full ${
          warningTouched && "pointer-events-none"
        }`}
      >
        {
          <div
            className="relative flex items-center justify-center"
            onClick={() => setWarningTouched(true)}
          >
            <span className="absolute whitespace-nowrap text-xl font-semibold uppercase left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
              {warningTouched ? "Told you not to touch" : "Don't touch"}
            </span>
            {!warningTouched && (
              <NextImage
                src="/images/sayhi.png"
                alt="link-to-email"
                width={250}
                height={250}
              />
            )}
          </div>
        }
      </div>
    </div>
  );
};

export default MatterComponent;
