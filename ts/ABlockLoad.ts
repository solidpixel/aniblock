/*
 * Aniblock Copyright (c) 2019, Pete Harris
 */
import { AScene } from './AScene'
import { ALink } from './ALink'
import { ABlock, Dir, ZOrder } from './ABlock'
import { Sine } from 'gsap/TweenMax'

/**
 * The ABlock provides the main building block for the diagrams, representing
 * a physical component in the device.
 */
export class ABlockLoad extends ABlock {
    private isMeterVisible: boolean
    private currentIndex: number

    /**
     * Create a new block.
     *
     * @param scene The parent scene.
     * @param id The DOM ID for this block.
     * @param cls The DOM class (or class list) for this block.
     * @param label The label string for this block. Note that this may be
     *              a multi-line string; encode newlines in the input string.
     * @param x The starting X coordinate. May be a number or a string, where
     *          the string is the name of a vertical guide.
     * @param y The starting Y coordinate. May be a number or a string, where
     *          the string is the name of a horizontal guide.
     * @param w The starting width.
     * @param h The starting height.
     * @param z The Z-order for the block (default "top").
     */
    constructor(
        scene: AScene,
        id: string,
        cls: string,
        label: string,
        x: any,
        y: any,
        w: number,
        h: number,
        z: ZOrder = ZOrder.Top
    ) {
        super(scene, id, cls, label, x, y, w, h, z)
        this.isMeterVisible = false
        this.currentIndex = 0
    }

    /*
     * @hidden
     *
     * Generate SVG elements for the block.
     *
     * @param svg: The parent SVG element to add to.
     */
    public generate_svg(svg: HTMLElement): SVGElement {
        let group = super.generate_svg(svg)

        // Create the load meter
        let rect = document.createElementNS(this.ns, 'rect')
        rect.setAttribute('class', 'ALoadMeter')
        rect.setAttribute('x', String(this.x + this.w / 2 + 11))
        rect.setAttribute('y', String(this.y + this.h / 2))
        rect.setAttribute('width', String(6))
        rect.setAttribute('height', String(0))
        group.appendChild(rect)

        // Create the load meter
        rect = document.createElementNS(this.ns, 'rect')
        rect.setAttribute('class', 'ALoad')
        rect.setAttribute('x', String(this.x + this.w / 2 + 10))
        rect.setAttribute('y', String(this.y - this.h / 2))
        rect.setAttribute('width', String(8))
        rect.setAttribute('height', String(this.h))
        group.appendChild(rect)

        return group
    }

    /**
     * Animate this block appearing.
     *
     * If the block has a zero width or zero height the show animation is
     * instant with no tweening.
     *
     * @param timeOffset The time offset to apply, in seconds, relative to the
     *                   current end of the timeline (may be negative).
     *
     * @returns The length of this animation in seconds.
     */
    public show_load(timeOffset: number = null): number {
        this.isMeterVisible = true

        let tl = this.scene.tl
        let timeStr = this.get_timeoffset(timeOffset)
        let time = 1

        let rectId = '#' + this.id + ' rect.ALoad'
        tl.to(rectId, time, { strokeOpacity: 1 }, timeStr)

        let rectId2 = '#' + this.id + ' rect.ALoadMeter'
        tl.to(rectId2, time, { fillOpacity: 1, strokeOpacity: 1 }, '-=1')

        return time
    }

    /**
     * Set load ...
     */
    public set_load(
        load: number,
        range: number = 0,
        timeOffset: number = null,
        update: boolean = false
    ): number {
        let rand = Math.random() * range * 2
        let randLoad = load - range + rand
        randLoad = Math.max(randLoad, 0)
        randLoad = Math.min(randLoad, 100)
        randLoad = randLoad / 100.0

        let tl = this.scene.tl
        if (update) {
            var timeStr = tl.time()
        } else {
            var timeStr = this.get_timeoffset(timeOffset)
        }
        let rectId = '#' + this.id + ' rect.ALoadMeter'

        let red = Math.floor(randLoad * 255.0)
        let green = Math.floor((1.0 - randLoad) * 255.0)
        let color = 'rgb(' + String(red) + ',' + String(green) + ',0)'
        let newH = this.h * randLoad
        let newY = -newH

        let time = this.isMeterVisible ? 1 : 0
        time = update ? time * 0.5 : time
        tl.to(
            rectId,
            time,
            {
                fill: color,
                y: newY,
                height: newH,
                onComplete: this.complete_callback,
                callbackScope: this,
                onCompleteParams: [load, range],
            },
            timeStr
        )
        return time
    }

    private complete_callback(load: number, range: number) {
        if (range != 0) {
            let tl = this.scene.tl
            this.set_load(load, range, null, true)
        }
    }

    /**
     * Set load ...
     */
    public hide_load(timeOffset: number = null): number {
        this.isMeterVisible = false

        let tl = this.scene.tl
        let timeStr = this.get_timeoffset(timeOffset)

        let time = 1
        let rectId = '#' + this.id + ' rect.ALoad'
        tl.to(rectId, time, { fillOpacity: 0, strokeOpacity: 0 }, timeStr)

        let rectId2 = '#' + this.id + ' rect.ALoadMeter'
        tl.to(rectId2, time, { fillOpacity: 0, strokeOpacity: 0 }, '-=1')
        return time
    }
}