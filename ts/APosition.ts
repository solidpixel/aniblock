/*
 * Aniblock Copyright (c) 2019, Pete Harris
 */

import { AScene } from './AScene'

/**
 * The APosition class provides a simple utility for creating distances based
 * on simple computations consisting of additions and subtractions applied to
 * literals, percentages, and guides.
 */
export class APosition {
    public pos: number

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
    constructor(scene: AScene, axis: string, format: string) {
        if (axis != 'x' && axis != 'y') {
            throw new Error('APosition: Bad axis ' + axis)
        }

        let tokens = format.split(/\s+/)
        this.pos = 0

        if (tokens.length == 0) {
            throw new Error('APosition: Bad format ' + format)
        }

        this.pos = this.parse_value(scene, axis, tokens[0])

        for (let i = 1; i < tokens.length; i += 2) {
            let op = this.parse_operator(tokens[i])
            let val = this.parse_value(scene, axis, tokens[i + 1])
            this.pos = op(this.pos, val)
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
    private parse_value(scene: AScene, axis: string, token: string): number {
        if (token.match(/^\d+$/)) {
            return Number(token)
        } else if (token.match(/^\d+%$/)) {
            let percent = Number(token.match(/\d+/)[0]) / 100.0
            if (axis == 'x') {
                return scene.width * percent
            } else {
                return scene.height * percent
            }
        } else {
            if (axis == 'x') {
                return scene.get_vguide(token)
            } else {
                return scene.get_hguide(token)
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
                return a + b
            }
        } else if (token.match(/^-$/)) {
            return function(a: number, b: number): number {
                return a - b
            }
        }

        throw new Error('APosition: Bad operator ' + token)
    }
}
