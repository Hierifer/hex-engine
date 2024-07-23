import { Application, Assets, Sprite } from 'pixi.js';
import Physice from '../physics/index'

// 默认设置变量
const DEFAULT_TARGET_LOC = 'body'

// 对象类型定义
type GGCONFIG = {
    target?: string
}
type IGAME_SIZE = {
    width: number,
    height: number,
}


class GameGenerator{
    status = 'init'
    targetLoc = DEFAULT_TARGET_LOC
    app:Application
    size:IGAME_SIZE = {width: 1000, height: 1000}

    constructor(config:GGCONFIG){
        this.targetLoc = config.target || DEFAULT_TARGET_LOC
        this.app = new Application();
        this._init().then(() => {
            this.status = 'mounted'
            this.update()
        })
    }
    async _init(){
        // Create a PixiJS application.
        await this.load()
        await this.mount()
        Physice.init(this.targetLoc, this.app.screen.width, this.app.screen.height)
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
    }
    async update(){
        // Add an animation loop callback to the application's ticker.
        this.app.ticker.add((time) =>
        {
            // GameObject 的 update 应该都执行在这里
            const bunny = this.app.stage.getChildAt(0)
            
            if(bunny){
                bunny.rotation += 0.1 * time.deltaTime;
            }

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