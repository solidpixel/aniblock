/*
 * Aniblock Copyright (c) 2019, Pete Harris
 */

import { Scene } from './Scene';

/**
 * A utility class to create values based on parsing a simple expression string.
 *
 * It can be useful to define locations of elements on the screen in terms of a computed position
 * relative to the position and/or sizes of other elements on the screen. To allow a compact syntax
 * for this, this class provides a parser which will parse a simple expression.
 */
export class Position {
    public pos: number;

    /**
     * Create a new position.
     *
     * @param scene The scene to source any guides from.
     * @param axis The axis to source any guides from.
     * @param format The format string. These are relatively tightly specified;
     *               due to the simple nature of the parser. Tokens are
     *               whitespace separated. Values may be integer literals,
     *               integer percentage literals, or the symbolic name of a
     *               guides. Operators may be "-" or "+".
     */
    constructor(scene: Scene, axis: string, format: string | number) {
        if (axis != 'x' && axis != 'y' && axis != 'k') {
            throw new Error('APosition: Bad axis ' + axis);
        }

        if (typeof format == 'number') {
            this.pos = format;
            return;
        }

        let tokens = format.split(/\s+/);
        this.pos = 0;

        if (tokens.length == 0) {
            throw new Error('APosition: Bad format ' + format);
        }

        this.pos = this.parse_value(scene, axis, tokens[0]);

        for (let i = 1; i < tokens.length; i += 2) {
            let op = this.parse_operator(tokens[i]);
            let val = this.parse_value(scene, axis, tokens[i + 1]);
            if (val == undefined) {
                throw new Error('APosition: Bad value "' + tokens[i + 1] + '"');
            }
            this.pos = op(this.pos, val);
        }
    }

    /**
     * Parse a value token.
     *
     * @param scene The scene to source any guides from.
     * @param axis The axis to source any guides from.
     * @param token The value token string to parse.
     *
     * @returns The parsed position, in pixels.
     */
    private parse_value(scene: Scene, axis: string, token: string): number {
        if (token.match(/^\d+$/)) {
            return Number(token);
        } else if (token.match(/^\d+%$/)) {
            let percent = Number(token.match(/\d+/)[0]) / 100.0;
            if (axis == 'x') {
                return scene.width * percent;
            } else if (axis == 'y') {
                return scene.height * percent;
            } else {
                throw new Error('APosition: Bad constant percentage');
            }
        } else {
            if (axis == 'x') {
                let guide = scene.get_vguide(token);
                if (guide === undefined) {
                    guide = scene.get_constant(token);
                }
                return guide;
            } else if (axis == 'y') {
                let guide = scene.get_hguide(token);
                if (guide === undefined) {
                    guide = scene.get_constant(token);
                }
                return guide;
            } else {
                return scene.get_constant(token);
            }
        }
    }

    /**
     * Parse an operator token.
     *
     * @param token The operator token string to parse.
     *
     * @returns A function of the form op(a, b) implementing the operator.
     */
    private parse_operator(token: string): any {
        if (token.match(/^\+$/)) {
            return function(a: number, b: number): number {
                return a + b;
            };
        } else if (token.match(/^-$/)) {
            return function(a: number, b: number): number {
                return a - b;
            };
        }

        throw new Error('APosition: Bad operator ' + token);
    }
}
