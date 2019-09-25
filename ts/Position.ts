/*
 * Aniblock: Copyright (c) 2019, Pete Harris
 */

import { Scene } from './Scene';

/**
 * A utility to create numeric values based on parsing an expression string.
 *
 * It is often useful to define positions of elements in a diagram in terms
 * of symbolic locations, and offsets from them, rather than absolute pixel
 * coordinates. Aniblock supports a compact expression syntax which allows
 * users to define positions using a small expression string. The [[Position]]
 * function provides the means to convert those expressions into numeric
 * values.
 *
 *
 * Expression string format
 * ========================
 *
 * Expressions consist of one or more tokens separated by whitespace.
 *
 * Tokens come in two types:
 *
 * - values : define a numeric value, either literal or symbolic.
 * - operators : define a mathematical operator to perform.
 *
 * Value type tokens must be separated by an operator type token.
 *
 * Operator tokens must only occur between two value type tokens.
 *
 *
 * Value tokens
 * ------------
 *
 * Value tokens define a literal or symbolic numeric value. Valid values are:
 *
 * - `<int>` : integer literals (may be negative).
 * - `<int>%` : percentage literals (may be negative, can exceed 100%).
 * - `<str>` : symbolic name of a guide or constant.
 *
 * Integer literals are used directly as pixel coordinates.
 *
 * Percentage literals are interpreted as a percentage of the parent scene
 * size, and converted into absolute pixel coordinates.
 *
 * Symbolic names are converted into absolute pixel coordinates by looking up
 * any pre-defined guides and constants in the parent scene. Guides are axis
 * specific, so `Positions` are created in the context of a specific axis.
 *
 *
 * Operator tokens
 * ---------------
 *
 * Operator tokens define how value tokens are combined. Valid operators are:
 *
 * - `+` : addition.
 * - `-` : subtraction.
 *
 * Operators are strictly interpreted left-to-right; there is no operator
 * precedence or support for parentheses.
 *
 * @param scene The scene to source any constants and guides from.
 * @param axis The axis to source any named guides from.
 *
 * - `x`: expression may use constants and vertical guides.
 * - `y`: expression may use constants and horizontal guides.
 * - `k`: pseudo-axis for defining constants; expression may use constants.
 *
 * @param format The expression string, or a number which will be passed
 *               directly though without conversion.
 */
export function Position(scene: Scene, axis: string, format: string | number) {
    if (axis != 'x' && axis != 'y' && axis != 'k') {
        throw new Error('APosition: Bad axis ' + axis);
    }

    if (typeof format == 'number') {
        return format;
    }

    let tokens = format.split(/\s+/);
    let pos = 0;

    if (tokens.length == 0) {
        throw new Error('APosition: Bad format ' + format);
    }

    pos = parse_value(scene, axis, tokens[0]);

    for (let i = 1; i < tokens.length; i += 2) {
        let op = parse_operator(tokens[i]);
        let val = parse_value(scene, axis, tokens[i + 1]);
        if (val == undefined) {
            throw new Error('APosition: Bad value "' + tokens[i + 1] + '"');
        }
        pos = op(pos, val);
    }

    return pos;
}

/**
 * @hidden Parse a value token.
 *
 * @param scene The scene to source any guides from.
 * @param axis The axis to source any guides from.
 * @param token The value token string to parse.
 *
 * @returns The parsed position, in pixels.
 */
function parse_value(scene: Scene, axis: string, token: string): number {
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
 * @hidden Parse an operator token.
 *
 * @param token The operator token string to parse.
 *
 * @returns A function of the form op(a, b) implementing the operator.
 */
function parse_operator(token: string): any {
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
