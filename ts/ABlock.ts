/*
 * Aniblock Copyright (c) 2019, Pete Harris
 */
import { AScene } from './AScene';
import { ALink } from './ALink';
import { Sine } from 'gsap/TweenMax';

export enum Dir {
    Up = 1,
    Down,
    Center,
    Left,
    Right,
}

export enum Edge {
    Top = 1,
    Bottom,
    Left,
    Right,
}

export enum ZOrder {
    Top = 1,
    Bottom,
}

/**
 * The ABlock provides the main building block for the diagrams, representing
 * a physical component in the device.
 *
 *   <img src="media://sample.gif" alt="A sample Aniblock animation" />
 */
export class ABlock {
    public baseType: String;

    /** Namespace for creating SVG elements. */
    protected readonly ns = 'http://www.w3.org/2000/svg';

    /** Simple z-order: top (for blocks), bottom (for links). */
    private zOrder: ZOrder;

    /** @hidden The DOM ID of the SVG element. */
    protected id: string;

    /** @hidden The DOM class of the SVG element. */
    private cls: string;

    /** @hidden The label string. */
    private label: string;

    /** @hidden The label line height in pixels. */
    private labelSize: number;

    /** @hidden The starting X coordinate. */
    protected x: number;

    /** @hidden The starting Y coordinate. */
    protected y: number;

    /** @hidden The width of the block. */
    protected w: number;

    /** @hidden The height of the block. */
    protected h: number;

    /** @hidden The current X coordinate. */
    protected xOffset: number;

    /** @hidden The current Y coordinate. */
    protected yOffset: number;

    /** @hidden List of links for which is block is the primary source. */
    private links: ALink[];

    /** @hidden The parent scene that owns this block. */
    protected scene: AScene;

    /** @hidden True if this block is visible. */
    protected isVisible: boolean;

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
        this.scene = scene;
        this.id = id;
        this.cls = cls;
        this.label = label;
        this.labelSize = null;
        this.links = [];

        this.w = w;
        this.h = h;

        if (typeof x == 'string') {
            x = scene.get_vguide(x);
        }

        if (typeof y == 'string') {
            y = scene.get_hguide(y);
        }

        this.x = x;
        this.y = y;
        this.xOffset = this.x;
        this.yOffset = this.y;
        this.zOrder = z;
        this.baseType = 'Block';
        this.isVisible = false;
        scene.add_block(this);
    }

    /**
     * @returns The current X coordinate.
     */
    public get_x(): number {
        return this.xOffset;
    }

    /**
     * @returns The current Y coordinate.
     */
    public get_y(): number {
        return this.yOffset;
    }

    /**
     * @returns The current width.
     */
    public get_w(): number {
        return this.w;
    }

    /**
     * @returns The current height.
     */
    public get_h(): number {
        return this.h;
    }

    /**
     * Generate SVG elements for a single line of the block label.
     *
     * @param lines The number of lines in the label.
     * @param index The current line index (zero indexed).
     * @param label The string for the current line.
     */
    private generate_text(lines: number, index: number, label: string): SVGTextElement {
        let text = document.createElementNS(this.ns, 'text');
        let xCoord = String(this.x);

        let yCenter = this.y + 2;
        let yBase = (this.labelSize * (lines - 1)) / 2;
        let yInc = this.labelSize * index;
        let yCoord = String(yCenter - yBase + yInc);

        text.setAttribute('x', xCoord);
        text.setAttribute('y', yCoord);
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('text-anchor', 'middle');
        text.innerHTML = label;
        return text;
    }

    /**
     * @hidden
     *
     * Generate SVG elements for the block.
     *
     * @param svg: The parent SVG element to add to.
     *
     * @returns The SVG group for the collection of elements.
     */
    public generate_svg(svg: HTMLElement): SVGElement {
        let group = document.createElementNS(this.ns, 'g');
        group.setAttribute('id', this.id);
        group.setAttribute('class', String(this.cls));

        // Work out where to add the block in the SVG
        if (this.zOrder == ZOrder.Bottom) {
            let guide = document.querySelectorAll('text.AGuide:last-of-type');
            if (guide.length != 0) {
                svg.insertBefore(group, guide[0].nextSibling);
            } else {
                let canvas = document.getElementById('canvas');
                svg.insertBefore(group, canvas.nextSibling);
            }
        } else {
            svg.appendChild(group);
        }

        // Create the block
        let rect = document.createElementNS(this.ns, 'rect');
        rect.setAttribute('class', 'ABlock');
        rect.setAttribute('x', String(this.x - this.w / 2));
        rect.setAttribute('y', String(this.y - this.h / 2));
        rect.setAttribute('width', String(this.w));
        rect.setAttribute('height', String(this.h));

        let perimeter = this.w * 2 + this.h * 2 + 20;
        rect.style.strokeDasharray = String(perimeter);
        rect.style.strokeDashoffset = String(perimeter);

        group.appendChild(rect);

        if (this.label == null) {
            return;
        }

        // Create the text
        let text = document.createElementNS(this.ns, 'text');

        // ... this is a dummy element to get the font size
        group.appendChild(text);
        let style = window.getComputedStyle(text);
        let fontSize = style.getPropertyValue('font-size');
        this.labelSize = Number(fontSize.match(/\d+/)[0]);
        group.removeChild(text);

        let lines = this.label.split('\n');
        for (let i in lines) {
            let j = Number(i);
            let text = this.generate_text(lines.length, j, lines[j]);
            group.appendChild(text);
        }

        return group;
    }

    /**
     * Instantly show this block (irrespective of animation timeline).
     */
    public show_now(): void {
        let rectId = '#' + this.id + ' rect';
        let node = document.querySelector(rectId) as HTMLElement;
        node.style.fillOpacity = '1';
        this.isVisible = true;
    }

    /**
     * Instantly hide this block (irrespective of animation timeline).
     */
    public hide_now(): void {
        let rectId = '#' + this.id + ' rect';
        let node = document.querySelector(rectId) as HTMLElement;
        node.style.fillOpacity = '0';
        this.isVisible = false;
    }

    /**
     * Animate this block appearing.
     *
     * If the block has a zero width or zero height the show animation is
     * instant with no tweening.
     *
     * @param startTime The start time on the animation timeline, in seconds, or null if the
     *                  animation should be appended to the end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public show(startTime: number = null): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let grpId = '#' + this.id;
        let rectId = '#' + this.id + ' rect.ABlock';

        let node = document.querySelector(rectId);
        let style = window.getComputedStyle(node);
        let stroke = style.getPropertyValue('stroke-width');
        let strokeSize = Number(stroke.match(/\d+/)[0]);

        if (strokeSize > 0) {
            let time = this.scene.showTime;
            tl.to(rectId, time, { strokeDashoffset: 0, ease: Sine.easeOut }, startTime);
            let offset = '-=' + time * 0.75;
            tl.to(grpId, time * 0.66, { fillOpacity: 1 }, offset);
        } else {
            tl.to(grpId, 0, { fillOpacity: 1 }, startTime);
        }

        this.isVisible = true;
        return tlEndTime;
    }

    /**
     * Animate this block disappearing.
     *
     * If the block has a zero width or zero height the show animation is
     * instant with no tweening.
     *
     * @param startTime The start time on the animation timeline, in seconds, or null if the
     *                  animation should be appended to the end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public hide(startTime: number = null): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let grpId = '#' + this.id;
        let rectId = '#' + this.id + ' rect';

        let node = document.querySelector(rectId);
        let style = window.getComputedStyle(node);
        let stroke = style.getPropertyValue('stroke-width');
        let strokeSize = Number(stroke.match(/\d+/)[0]);

        if (strokeSize > 0) {
            let time = this.scene.hideTime;
            tl.to(grpId, time * 0.66, { fillOpacity: 0 }, startTime);
            let offset = '-=' + time;
            tl.to(rectId, time, { strokeDashoffset: '100%', ease: Sine.easeOut }, offset);
        } else {
            tl.to(grpId, 0, { fillOpacity: 0 }, startTime);
        }

        this.isVisible = false;
        return tlEndTime;
    }

    /**
     * Animate this block moving left or right by a relative pixel count.
     *
     * @param offset The pixel offset relative to the current position.
     * @param startTime The start time on the animation timeline, in seconds, or null if the
     *                  animation should be appended to the end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public move_by_x(offset: number, startTime: number = null, isMorph: boolean = false): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let grpId = '#' + this.id;
        this.xOffset += offset;

        let isLink = this.baseType == 'Link';
        if (isLink) {
            var time = this.scene.linkTime;
        } else if (isMorph) {
            var time = this.scene.morphTime;
        } else {
            var time = this.scene.moveTime;
        }

        tl.to(grpId, time, { x: this.xOffset - this.x, ease: Sine.easeOut }, startTime);
        this.update_links(startTime);
        return tlEndTime;
    }

    /**
     * Animate this block moving to an absolute X coordinate.
     *
     * @param x The X coordinate; a pixel count or a vertical guide.
     * @param startTime The time offset to apply, in seconds, relative to the
     *                   current end of the timeline (may be negative).
     *
     * @returns The length of this animation in seconds.
     */
    public move_to_x(x: any, startTime: number = null): number {
        if (typeof x == 'string') {
            x = this.scene.get_vguide(x);
        }
        let newOffset = x - this.xOffset;
        return this.move_by_x(newOffset, startTime);
    }

    /**
     * Animate this block moving up or down by a relative pixel count.
     *
     * @param offset The pixel offset relative to the current position.
     * @param startTime The start time on the animation timeline, in seconds, or null if the
     *                  animation should be appended to the end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public move_by_y(offset: number, startTime: number = null, isMorph: boolean = false): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let grpId = '#' + this.id;
        this.yOffset += offset;
        let isLink = this.baseType == 'Link';

        if (isLink) {
            var time = this.scene.linkTime;
        } else if (isMorph) {
            var time = this.scene.morphTime;
        } else {
            var time = this.scene.moveTime;
        }
        tl.to(grpId, time, { y: this.yOffset - this.y, ease: Sine.easeOut }, startTime);
        this.update_links(startTime);
        return tlEndTime;
    }

    /**
     * Animate this block moving to an absolute U coordinate.
     *
     * @param y The Y coordinate; a pixel count or a horizontal guide.
     * @param startTime The time offset to apply, in seconds, relative to the
     *                   current end of the timeline (may be negative).
     *
     * @returns The length of this animation in seconds.
     */
    public move_to_y(y: any, startTime: number = null): number {
        if (typeof y == 'string') {
            y = this.scene.get_hguide(y);
        }
        let newOffset = y - this.yOffset;
        return this.move_by_y(newOffset, startTime);
    }

    /**
     * Animate this block changing width.
     *
     * @param w The new width.
     * @param direction The direction of the width change: ((l)eft, (c)enter,
     *                  or (r)ight).
     * @param startTime The start time on the animation timeline, in seconds, or null if the
     *                  animation should be appended to the end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public change_width(w: number, direction: Dir, startTime: number = null): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let rctId = '#' + this.id + ' rect';
        let textId = '#' + this.id + ' text';
        let deltaW = w - this.w;
        let deltaW2 = deltaW / 2;
        this.w = w;

        // Adjust origin point (in middle of rectangle)
        this.x += deltaW2;
        this.xOffset += deltaW2;

        let isLink = this.baseType == 'Link';
        if (isLink) {
            var time = this.scene.linkTime;
        } else {
            var time = this.scene.morphTime;
        }

        let perimeter = this.w * 2 + this.h * 2 + 20;
        if ((deltaW > 0 && direction == Dir.Left) || (deltaW < 0 && direction == Dir.Right)) {
            this.move_by_x(-deltaW, startTime, true);
            tl.to(
                rctId,
                time,
                { width: w, strokeDasharray: perimeter, ease: Sine.easeOut },
                startTime
            );
        } else if (direction == Dir.Center) {
            this.move_by_x(-deltaW2, startTime, true);
            tl.to(
                rctId,
                time,
                { width: w, strokeDasharray: perimeter, ease: Sine.easeOut },
                startTime
            );
        } else {
            tl.to(
                rctId,
                time,
                { width: w, strokeDasharray: perimeter, ease: Sine.easeOut },
                startTime
            );
        }

        let lines = document.querySelectorAll(textId);
        for (let i = 0; i < lines.length; i++) {
            let node = lines[i];
            tl.to(node, time, { x: deltaW2, ease: Sine.easeOut }, startTime);
        }

        this.update_links(startTime);
        return tlEndTime;
    }

    /**
     * Animate this block changing height.
     *
     * @param w The new width.
     * @param direction The direction of the height change: ((u)p, (c)enter,
     *                  or (d)own).
     * @param startTime The start time on the animation timeline, in seconds, or null if the
     *                  animation should be appended to the end of the timeline.
     *
     * @returns The start time of this animation.s.
     */
    public change_height(h: number, direction: Dir, startTime: number = null): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let rctId = '#' + this.id + ' rect';

        let deltaH = h - this.h;
        let deltaH2 = deltaH / 2;
        this.h = h;

        // Adjust origin point (in middle of rectangle)
        this.y += deltaH2;
        this.yOffset += deltaH2;

        let isLink = this.baseType == 'Link';
        if (isLink) {
            var time = this.scene.linkTime;
        } else {
            var time = this.scene.morphTime;
        }

        let perimeter = this.w * 2 + this.h * 2 + 20;
        if ((deltaH > 0 && direction == Dir.Up) || (deltaH < 0 && direction == Dir.Down)) {
            this.move_by_y(-deltaH, startTime, true);
            tl.to(
                rctId,
                time,
                { height: h, strokeDasharray: perimeter, ease: Sine.easeOut },
                startTime
            );
        } else if (direction == Dir.Center) {
            this.move_by_y(-deltaH2, startTime, true);
            tl.to(
                rctId,
                time,
                { height: h, strokeDasharray: perimeter, ease: Sine.easeOut },
                startTime
            );
        } else {
            tl.to(
                rctId,
                time,
                { height: h, strokeDasharray: perimeter, ease: Sine.easeOut },
                startTime
            );
        }

        this.update_links(startTime);
        return tlEndTime;
    }

    /**
     * @hidden
     *
     * Update all links owned by this block to move with the block.
     *
     * @param startTime The start time on the animation timeline, in seconds, or null if the
     *                  animation should be appended to the end of the timeline.
     */
    public update_links(startTime: number = null): void {
        for (let i = 0; i < this.links.length; i++) {
            // Force update animations to use block timing so the link
            // stays in sync with the block it is connected to.
            this.links[i].baseType = 'Block';
            this.links[i].update(startTime);
            this.links[i].baseType = 'Link';
        }
    }

    /**
     * @hidden
     *
     * Add a new link to this block.
     *
     * @param link The new link to add.
     */
    public add_link(link: ALink): void {
        this.links.push(link);
    }

    /**
     * @hidden
     *
     * Fetch the edge coordinate of a block.
     *
     * @param edge: The edge to fetch.
     *
     * @returns The edge coordinate in pixels.
     */
    public get_edge(edge: Edge): number {
        let edgeVal = null;
        if (edge == Edge.Top) {
            edgeVal = this.yOffset - this.h / 2;
        } else if (edge == Edge.Right) {
            edgeVal = this.xOffset + this.w / 2;
        } else if (edge == Edge.Bottom) {
            edgeVal = this.yOffset + this.h / 2;
        } else if (edge == Edge.Left) {
            edgeVal = this.xOffset - this.w / 2;
        }
        return edgeVal;
    }
}
