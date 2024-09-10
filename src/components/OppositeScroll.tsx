// components/MatterComponent.tsx
import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import Image from "next/image";

interface MatterComponentProps {
  width: number;
  height: number;
}

const MatterComponent: React.FC<MatterComponentProps> = ({ width, height }) => {
  const scene = useRef<HTMLDivElement>(null);
  const [warningTouched, setWarningTouched] = useState(false);

  useEffect(() => {
    const { Engine, Render, Runner, World, Bodies, MouseConstraint } = Matter;

    // Create engine
    const engine = Engine.create();
    const world = engine.world;
    let idRAF = null;
    let mouseConstraint = MouseConstraint.create(engine);
    World.add(engine.world, mouseConstraint);
    engine.gravity.x = 0;
    engine.gravity.y = 2;

    // Create renderer
    const render = Render.create({
      element: scene.current!,
      engine: engine,
      options: {
        width: width, // Use passed width
        height: height, // Use passed height
        background: "transparent",
        wireframes: false, // Disable wireframes for visible bodies
        showAngleIndicator: false, // Hide angle indicators
      },
    });

    if (warningTouched) Render.run(render);

    // Create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Add bodies (4 squares)
    for (let i = 0; i < 100; i++) {
      let radius = 2 + Math.random() * 20;
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
            restitution: 0.65,
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

      //   Bodies.circle(width / 2, height / 2 + 40, 120, {
      //     restitution: 0.8,
      //     isStatic: true,
      //     render: {
      //       visible: false,
      //     },
      //   }),
    ]);

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
        backgroundColor: "#ffffff", // Ensure background color matches the renderer
      }}
    >
      <div
        // animate={{ y: [0, -5, 0] }} // Float up and down
        // transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="absolute inset-0 flex justify-center items-center top-10 cursor-pointer opacity-80 w-full"
      >
        {!warningTouched && (
          <div className="relative" onClick={() => setWarningTouched(true)}>
            <span className="absolute whitespace-nowrap text-xl font-semibold uppercase left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
              Don't touch
            </span>
            <Image
              src="/images/sayhi.png"
              className=""
              alt="link-to-email"
              width={250}
              height={250}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MatterComponent;
