import { Sprite } from 'pixi.js';

export class GameObject {
    id: number = 0
    geo: GO_GEOMETRY = {posX: 0, posY:0, rotX: 0, rotY: 0, scaleX:0, scaleY: 0}
    attrs = {width: 100, height: 100}
    components: Array<Sprite> = []
    constructor(id: number, geo: Partial<GO_GEOMETRY>, attrs: Partial<{width: number, height: number}>){
        this.id = id
        this.geo = {...this.geo, ...geo}
        this.attrs = {...this.attrs, ...attrs}
    }
    addSprite(sprite: Sprite){
        this.components.push(sprite)
        return this
    }
    _mountd(){

    }
    _destory(){

    }
    start(){

    }
    update(){

    }
    addComponents(){

    }
    removeComponents(){

    }
}
export default GameObject

