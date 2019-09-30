/*
 * Aniblock: Copyright (c) 2019, Pete Harris
 */
import { Scene } from './Scene';
import { Link } from './Link';
import { Position } from './Position';
import { Sine } from 'gsap/TweenMax';

/**
 * An enumeration defining how a block should grow when changing size.
 */
export enum Dir {
    /**
     * Grow upwards, keeping the bottom edge fixed on the canvas.
     */
    Up = 1,
    /**
     * Grow downwards, keeping the top edge fixed on the canvas.
     */
    Down,
    /**
     * Grow up/down or left/right, depending on animation, while keeping the
     * center point fixed on the canvas.
     */
    Center,
    /**
     * Grow to the left, keeping the right edge fixed on the canvas.
     */
    Left,
    /**
     * Grow to the right, keeping the left edge fixed on the canvas.
     */
    Right,
}

/**
 * An enumeration of block edge names.
 */
export enum Edge {
    /**
     * Top edge.
     */
    Top = 1,
    /**
     * Bottom edge.
     */
    Bottom,
    /**
     * Left edge.
     */
    Left,
    /**
     * Right edge.
     */
    Right,
}

/**
 * @hidden
 *
 * An enumeration of depth ordering.
 *
 * Note that Aniblock provides no support for controlling depth ordering of
 * individual elements, beyond their creation order by the user of the library.
 * In general blocks are rendered to the top layer, and links between blocks
 * are rendered to the bottom layer. To avoid rendering issues it is
 * recommended that animations do not contain block overlap.
 */
export enum ZOrder {
    /**
     * Add elements to the top of the canvas.
     */
    Top = 1,
    /**
     * Add elements to the bottom of the canvas.
     */
    Bottom,
}

/**
 * The Block provides the main building block for the diagrams.
 *
 * A [[Block]] represents a single component in the diagrams, typically
 * visually represented by a rectangle with a label and an outline stroke.
 * Blocks may be connected to other blocks using [[Link]] elements.
 *
 * TODO: Insert figure of a block appearing.
 */
export class Block {
    /** @hidden The base type used to determine rendering method. */
    public baseType: String;

    /** @hidden Namespace for creating SVG elements. */
    protected readonly ns = 'http://www.w3.org/2000/svg';

    /** @hidden The DOM ID of the SVG element. */
    protected id: string;

    /** @hidden The DOM class of the SVG element. */
    private cls: string;

    /** @hidden The label string. */
    private label: string;

    /** @hidden The label line height. */
    private labelSize: number;

    /** @hidden The starting X coordinate of the block center. */
    protected xStart: number;

    /** @hidden The starting Y coordinate of the block center. */
    protected yStart: number;

    /** @hidden The current X coordinate of the block center. */
    protected x: number;

    /** @hidden The current Y coordinate of the block center. */
    protected y: number;

    /** @hidden The starting width of the block. */
    protected wStart: number;

    /** @hidden The starting height of the block. */
    protected hStart: number;

    /** @hidden The width of the block, excluding strokes. */
    protected w: number;

    /** @hidden The height of the block, excluding strokes. */
    protected h: number;

    /** @hidden List of links for which this block is the primary source. */
    private links: Link[];

    /** @hidden The parent scene that owns this block. */
    protected scene: Scene;

    /** @hidden True if this block is visible. */
    protected isVisible: boolean;

    /**
     * Create a new [[Block]].
     *
     * Note that new blocks are created in a hidden state; call the
     * [[show|`show()`]] method to animate the block appearing.
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
        x: number | string,
        y: number | string,
        w: number,
        h: number,
        cls: string = null
    ) {
        this.scene = scene;
        this.id = scene.get_new_id();

        this.cls = cls;
        this.label = label;
        this.labelSize = null;
        this.links = [];

        this.wStart = w;
        this.hStart = h;
        this.w = w;
        this.h = h;

        this.xStart = Position(scene, 'x', x);
        this.yStart = Position(scene, 'y', y);
        this.x = this.xStart;
        this.y = this.yStart;

        this.baseType = 'Block';
        this.isVisible = false;
        scene.add_block(this);
    }

    /**
     * @returns The current X coordinate, as seen at the end of the timeline.
     *
     * Coordinates are returned from the center of the block.
     *
     * Note that this does not return the current coordinate on screen, as
     * the timeline play head may not yet be at the end of the timeline.
     */
    public get_x(): number {
        return this.x;
    }

    /**
     * @returns The current Y coordinate, as seen at the end of the timeline.
     *
     * Coordinates are returned from the center of the block.
     *
     * Note that this does not return the current coordinate on screen, as
     * the timeline play head may not yet be at the end of the timeline.
     */
    public get_y(): number {
        return this.y;
    }

    /**
     * @returns The current width, as seen at the end of the timeline.
     *
     * This returns the width of the fill area, excluding any stroke that has
     * been applied. SVG strokes are centered on the edge of the fill area, so
     * the width of the overall shape will be increased by one stroke width
     * (half for the left edge, and half for the right edge).
     *
     * Note that this does not return the current dimension on screen, as the
     * timeline play head may not yet be at the end of the timeline.
     */
    public get_w(): number {
        return this.w;
    }

    /**
     * @returns The current height, as seen at the end of the timeline.
     *
     * This returns the width of the fill area, excluding any stroke that has
     * been applied. SVG strokes are centered on the edge of the fill area, so
     * the height of the overall shape will be increased by one stroke width
     * (half for the top edge, and half for the bottom edge).
     *
     * Note that this does not return the current dimension on screen, as the
     * timeline play head may not yet be at the end of the timeline.
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
        let xCoord = String(this.xStart);

        let yCenter = this.yStart + 2;
        let yBase = (this.labelSize * (lines - 1)) / 2;
        let yInc = this.labelSize * index;
        let yCoord = String(yCenter - yBase + yInc);

        text.setAttribute('class', this.get_block_class());
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
     * Get the default DOM class used for the main SVG `rect` element.
     *
     * @returns The DOM class name.
     */
    public get_block_class(): string {
        return 'ABlock';
    }

    /**
     * @hidden
     *
     * Get the Z-Order of this element.
     *
     * @returns The ZOrder of this block.
     */
    public get_block_zorder(): ZOrder {
        return ZOrder.Top;
    }

    /**
     * Get the perimeter size of this element.
     *
     * @returns The perimeter in pixels (plus a little padding)
     */
    private get_perimeter(): number {
        return this.w * 2 + this.h * 2 + 20;
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
        if (this.cls != null) {
            group.setAttribute('class', String(this.cls));
        }

        // Work out where to add the block in the SVG. SVG images are rendered
        // in element order from bottom to top, so we have to insert in an
        // appropriate place to get the correct layering.

        // If this is a "Bottom" element we need to insert at the start of the
        // SVG child list so it's rendered before later elements, but insert
        // after the canvas and after any guides so they are always underneath
        // the diagram.
        if (this.get_block_zorder() == ZOrder.Bottom) {
            let guide = document.querySelectorAll('text.AGuide:last-of-type');
            if (guide.length != 0) {
                svg.insertBefore(group, guide[0].nextSibling);
            } else {
                let canvas = svg.getElementsByClassName('canvas')[0];
                svg.insertBefore(group, canvas.nextSibling);
            }
            // Else add the end of the SVG child list (draw last, on top of
            // everything else) ...
        } else {
            svg.appendChild(group);
        }

        // Create the block
        let rect = document.createElementNS(this.ns, 'rect');
        rect.setAttribute('class', this.get_block_class());
        rect.setAttribute('x', String(this.xStart - this.w / 2));
        rect.setAttribute('y', String(this.yStart - this.h / 2));
        rect.setAttribute('width', String(this.w));
        rect.setAttribute('height', String(this.h));

        let perimeter = this.get_perimeter();
        rect.style.strokeDasharray = String(perimeter);
        rect.style.strokeDashoffset = String(perimeter);

        group.appendChild(rect);

        // If we have a label then create the text
        if (this.label) {
            // Create the text
            let text = document.createElementNS(this.ns, 'text');

            // Note: this is a dummy element to get the font size
            group.appendChild(text);
            let style = window.getComputedStyle(text);
            let fontSize = style.getPropertyValue('font-size');
            this.labelSize = Number(fontSize.match(/\d+/)[0]);
            group.removeChild(text);

            // Generate separate SVG elements per line of text
            let lines = this.label.split('\n');
            for (let i in lines) {
                let j = Number(i);
                let text = this.generate_text(lines.length, j, lines[j]);
                group.appendChild(text);
            }

            // Apply a small rotation to force browser rendering to not pixel
            // snap the font rendering, which looks terrible when animated ...
            let tl = this.scene.tl;
            let textid = '#' + this.id + ' text';
            tl.set(textid, { force3D: true, rotation: 0.1 });
        }

        return group;
    }

    /**
     * Instantly show this block, irrespective of animation timeline.
     */
    public show_now(): void {
        let rectId = '#' + this.id + ' rect';
        let node = document.querySelector(rectId) as HTMLElement;
        node.style.fillOpacity = '1';
        this.isVisible = true;
    }

    /**
     * Instantly hide this block, irrespective of animation timeline.
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
     * If the block has a zero width or height the animation is instant with no
     * intermediate tweening.
     *
     * TODO: Add show animation.
     *
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public show(startTime: number = null): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let grpId = '#' + this.id;
        let rectId = '#' + this.id + ' rect.' + this.get_block_class();

        let time = this.scene.showTime;
        tl.to(rectId, time, { strokeDashoffset: 0, ease: Sine.easeOut }, startTime);
        let offset = '-=' + time * 0.75;
        tl.to(grpId, time * 0.66, { fillOpacity: 1 }, offset);

        this.isVisible = true;
        return tlEndTime;
    }

    /**
     * Animate this block disappearing.
     *
     * If the block has a zero width or height the animation is instant with no
     * intermediate tweening.
     *
     * TODO: Add hide animation.
     *
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public hide(startTime: number = null): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let grpId = '#' + this.id;
        let rectId = '#' + this.id + ' rect';

        let time = this.scene.hideTime;
        tl.to(grpId, time * 0.66, { fillOpacity: 0 }, startTime);
        let offset = '-=' + time;
        let dashOffset = this.get_perimeter();
        tl.to(rectId, time, { strokeDashoffset: dashOffset, ease: Sine.easeOut }, offset);

        this.isVisible = false;
        return tlEndTime;
    }

    /**
     * Animate this block moving left or right by a relative pixel count.
     *
     * TODO: Add move_x animation.
     *
     * @param offset The pixel offset relative to the current position.
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public move_by_x(offset: number, startTime: number = null, isMorph: boolean = false): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let grpId = '#' + this.id;
        this.x += offset;

        let isLink = this.baseType == 'Link';
        if (isLink) {
            var time = this.scene.linkTime;
        } else if (isMorph) {
            var time = this.scene.morphTime;
        } else {
            var time = this.scene.moveTime;
        }

        tl.to(grpId, time, { x: this.x - this.xStart, ease: Sine.easeOut }, startTime);
        this.update_links(startTime);
        return tlEndTime;
    }

    /**
     * Animate this block moving to an absolute X coordinate.
     *
     * TODO: Add move_to_x animation.
     *
     * @param x The X coordinate; any input accepted by [[Position]].
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public move_to_x(x: number | string, startTime: number = null): number {
        x = Position(this.scene, 'x', x);
        let newOffset = x - this.x;
        return this.move_by_x(newOffset, startTime);
    }

    /**
     * Animate this block moving up or down by a relative pixel count.
     *
     * TODO: Add move_by_y animation.
     *
     * @param offset The pixel offset relative to the current position.
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public move_by_y(offset: number, startTime: number = null, isMorph: boolean = false): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let grpId = '#' + this.id;
        this.y += offset;
        let isLink = this.baseType == 'Link';

        if (isLink) {
            var time = this.scene.linkTime;
        } else if (isMorph) {
            var time = this.scene.morphTime;
        } else {
            var time = this.scene.moveTime;
        }

        tl.to(grpId, time, { y: this.y - this.yStart, ease: Sine.easeOut }, startTime);
        this.update_links(startTime);
        return tlEndTime;
    }

    /**
     * Animate this block moving to an absolute Y coordinate.
     *
     * TODO: Add move_to_y animation.
     *
     * @param y The Y coordinate; any input accepted by [[Position]].
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public move_to_y(y: number | string, startTime: number = null): number {
        y = Position(this.scene, 'y', y);
        let newOffset = y - this.y;
        return this.move_by_y(newOffset, startTime);
    }

    /**
     * Animate this block changing width.
     *
     * @param w The new width.
     * @param direction The direction of the width change.
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
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
        this.xStart += deltaW2;
        this.x += deltaW2;

        let isLink = this.baseType == 'Link';
        let time = isLink ? this.scene.linkTime : this.scene.morphTime;

        // Adjust the rectangle dimensions
        if ((deltaW > 0 && direction == Dir.Left) || (deltaW < 0 && direction == Dir.Right)) {
            this.move_by_x(-deltaW, startTime, true);
        } else if (direction == Dir.Center) {
            this.move_by_x(-deltaW2, startTime, true);
        }

        let perim = this.get_perimeter();
        tl.to(rctId, time, { width: w, strokeDasharray: perim, ease: Sine.easeOut }, startTime);

        // Adjust the text position
        let textDX = (this.w - this.wStart) / 2;
        let lines = document.querySelectorAll(textId);
        for (let i = 0; i < lines.length; i++) {
            let node = lines[i];
            tl.to(node, time, { x: textDX, ease: Sine.easeOut }, startTime);
        }

        // Update any links for this block
        this.update_links(startTime);
        return tlEndTime;
    }

    /**
     * Animate this block changing height.
     *
     * @param w The new width.
     * @param direction The direction of the height change.
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
     *
     * @returns The start time of this animation.
     */
    public change_height(h: number, direction: Dir, startTime: number = null): number {
        let tl = this.scene.tl;
        let tlEndTime = tl.endTime();
        startTime = startTime == null ? tlEndTime : startTime;

        let rctId = '#' + this.id + ' rect';
        let textId = '#' + this.id + ' text';
        let deltaH = h - this.h;
        let deltaH2 = deltaH / 2;
        this.h = h;

        // Adjust origin point (in middle of rectangle)
        this.yStart += deltaH2;
        this.y += deltaH2;

        let isLink = this.baseType == 'Link';
        let time = isLink ? this.scene.linkTime : this.scene.morphTime;

        // Adjust the rectangle dimensions
        if ((deltaH > 0 && direction == Dir.Up) || (deltaH < 0 && direction == Dir.Down)) {
            this.move_by_y(-deltaH, startTime, true);
        } else if (direction == Dir.Center) {
            this.move_by_y(-deltaH2, startTime, true);
        }

        let perim = this.get_perimeter();
        tl.to(rctId, time, { height: h, strokeDasharray: perim, ease: Sine.easeOut }, startTime);

        // Adjust the text position
        let textDH = (this.h - this.hStart) / 2;
        let lines = document.querySelectorAll(textId);
        for (let i = 0; i < lines.length; i++) {
            let node = lines[i];
            tl.to(node, time, { y: textDH, ease: Sine.easeOut }, startTime);
        }

        // Update any links for this block
        this.update_links(startTime);
        return tlEndTime;
    }

    /**
     * @hidden
     *
     * Update all links owned by this block to move with the block.
     *
     * @param startTime The start time on the animation timeline, in seconds,
     *                  or `null` if the animation should be appended to the
     *                  end of the timeline.
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
    public add_link(link: Link): void {
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
        if (edge == Edge.Top) {
            return this.y - this.h / 2;
        } else if (edge == Edge.Right) {
            return this.x + this.w / 2;
        } else if (edge == Edge.Bottom) {
            return this.y + this.h / 2;
        } /* if (edge == Edge.Left) */ else {
            return this.x - this.w / 2;
        }
    }
}
