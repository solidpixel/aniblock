/*
 * Aniblock: Copyright (c) 2019, Pete Harris
 */
import { Scene } from './Scene';
import { Block } from './Block';

/**
 * The ABlock provides the main building block for the diagrams, representing
 * a physical component in the device.
 */
export class BlockLoad extends Block {
    private isMeterVisible: boolean;

    /**
     * Create a new block with load meter.
     *
     * Note that new blocks are created in a hidden state; call the
     * [[show|`show()`]] method to animate the main block appearing. The load
     * meter itself is a separate entity which must be shown by calling
     * [[show_load|show_load()]].
     *
     * @param scene The parent scene.
     * @param label The label string for this block. This may be a multi-line
     *              string, with lines separated by `\n` characters.
     * @param x The starting X coordinate; any input accepted by [[Position]].
     * @param y The starting Y coordinate; any input accepted by [[Position]].
     * @param w The starting width.
     * @param h The starting height.
     * @param cls The DOM class, or class list, for this block. Supplying this
     *            parameter is optional, but will be needed in order to apply
     *            custom styles to subsets of the blocks in the diagram.
     */
    constructor(
        scene: Scene,
        label: string,
        x: any,
        y: any,
        w: number,
        h: number,
        cls: string = null
    ) {
        super(scene, label, x, y, w, h, cls);
        this.isMeterVisible = false;
    }

    /*
     * @hidden
     *
     * Generate SVG elements for the block.
     *
     * @param svg: The parent SVG element to add to.
     */
    public generate_svg(svg: HTMLElement): SVGElement {
        // Create the block itself
        let group = super.generate_svg(svg);

        // Create the load meter
        let rect = document.createElementNS(this.ns, 'rect');
        rect.setAttribute('class', 'ALoadMeter');
        rect.setAttribute('x', String(this.xStart + this.w / 2 + 11));
        rect.setAttribute('y', String(this.yStart + this.h / 2));
        rect.setAttribute('width', String(6));
        rect.setAttribute('height', String(0));
        group.appendChild(rect);

        // Create the load meter
        rect = document.createElementNS(this.ns, 'rect');
        rect.setAttribute('class', 'ALoad');
        rect.setAttribute('x', String(this.xStart + this.w / 2 + 10));
        rect.setAttribute('y', String(this.yStart - this.h / 2));
        rect.setAttribute('width', String(8));
        rect.setAttribute('height', String(this.h));
        group.appendChild(rect);

        return group;
    }

    /**
     * Animate the load meter appearing.
     *
     * TODO: Add show_load animation.
     *
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public show_load(startTime: number = null): number {
        this.isMeterVisible = true;

        let tl = this.scene.tl;
        let tlEndTime = tl.duration();

        let time = this.scene.showTime;
        let rectId = '#' + this.id + ' rect.ALoad';
        tl.to(rectId, time, { strokeOpacity: 1 }, startTime);

        let rectId2 = '#' + this.id + ' rect.ALoadMeter';
        tl.to(rectId2, time, { fillOpacity: 1, strokeOpacity: 1 }, startTime);

        return tlEndTime;
    }

    /**
     * Animate the load meter disappearing.
     *
     * TODO: Add hide_load animation.
     *
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public hide_load(startTime: number = null): number {
        this.isMeterVisible = false;

        let tl = this.scene.tl;
        let tlEndTime = tl.duration();

        let time = this.scene.hideTime;
        let rectId = '#' + this.id + ' rect.ALoad';
        tl.to(rectId, time, { fillOpacity: 0, strokeOpacity: 0 }, startTime);

        let rectId2 = '#' + this.id + ' rect.ALoadMeter';
        tl.to(rectId2, time, { fillOpacity: 0, strokeOpacity: 0 }, startTime);

        return tlEndTime;
    }

    /**
     * Set the current parameterization for the load meter.
     *
     * @param load The average load.
     * @param range The variable range vs the average load. The load meter will
     *              animate a variable load which fluctuates randomly between
     *              `load - range` and `load + range`.
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     * @param update Set to `true` in callbacks to reuse the same code to
     *               render the fluctuations; users should never set this.
     *
     * @returns The start time of this animation.
     */
    public set_load(
        load: number,
        range: number = 0,
        startTime: number = null,
        update: boolean = false
    ): number {
        let rand = Math.random() * range * 2;
        let randLoad = load - range + rand;
        randLoad = Math.max(randLoad, 0);
        randLoad = Math.min(randLoad, 100);
        randLoad = randLoad / 100.0;

        let tl = this.scene.tl;
        let tlEndTime = tl.duration();
        startTime = startTime == null ? tlEndTime : startTime;

        if (update) {
            var startTime = tl.time();
        }

        let rectId = '#' + this.id + ' rect.ALoadMeter';

        let red = Math.floor(randLoad * 255.0);
        let green = Math.floor((1.0 - randLoad) * 255.0);
        let color = 'rgb(' + String(red) + ',' + String(green) + ',0)';
        let newH = this.h * randLoad;
        let newY = -newH;

        let time = this.isMeterVisible ? this.scene.loadMeterTime : 0;
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
            startTime
        );
        return tlEndTime;
    }

    /**
     * Callback triggered when the current random fluctuation finishes.
     *
     * @param load The average load.
     * @param range The variable range vs the average load. The load meter will
     *              animate a variable load which fluctuates randomly between
     *              `load - range` and `load + range`.
     */
    private complete_callback(load: number, range: number) {
        if (range != 0) {
            let tl = this.scene.tl;
            this.set_load(load, range, null, true);
        }
    }
}
