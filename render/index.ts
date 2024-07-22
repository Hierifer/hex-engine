import { Application, Assets, Sprite } from 'pixi.js';

const DEFAULT_TARGET_LOC = 'body'

type GGCONFIG = {
    target?: string
}

class GameGenerator{
    status = 'init'
    targetLoc = DEFAULT_TARGET_LOC
    app:Application

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
    async load(){
        // Intialize the application.
        await this.app.init({ background: '#1099bb', resizeTo: window });

        // Load the bunny texture.
        const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

        // Create a new Sprite from an image path.
        const bunny = new Sprite(texture);
        const bunny2 = new Sprite(texture);

        // Add to stage.
        this.app.stage.addChild(bunny);
        this.app.stage.addChild(bunny2);
        console.log(bunny.label)
        console.log(bunny2.label)
        

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