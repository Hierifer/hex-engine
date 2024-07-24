// https://github.com/liabru/matter-js/wiki/Getting-started
// https://brm.io/matter-js/docs/
import Matter from 'matter-js'
import GameObject from '../scene/GameObject'
import { DEFAULT_TARGET_LOC } from '../utils/constant'

type IPM_OPTIONS = {
    width: number,
    height: number,
}

class PhysicsManager{
    Engine = Matter.Engine
    Bodies = Matter.Bodies
    Composite = Matter.Composite
    // create an engine
    engine = this.Engine.create();
    private target = DEFAULT_TARGET_LOC
    options = {width: 1000, height: 1000}
    pBodyMap = new Map<number, Matter.Body>()


    constructor(target: string, options?: IPM_OPTIONS){
        this.target = target
        this.options = this.options || options

    }
    init(width:number, height: number){
        // module aliases
        const Render = Matter.Render,
            Runner = Matter.Runner;
    
        this.options = {width, height}
        
        // create a renderer
        const render = Render.create({
            element: document.getElementById(this.target)!,
            engine: this.engine,
            options: {
                width,
                height,
                wireframes: false,
                background: 'transparent',
            }
        });
        render.canvas.style.position = 'absolute'
        render.canvas.style.top = '0px'
    
        const WALLTHICK = 40
    
        // create two boxes and a ground
        const boxA = this.Bodies.rectangle(400, 200, 80, 80);
        const boxB = this.Bodies.rectangle(450, 50, 80, 80);
        const wallLeft = this.Bodies.rectangle(-1 * WALLTHICK, height/2, WALLTHICK, height, { isStatic: true });
        const wallRight = this.Bodies.rectangle(width + WALLTHICK, height/2, WALLTHICK, height, { isStatic: true });
        const ground = this.Bodies.rectangle(width/2, height - 2 * WALLTHICK, width, WALLTHICK, { isStatic: true });
        Matter.Body.setAngle(ground, .04)
        //ground.angle = 0.01
    
        // add all of the bodies to the world
        this.Composite.add(this.engine.world, [boxA, boxB, wallLeft, wallRight, ground]);
    
        // run the renderer
        //Render.run(render);
    
        // create runner
        const runner = Runner.create()
    
        // run the engine
        Runner.run(runner, this.engine)

        return this
    }
    addObjs2World(objs: Array<Matter.Body>){
        this.Composite.add(this.engine.world, objs)
    }
    loadScene(GameObjects: Array<GameObject>){
        for(let i = 0; i < GameObjects.length; i++){
            const id = GameObjects[i].id
            const curGEO = GameObjects[i].geo
            const curAttrs = GameObjects[i].attrs
            const box = this.Bodies.rectangle(curGEO.posX, curGEO.posY, curAttrs.width, curAttrs.height);
            this.pBodyMap.set(id, box)
            this.addObjs2World([box])
        }
        return this
    }
    getUpdatedMap(){
        const out = new Map<number, {pos: Matter.Vector, angle: number}>()
        const keys = [...this.pBodyMap.keys()]
        for(let i = 0; i < keys.length; i++){
            const k = keys[i]
            const v = { pos: this.pBodyMap.get(k).position, angle: this.pBodyMap.get(k).angle }
            out.set(k,v)
        }
        return out
    }
}

export default PhysicsManager