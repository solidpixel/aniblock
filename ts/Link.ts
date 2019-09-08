/*
 * Aniblock Copyright (c) 2019, Pete Harris
 */

import { Scene } from './Scene';
import { Block, Edge, Dir, ZOrder } from './Block';

export class Link extends Block {
    private exit: Edge;
    private src: Block;
    private dst: Block;

    constructor(
        scene: Scene,
        src: Block,
        dst: Block,
        exit: Edge,
        dim: number,
        plug: boolean = true,
        cls: string = null
    ) {
        let top = 0;
        let bottom = 0;
        let left = 0;
        let right = 0;

        if (exit == Edge.Top) {
            bottom = src.get_edge(Edge.Top);
            if (plug) {
                top = dst.get_edge(Edge.Bottom);
            } else {
                top = bottom;
            }
        } else if (exit == Edge.Right) {
            left = src.get_edge(Edge.Right);
            if (plug) {
                right = dst.get_edge(Edge.Left);
            } else {
                right = left;
            }
        } else if (exit == Edge.Bottom) {
            top = src.get_edge(Edge.Bottom);
            if (plug) {
                bottom = dst.get_edge(Edge.Top);
            } else {
                bottom = top;
            }
        } else {
            // if (exit == Edge.Left)
            right = src.get_edge(Edge.Left);
            if (plug) {
                left = dst.get_edge(Edge.Right);
            } else {
                left = right;
            }
        }

        if (exit == Edge.Top || exit == Edge.Bottom) {
            left = src.get_x() - dim / 2;
            right = left + dim;
        } else {
            top = src.get_y() - dim / 2;
            bottom = top + dim;
        }

        let w = right - left;
        let h = bottom - top;
        let x = left + w / 2;
        let y = top + h / 2;

        super(scene, null, x, y, w, h, cls, ZOrder.Bottom);
        this.exit = exit;
        this.src = src;
        this.dst = dst;
        this.baseType = 'Link';
        this.src.add_link(this);

        if (!plug) {
            let grpId = '#' + this.id;
            this.scene.tl.to(grpId, 0, { fillOpacity: 1 });
        }
    }

    /**
     * @hidden
     *
     * Get the DOM class used to represent the rect in this block.
     *
     * @returns The DOM class name.
     */
    public get_block_class(): string {
        return 'ALink';
    }

    /** @hidden */
    public update(startTime: number = null): number {
        if (this.exit == Edge.Top) {
            let src = this.src.get_edge(Edge.Top);
            let cur = this.get_edge(Edge.Bottom);
            let newH = this.h - (cur - src);
            if (newH < this.h) {
                this.change_height(newH, Dir.Up, startTime);
            } else {
                this.change_height(newH, Dir.Down, startTime);
            }
            let dX = this.src.get_x() - this.xOffset;
            this.move_by_x(dX, startTime);
        } else if (this.exit == Edge.Right) {
            let src = this.src.get_edge(Edge.Right);
            let cur = this.get_edge(Edge.Left);
            let newW = this.w - (src - cur);
            if (newW < this.w) {
                this.change_width(newW, Dir.Right, startTime);
            } else {
                this.change_width(newW, Dir.Left, startTime);
            }
            let dY = this.src.get_y() - this.yOffset;
            this.move_by_y(dY, startTime);
        } else if (this.exit == Edge.Bottom) {
            let src = this.src.get_edge(Edge.Bottom);
            let cur = this.get_edge(Edge.Top);
            let newH = this.h - (src - cur);
            if (newH < this.h) {
                this.change_height(newH, Dir.Down, startTime);
            } else {
                this.change_height(newH, Dir.Up, startTime);
            }
            let dX = this.src.get_x() - this.xOffset;
            this.move_by_x(dX, startTime);
        } else {
            // if (this.exit == Edge.Left)
            let src = this.src.get_edge(Edge.Left);
            let cur = this.get_edge(Edge.Right);
            let newW = this.w - (cur - src);
            if (newW < this.w) {
                this.change_width(newW, Dir.Left, startTime);
            } else {
                this.change_width(newW, Dir.Right, startTime);
            }
            let dY = this.src.get_y() - this.yOffset;
            this.move_by_y(dY, startTime);
        }
        return startTime;
    }

    public unplug(startTime: number = null): number {
        let tlEndTime = null;
        if (this.exit == Edge.Top) {
            tlEndTime = this.change_height(0, Dir.Down, startTime);
        } else if (this.exit == Edge.Right) {
            tlEndTime = this.change_width(0, Dir.Left, startTime);
        } else if (this.exit == Edge.Bottom) {
            tlEndTime = this.change_height(0, Dir.Up, startTime);
        } else {
            tlEndTime = this.change_width(0, Dir.Right, startTime);
        }
        return tlEndTime;
    }

    public plug(startTime: number = null): number {
        let tlEndTime = null;
        if (this.exit == Edge.Top) {
            let src = this.src.get_edge(Edge.Top);
            let dst = this.dst.get_edge(Edge.Bottom);
            tlEndTime = this.change_height(src - dst, Dir.Up, startTime);
        } else if (this.exit == Edge.Right) {
            let src = this.src.get_edge(Edge.Right);
            let dst = this.dst.get_edge(Edge.Left);
            tlEndTime = this.change_width(dst - src, Dir.Right, startTime);
        } else if (this.exit == Edge.Bottom) {
            let src = this.src.get_edge(Edge.Bottom);
            let dst = this.dst.get_edge(Edge.Top);
            tlEndTime = this.change_height(dst - src, Dir.Down, startTime);
        } else {
            let src = this.src.get_edge(Edge.Left);
            let dst = this.dst.get_edge(Edge.Right);
            tlEndTime = this.change_width(src - dst, Dir.Left, startTime);
        }
        return tlEndTime;
    }
}
