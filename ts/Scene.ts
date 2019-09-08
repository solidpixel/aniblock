/*
 * Aniblock Copyright (c) 2019, Pete Harris
 */
import { Block } from './Block';
import { TimelineLite } from 'gsap/TweenMax';
import { Position } from './Position';

/**
 * An AScene is the root element used for constructing an animation.
 *
 * Each AScene wraps a single SVG element in the document, and the animation process will create new
 * elements inside the SVG to provide the element of the diagram.
 */
export class Scene implements EventListenerObject {
    /* Namespace for creating SVG elements. */
    private readonly ns = 'http://www.w3.org/2000/svg';

    /* Canvas DOM element ID. */
    private readonly id: string;

    /* Width of the canvas, in pixels. */
    public readonly width: number;

    /* Height of the canvas, in pixels. */
    public readonly height: number;

    /* True if this instance is in debug mode. */
    private readonly debug: boolean;

    /* List of all blocks in the scene. */
    private blocks: any[];

    /* Map of all constants in the scene. */
    private constants: { [id: string]: number };

    /* Map of all horizontal (y-axis) guides in the scene. */
    private hguides: { [id: string]: number };

    /* Map of all vertical (x-axis) guides in the scene. */
    private vguides: { [id: string]: number };

    /* Is the timeline paused waiting for a key press. */
    private isPaused: boolean;

    /* Debug indicator for the key press. */
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
     * Create a new scene.
     *
     * In debug mode additional visual helpers are enabled, for example
     * any guides are visually shown on the canvas.
     *
     * @param id The ID of the placeholder DOM element.
     * @param w The width of the canvas in pixels.
     * @param h The height of the canvas in pixels.
     * @param debug Enable debug mode.
     */
    constructor(id: string, w: number, h: number, debug: boolean = false) {
        this.id = id;
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

        document.addEventListener('keydown', this);

        let svg = document.getElementById(this.id);
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));

        let canvas = document.createElementNS(this.ns, 'rect');
        canvas.setAttribute('id', 'canvas');
        canvas.setAttribute('width', '100%');
        canvas.setAttribute('height', '100%');
        svg.appendChild(canvas);
    }

    /**
     * Configure global settings for this animation. Any of the following
     * parameters can be specified:
     *
     * - timeScale: Animation playback speed multiplier.
     * - showTime: Duration of show animations, in seconds.
     * - hideTime: Duration of hide animations, in seconds.
     * - moveTime: Duration of move animations, in seconds.
     * - morphTime: Duration of morph animations, in seconds.
     * - loop: Boolean indicating if the animation should loop.
     *
     * @param params A parameter object.
     */
    configure(params: any) {
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
     * Add a new constant for guide computations.
     *
     * @param name The name of the constant.
     * @param value The value of the constant, which may be an expression involving other constants
     *              that have already been defined.
     */
    public add_constant(name: string, value: string | number) {
        // Constants must be unique in all namespaces namespace
        if (name in this.constants || name in this.hguides || name in this.vguides) {
            throw new Error('AScene: Constant name collision "' + name + '"');
        }

        let epos = new Position(this, 'k', value);
        this.constants[name] = epos.pos;
        console.log();
    }

    /**
     * Get a constant value.
     *
     * @param name The name of the constant.
     */
    public get_constant(name: string): number {
        return this.constants[name];
    }

    /**
     * Add a horizontal (y-axis) drawing guide.
     *
     * @param name The name of the guide.
     * @param loc The location of the guide, specified as either a number which
     *     gives the position in pixels, or a string which gives the position
     *     as a percentage.
     */
    public add_hguide(name: string, loc: string | number) {
        // Guides must be unique in both their orientation and constants namespace
        if (name in this.constants || name in this.hguides) {
            throw new Error('AScene: HGuide name collision "' + name + '"');
        }

        let epos = new Position(this, 'y', loc);
        loc = epos.pos;

        this.hguides[name] = loc;

        if (this.debug) {
            let svg = document.getElementById(this.id);
            let line = document.createElementNS(this.ns, 'line');
            line.setAttribute('class', 'AGuide');
            line.setAttribute('x1', '0');
            line.setAttribute('x2', String(this.width));
            line.setAttribute('y1', String(loc + 0.5));
            line.setAttribute('y2', String(loc + 0.5));

            let canvas = document.getElementById('canvas');
            svg.insertBefore(line, canvas.nextSibling);

            let text = document.createElementNS(this.ns, 'text');
            text.setAttribute('class', 'AGuide');
            text.setAttribute('x', '5');
            text.setAttribute('y', String(loc + 12));
            text.innerHTML = name + ' (' + String(Math.round(loc)) + ')';
            svg.insertBefore(text, line.nextSibling);
        }
    }

    /**
     * Get the location of a horizontal guide, in pixels.
     *
     * @param name The name of the guide.
     */
    public get_hguide(name: string): number {
        return this.hguides[name];
    }

    /**
     * Add a vertical (x-axis) drawing guide.
     *
     * @param name The name of the guide.
     * @param loc The location of the guide, specified as either a number which
     *     gives the position in pixels, or a string which gives the position
     *     as a percentage.
     */
    public add_vguide(name: string, loc: string | number) {
        // Guides must be unique in both their orientation and constants namespace
        if (name in this.constants || name in this.vguides) {
            throw new Error('AScene: VGuide name collision "' + name + '"');
        }

        let epos = new Position(this, 'x', loc);
        loc = epos.pos;

        this.vguides[name] = loc;

        if (this.debug) {
            let svg = document.getElementById(this.id);
            let line = document.createElementNS(this.ns, 'line');
            line.setAttribute('class', 'AGuide');
            line.setAttribute('x1', String(loc + 0.5));
            line.setAttribute('x2', String(loc + 0.5));
            line.setAttribute('y1', '0');
            line.setAttribute('y2', String(this.height));

            let canvas = document.getElementById('canvas');
            svg.insertBefore(line, canvas.nextSibling);

            let text = document.createElementNS(this.ns, 'text');
            text.setAttribute('class', 'AGuide');
            text.setAttribute('x', String(loc + 5));
            text.setAttribute('y', '12');
            text.innerHTML = name + ' (' + String(Math.round(loc)) + ')';
            svg.insertBefore(text, line.nextSibling);
        }
    }

    /**
     * Get the location of a vertical guide, in pixels.
     *
     * @param name The name of the guide.
     */
    public get_vguide(name: string): number {
        return this.vguides[name];
    }

    /**
     * Add a new block to the scene.
     *
     * @param element The block to add.
     */
    public add_block(element: Block) {
        this.blocks.push(element);
        let svg = document.getElementById(this.id);
        element.generate_svg(svg);
    }

    /**
     * Add an idle period to the end of the timeline.
     *
     * @param time The number of seconds to idle.
     */
    public add_idle(time: number): void {
        this.tl.set({}, {}, '+=' + String(time));
    }

    /**
     * Skip all animations and jump to the current head of the timeline.
     */
    public fastforward(): void {
        this.tl.addLabel('ffwd');
        this.tl.seek('ffwd');
        this.tl.removeLabel('ffwd');
    }

    /** @hidden
     * Handler for keypress events.
     *
     * This is used to unpause the timeline when we are blocked on a wait for
     * keypress event.
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

    /** @hidden
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

    /** @hidden
     * Handler triggered whenever the timeline reaches a pause for keypress.
     *
     * This enables sensitivity to keypress events.
     */
    private complete_callback(): void {
        this.tl.restart();
    }

    /** @hidden
     * Insert a pause for keypress at the current position in the timeline.
     *
     * Note that the pause does not happen immediately; it is queued and will
     * be triggered at the point that the timeline "plays" this event.
     *
     * In debug runs a pause indicator is shown in the top left of the screen,
     * as a small square.
     */
    public add_wait(): void {
        if (this.debug && this.isPausedIndicator == null) {
            var ind0 = new Block(this, 'AGuidePI1', 'AGuide', null, 6, 10, 5, 12);
            var ind1 = new Block(this, 'AGuidePI2', 'AGuide', null, 13, 10, 5, 12);
            this.isPausedIndicator = [ind0, ind1];
        }
        this.tl.addPause('+=0', this.resume_callback, null, this);
    }
}