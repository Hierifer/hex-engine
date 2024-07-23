// https://github.com/liabru/matter-js/wiki/Getting-started
// https://brm.io/matter-js/docs/
import Matter from 'matter-js'

const init = (target: string, width:number, height: number)=>{
    console.log("called here")
    // module aliases
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

    // create an engine
    const engine = Engine.create();
    console.log(width, height)

    // create a renderer
    const render = Render.create({
        element: document.getElementById(target)!,
        engine: engine,
        options: {
            width,
            height,
            wireframes: false,
            background: 'transparent',
        }
    });
    render.canvas.style.position = 'absolute'
    render.canvas.style.top = '0px'

    // create two boxes and a ground
    const boxA = Bodies.rectangle(400, 200, 80, 80);
    const boxB = Bodies.rectangle(450, 50, 80, 80);
    const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

    // add all of the bodies to the world
    Composite.add(engine.world, [boxA, boxB, ground]);

    // run the renderer
    Render.run(render);

    // create runner
    const runner = Runner.create()

    // run the engine
    Runner.run(runner, engine)
}

export default {
    init
}