import { Application, Assets, Sprite } from 'pixi.js';
import PhysiceManager from '../physics/index'
import GameObject from '../scene/GameObject'
import { DEFAULT_TARGET_LOC } from '../utils/constant'
import PhysicsManager from '../physics/index';

// 对象类型定义
type GG_CONFIG = {
    target?: string
    options?: GG_CONFIG_SIZE
}
type GG_CONFIG_SIZE = {
    width: number,
    height: number,
}
class GameGenerator{
    status = 'init'
    targetLoc = DEFAULT_TARGET_LOC
    app:Application
    size:GG_CONFIG_SIZE = {width: 1000, height: 1000}
    goManager: Array<GameObject> = new Array<GameObject>()
    phyManager: PhysicsManager

    constructor(config: GG_CONFIG){
        this.targetLoc = config.target || DEFAULT_TARGET_LOC
        this.app = new Application();
        this._init().then(() => {
            this.status = 'mounted'
            this.update()
        })
        this.phyManager = new PhysiceManager(this.targetLoc)
    }
    async _init(){
        // Create a PixiJS application.
        await this.load()
        await this.mount()
        this.phyManager.init(this.app.screen.width, this.app.screen.height).loadScene(this.goManager)
    }
    _destory(){

    }
    getDebugGameObjects(){
        return this.app.stage.getChildrenByLabel('Sprite')
    }
    mount(){
        // Then adding the application's canvas to the DOM body.
        if(this.targetLoc === DEFAULT_TARGET_LOC){
            document.body.appendChild(this.app.canvas);
        } else {
            if(document.getElementById(this.targetLoc) !== null){
                document.getElementById(this.targetLoc)?.appendChild(this.app.canvas)
            } else {
                // fallback
                this.targetLoc = DEFAULT_TARGET_LOC
                document.body.appendChild(this.app.canvas);
            }
        }
    }
    resize(){

    }
    async load(){
        // Intialize the application.
        await this.app.init({ background: '#1099bb', resizeTo: window });

        // GameObject 的初始化都在这里
        // Load the bunny texture.
        const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

        // Create a new Sprite from an image path.
        const bunny = new Sprite(texture);

        // Add to stage.
        this.app.stage.addChild(bunny);
        console.log(bunny.label)
        

        // Center the sprite's anchor point.
        bunny.anchor.set(0.5);

        // Move the sprite to the center of the screen.
        bunny.x = this.app.screen.width / 2;
        bunny.y = this.app.screen.height / 2;
        const bunnyGameObject = new GameObject(0, {posX: bunny.x, posY: bunny.y},{}).addSprite(bunny)
        this.goManager.push(bunnyGameObject)

    }
    async update(){
        // Add an animation loop callback to the application's ticker.
        this.app.ticker.add((time) =>
        {
            // physics update
            const updatedPhyMap = this.phyManager.getUpdatedMap()

            // GameObject 的 update 应该都执行在这里
            for(let i = 0; i < this.goManager.length; i++){
                const curGO = this.goManager[i]
                const ro = curGO.components[0]
                ro.position = updatedPhyMap.get(curGO.id)?.pos || { x: 0, y:0 }
                ro.rotation = updatedPhyMap.get(curGO.id)?.angle || 0
            }
            

            // const bunny = this.app.stage.getChildAt(0)
            
            // if(bunny){
            //     bunny.rotation += 0.1 * time.deltaTime;
            // }

            if(document.getElementById('debugObject')){
                document.getElementById('debugObject')!.innerHTML = 
                    this.app.stage.getChildrenByLabel('Sprite').reduce((prev, cur) => {
                            return prev + ',' + cur.label
                        }, '')
            }
        });
    }
}

export default GameGenerator