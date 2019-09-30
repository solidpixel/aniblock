/*
 * Aniblock: Copyright (c) 2019, Pete Harris
 */
import { Block } from './Block';
import { TimelineLite } from 'gsap/TweenMax';
import { Position } from './Position';

/**
 * A [[Scene]] is the root element used for constructing an animated diagram.
 *
 * Each [[Scene]] instance wraps a single SVG element in the document, and the
 * animation process will create and move new elements inside this container.
 * It is recommended that the element used is simply an empty placeholder, for
 * example:
 *
 * ```html
 * <svg id="animation"></svg>
 * ```
 *
 * Any existing child elements of the SVG container will be removed when
 * the scene instance is constructed.
 */
export class Scene implements EventListenerObject {
    /** Namespace for creating SVG elements. */
    private readonly ns = 'http://www.w3.org/2000/svg';

    /** Canvas DOM element ID. */
    private readonly id: string;

    /** Incrementing ID to generate unique IDs. */
    private subid: number;

    /** @hidden Width of the canvas, in pixels. */
    public readonly width: number;

    /** @hidden Height of the canvas, in pixels. */
    public readonly height: number;

    /** True if this instance is in debug mode. */
    private readonly debug: boolean;

    /** List of all blocks in the scene. */
    private blocks: any[];

    /** Map of all constants in the scene. */
    private constants: { [id: string]: number };

    /** Map of all horizontal (y-axis) guides in the scene. */
    private hguides: { [id: string]: number };

    /** Map of all vertical (x-axis) guides in the scene. */
    private vguides: { [id: string]: number };

    /** Is the timeline paused waiting for a key press. */
    private isPaused: boolean;

    /** Debug indicator for the key press. */
    private isPausedIndicator: Block[];

    /** @hidden Animation time for show animations. */
    public showTime: number;

    /** @hidden Animation time for hide animations. */
    public hideTime: number;

    /** @hidden Animation time for move animations. */
    public moveTime: number;

    /** @hidden Animation time for morph animations. */
    public morphTime: number;

    /** @hidden Animation time for link animations. */
    public linkTime: number;

    /** @hidden The internal GSAP animation timeline. */
    public readonly tl: TimelineLite;

    /**
     * Create a new [[Scene]].
     *
     * If debug mode is enabled then additional visual helpers are added, for
     * example any user-defined guides are visually represented in the diagram.
     *
     * @param id The ID of the SVG container element in the document.
     * @param w The width of the canvas in pixels.
     * @param h The height of the canvas in pixels.
     * @param debug Enable debug mode.
     */
    constructor(id: string, w: number, h: number, debug: boolean = false) {
        this.id = id;
        this.subid = 0;
        this.width = w;
        this.height = h;
        this.debug = debug;

        this.blocks = [];
        this.hguides = {};
        this.vguides = {};
        this.constants = {};

        this.tl = new TimelineLite();
        this.isPaused = false;
        this.isPausedIndicator = null;

        this.showTime = 1;
        this.hideTime = 1;
        this.moveTime = 1;
        this.morphTime = 1;
        this.linkTime = 1;

        // Check the SVG exists
        let svg = document.getElementById(this.id);
        if (svg == undefined || svg.nodeName.toLowerCase() != 'svg') {
            throw new Error('AScene: Scene element "' + this.id + '" not an svg type');
        }

        // Remove any existing children of the svg node
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        // Set svg properties based on the user's config
        svg.setAttribute('class', 'aniblock');
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));

        // Add backing canvas rectangle
        let canvas = document.createElementNS(this.ns, 'rect');
        canvas.setAttribute('class', 'canvas');
        canvas.setAttribute('width', '100%');
        canvas.setAttribute('height', '100%');
        svg.appendChild(canvas);

        document.addEventListener('keydown', this);
    }

    /**
     * Configure global settings for this scene.
     *
     * If required, this should be called immediately after construction. Any
     * subset of the following parameters can be specified:
     *
     * - `timeScale`: Animation playback speed multiplier.
     * - `showTime`: Duration of show animations, in seconds.
     * - `hideTime`: Duration of hide animations, in seconds.
     * - `moveTime`: Duration of move animations, in seconds.
     * - `morphTime`: Duration of morph animations, in seconds.
     * - `loop`: Boolean indicating if the animation should loop.
     *
     * @param params A parameter mapping object.
     */
    configure(params: any): void {
        if (params.timeScale != undefined) {
            this.tl.timeScale(params.timeScale);
        }

        if (params.loop != undefined) {
            this.tl.eventCallback('onComplete', this.complete_callback, null, this);
        }

        if (params.showTime != undefined) {
            this.showTime = params.showTime;
        }

        if (params.hideTime != undefined) {
            this.hideTime = params.hideTime;
        }

        if (params.moveTime != undefined) {
            this.moveTime = params.moveTime;
        }

        if (params.morphTime != undefined) {
            this.morphTime = params.morphTime;
        }

        if (params.linkTime != undefined) {
            this.linkTime = params.linkTime;
        }
    }

    /**
     * Add a new constant for position computations.
     *
     * @param name The name of the constant; cannot start with a numeric digit.
     * @param value The constant value; any input accepted by [[Position]].
     */
    public add_constant(name: string, value: string | number): void {
        // Constants must match a valid name pattern
        if (!name.match(/^[A-Za-z][A-Za-z0-9_]*$/)) {
            throw new Error('AScene: VGuide name is invalid "' + name + '"');
        }

        // Constants must be unique in all namespaces namespace
        if (name in this.constants || name in this.hguides || name in this.vguides) {
            throw new Error('AScene: Constant name collision "' + name + '"');
        }

        this.constants[name] = Position(this, 'k', value);
    }

    /**
     * Get the value of a symbolic constant.
     *
     * @param name The symbolic name of the constant.
     *
     * @returns The numeric value of the named symbolic constant.
     */
    public get_constant(name: string): number {
        return this.constants[name];
    }

    /**
     * Add a horizontal (Y axis) drawing guide.
     *
     * Note that guides can also be used as symbolic locations in [[Position]]
     * computations, allowing positions to be defined as offsets relative to an
     * existing guide.
     *
     * @param name The name of the guide; cannot start with a numeric digit.
     * @param loc The guide position; any input accepted by [[Position]].
     */
    public add_hguide(name: string, loc: string | number): void {
        // Guides must match a valid name pattern
        if (!name.match(/^[A-Za-z][A-Za-z0-9_]*$/)) {
            throw new Error('AScene: VGuide name is invalid "' + name + '"');
        }

        // Guides must be unique in both their orientation and constants namespace
        if (name in this.constants || name in this.hguides) {
            throw new Error('AScene: HGuide name collision "' + name + '"');
        }

        let pos = Position(this, 'y', loc);
        this.hguides[name] = pos;

        if (this.debug) {
            this.draw_guide(name, 0, this.width, pos + 0.5, pos + 0.5);
        }
    }

    /**
     * Get the location of a horizontal guide, in pixels.
     *
     * @param name The name of the guide.
     *
     * @returns The Y coordinate of the named guide.
     */
    public get_hguide(name: string): number {
        return this.hguides[name];
    }

    /**
     * Add a vertical (X axis) drawing guide.
     *
     * Note that guides can also be used as symbolic locations in [[Position]]
     * computations, allowing positions to be defined as offsets relative to an
     * existing guide.
     *
     * @param name The name of the guide; cannot start with a numeric digit.
     * @param loc The guide position; any input accepted by [[Position]].
     */
    public add_vguide(name: string, loc: string | number): void {
        // Guides must match a valid name pattern
        if (!name.match(/^[A-Za-z][A-Za-z0-9_]*$/)) {
            throw new Error('AScene: VGuide name is invalid "' + name + '"');
        }

        // Guides must be unique in both their orientation and constants namespace
        if (name in this.constants || name in this.vguides) {
            throw new Error('AScene: VGuide name collision "' + name + '"');
        }

        let pos = Position(this, 'x', loc);
        this.vguides[name] = pos;

        if (this.debug) {
            this.draw_guide(name, pos + 0.5, pos + 0.5, 0, this.height);
        }
    }

    /**
     * Get the location of a vertical guide, in pixels.
     *
     * @param name The name of the guide.
     *
     * @returns The X coordinate of the named guide.
     */
    public get_vguide(name: string): number {
        return this.vguides[name];
    }

    /**
     * @hidden
     *
     * Add a new [[Block]] to this scene.
     *
     * @param element The block to add.
     */
    public add_block(element: Block): void {
        this.blocks.push(element);
        let svg = document.getElementById(this.id);
        element.generate_svg(svg);
    }

    /**
     * Get the current end time of the timeline.
     *
     * @returns The end time of the timeline in seconds.
     */
    public get_end_time(): number {
        return this.tl.endTime();
    }

    /**
     * Add an idle period to the animation to the end of the timeline.
     *
     * @param time The number of seconds to idle.
     *
     * @returns The start time of this animation.
     */
    public add_idle(time: number): number {
        let tlEndTime = this.tl.endTime();
        this.tl.set({}, {}, '+=' + String(time));
        return tlEndTime;
    }

    /**
     * Add a pause for user keypress to the end of the timeline.
     *
     * Note that the pause is an asynchronous event; it is queued and will
     * be triggered at the point that the timeline "plays" this event.
     *
     * When the [[Scene]] is constructed in `debug` mode a pause indicator will
     * be shown in the top left of the screen.
     */
    public add_pause(): void {
        // Construct the visual indicator on first use ...
        if (this.debug && this.isPausedIndicator == null) {
            var ind0 = new Block(this, null, 6, 10, 5, 12, 'AGuide');
            var ind1 = new Block(this, null, 13, 10, 5, 12, 'AGuide');
            this.isPausedIndicator = [ind0, ind1];
        }

        this.tl.addPause('+=0', this.resume_callback, null, this);
    }

    /**
     * Skip all animations and jump to the head of the timeline.
     *
     * This has two main uses:
     *
     * - In release builds it can be used to jump a diagram directly into
     *   a constructed state.
     * - In debug builds it can be used to jump a diagram to the interesting
     *   part that is under development, skipping already completed work.
     */
    public fastforward(): void {
        this.tl.addLabel('ffwd');
        this.tl.seek('ffwd');
        this.tl.removeLabel('ffwd');
    }

    /**
     * @hidden
     *
     * Generate a new ID for naming a block.
     *
     * @returns A new ID name.
     */
    public get_new_id(): string {
        return this.id + '_auto_' + String(this.subid++);
    }

    /**
     * @hidden
     *
     * Handler for keypress events.
     *
     * This is used to unpause the timeline when we are blocked on a wait for
     * keypress event.
     *
     * @param event The keypress event.
     */
    public handleEvent(event): void {
        if (event.type == 'keydown' && this.isPaused) {
            this.isPaused = false;
            if (this.debug) {
                this.isPausedIndicator[0].hide_now();
                this.isPausedIndicator[1].hide_now();
            }
            this.tl.play();
        }
    }

    /**
     * Draw a guide on the canvas.
     *
     * @param name The name of the guide.
     * @param x1 The line X coordinate for point A.
     * @param x2 The line X coordinate for point B.
     * @param y1 The line Y coordinate for point A.
     * @param y2 The line Y coordinate for point B.
     */
    private draw_guide(name: string, x1: number, x2: number, y1: number, y2: number): void {
        let svg = document.getElementById(this.id);
        let canvas = svg.getElementsByClassName('canvas')[0];

        // Draw the line
        let line = document.createElementNS(this.ns, 'line');
        line.setAttribute('class', 'AGuide');
        line.setAttribute('x1', String(x1));
        line.setAttribute('x2', String(x2));
        line.setAttribute('y1', String(y1));
        line.setAttribute('y2', String(y2));
        svg.insertBefore(line, canvas.nextSibling);

        // Add the label
        let text = document.createElementNS(this.ns, 'text');
        text.setAttribute('class', 'AGuide');
        svg.insertBefore(text, line.nextSibling);

        // Horizontal line labels draw offset above the guide
        if (x1 == 0) {
            text.innerHTML = name + ' (' + String(Math.round(y1)) + ')';
            text.setAttribute('x', '6');
            text.setAttribute('y', String(y1 - 5));

            // Vertical line labels draw offset left of the guide
        } else {
            text.innerHTML = name + ' (' + String(Math.round(y1)) + ')';
            text.setAttribute('x', String(x1 + 5));
            text.setAttribute('y', '15');
        }
    }

    /**
     * @hidden
     *
     * Handler triggered whenever the timeline reaches a pause for keypress.
     *
     * This enables sensitivity to keypress events.
     */
    private resume_callback(): void {
        this.isPaused = true;
        if (this.debug) {
            this.isPausedIndicator[0].show_now();
            this.isPausedIndicator[1].show_now();
        }
    }

    /**
     * @hidden
     *
     * Handler triggered whenever the timeline reaches the end.
     *
     * This enables looping animations.
     */
    private complete_callback(): void {
        this.tl.restart();
    }
}
