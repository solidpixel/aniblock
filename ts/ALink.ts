/*
 * Aniblock Copyright (c) 2019, Pete Harris
 */
import { AScene } from './AScene'
import { ABlock, Edge, Dir, ZOrder } from './ABlock'

export class ALink extends ABlock {
    private exit: Edge
    private src: ABlock
    private dst: ABlock

    constructor(
        scene: AScene,
        id: string,
        cls: string,
        label: string,
        src: ABlock,
        dst: ABlock,
        exit: Edge,
        dim: number,
        plug: boolean = true
    ) {
        let top = 0
        let bottom = 0
        let left = 0
        let right = 0

        if (exit == Edge.Top) {
            bottom = src.get_edge(Edge.Top)
            if (plug) {
                top = dst.get_edge(Edge.Bottom)
            } else {
                top = bottom
            }
        } else if (exit == Edge.Right) {
            left = src.get_edge(Edge.Right)
            if (plug) {
                right = dst.get_edge(Edge.Left)
            } else {
                right = left
            }
        } else if (exit == Edge.Bottom) {
            top = src.get_edge(Edge.Bottom)
            if (plug) {
                bottom = dst.get_edge(Edge.Top)
            } else {
                bottom = top
            }
        } else {
            // if (exit == Edge.Left)
            right = src.get_edge(Edge.Left)
            if (plug) {
                left = dst.get_edge(Edge.Right)
            } else {
                left = right
            }
        }

        if (exit == Edge.Top || exit == Edge.Bottom) {
            left = src.get_x() - dim / 2
            right = left + dim
        } else {
            top = src.get_y() - dim / 2
            bottom = top + dim
        }

        let w = right - left
        let h = bottom - top
        let x = left + w / 2
        let y = top + h / 2

        super(scene, id, cls, label, x, y, w, h, ZOrder.Bottom)
        this.exit = exit
        this.src = src
        this.dst = dst
        this.baseType = 'Link'
        this.src.add_link(this)

        if (!plug) {
            let grpId = '#' + this.id
            this.scene.tl.to(grpId, 0, { fillOpacity: 1 })
        }
    }

    /** @hidden */
    public update(timeOffset: number = null): number {
        let dur = null
        if (this.exit == Edge.Top) {
            let src = this.src.get_edge(Edge.Top)
            let cur = this.get_edge(Edge.Bottom)
            let newH = this.h - (cur - src)
            if (newH < this.h) {
                dur = this.change_height(newH, Dir.Up, timeOffset)
            } else {
                dur = this.change_height(newH, Dir.Down, timeOffset)
            }
            let dX = this.src.get_x() - this.xOffset
            dur = this.move_by_x(dX, -dur)
        } else if (this.exit == Edge.Right) {
            let src = this.src.get_edge(Edge.Right)
            let cur = this.get_edge(Edge.Left)
            let newW = this.w - (src - cur)
            if (newW < this.w) {
                dur = this.change_width(newW, Dir.Right, timeOffset)
            } else {
                dur = this.change_width(newW, Dir.Left, timeOffset)
            }
            let dY = this.src.get_y() - this.yOffset
            dur = this.move_by_y(dY, -dur)
        } else if (this.exit == Edge.Bottom) {
            let src = this.src.get_edge(Edge.Bottom)
            let cur = this.get_edge(Edge.Top)
            let newH = this.h - (src - cur)
            if (newH < this.h) {
                dur = this.change_height(newH, Dir.Down, timeOffset)
            } else {
                dur = this.change_height(newH, Dir.Up, timeOffset)
            }
            let dX = this.src.get_x() - this.xOffset
            dur = this.move_by_x(dX, -dur)
        } else {
            // if (this.exit == Edge.Left)
            let src = this.src.get_edge(Edge.Left)
            let cur = this.get_edge(Edge.Right)
            let newW = this.w - (cur - src)
            if (newW < this.w) {
                dur = this.change_width(newW, Dir.Left, timeOffset)
            } else {
                dur = this.change_width(newW, Dir.Right, timeOffset)
            }
            let dY = this.src.get_y() - this.yOffset
            dur = this.move_by_y(dY, -dur)
        }
        return dur
    }

    public unplug(timeOffset: number = null): number {
        let dur = null
        if (this.exit == Edge.Top) {
            dur = this.change_height(0, Dir.Down, timeOffset)
        } else if (this.exit == Edge.Right) {
            dur = this.change_width(0, Dir.Left, timeOffset)
        } else if (this.exit == Edge.Bottom) {
            dur = this.change_height(0, Dir.Up, timeOffset)
        } else {
            // if (this.exit == Edge.Left)
            dur = this.change_width(0, Dir.Right, timeOffset)
        }
        return dur
    }

    public plug(timeOffset: number = null): number {
        let dur = null
        if (this.exit == Edge.Top) {
            let src = this.src.get_edge(Edge.Top)
            let dst = this.dst.get_edge(Edge.Bottom)
            dur = this.change_height(src - dst, Dir.Up, timeOffset)
        } else if (this.exit == Edge.Right) {
            let src = this.src.get_edge(Edge.Right)
            let dst = this.dst.get_edge(Edge.Left)
            dur = this.change_width(dst - src, Dir.Right, timeOffset)
        } else if (this.exit == Edge.Bottom) {
            let src = this.src.get_edge(Edge.Bottom)
            let dst = this.dst.get_edge(Edge.Top)
            dur = this.change_height(dst - src, Dir.Down, timeOffset)
        } else {
            // if (this.exit == Edge.Left)
            let src = this.src.get_edge(Edge.Left)
            let dst = this.dst.get_edge(Edge.Right)
            dur = this.change_width(src - dst, Dir.Left, timeOffset)
        }
        return dur
    }
}
