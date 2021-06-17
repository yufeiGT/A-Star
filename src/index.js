import elementResizeDetectorMaker from 'element-resize-detector';
import merge from '@~crazy/merge';

class Point {

    constructor(x, y, endPoint, parent = null) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.endPoint = endPoint === true ? this : endPoint;
        this.g = this.parent ? this.parent.g + 1 : 0;
        this.h = endPoint ? Math.abs(endPoint.x - this.x) + Math.abs(endPoint.y - this.y) : 0;
        if (parent && parent.parent) {
            this.e = (parent.parent.x == parent.x && this.x == parent.x) || (parent.parent.y == parent.y && this.y == parent.y) ? 0 : 3;
        } else this.e = 1;
        this.f = this.g + this.h + this.e;
    }

    update(point) {
        this.x = point.x;
        this.y = point.y;
        this.parent = point.parent;
        this.f = point.f;
        this.g = point.g;
        this.h = point.h;
        this.e = point.e;
    }

    compareTo(point) {
        return this.f - point.f;
    }

    equal(point) {
        return this.x == point.x && this.y == point.y;
    }

    isEnd() {
        return this.equal(this.endPoint);
    }

    toArray() {
        return [{
            x: this.x,
            y: this.y
        }, ...(this.parent ? this.parent.toArray() : [])];
    }

}

class AStar {

    constructor(options) {
        this.erd = elementResizeDetectorMaker();
        this.setOptions(options);
    }

    setOptions(options) {
        const originOpts = {
            grayarea: this.grayarea,
        };
        if (this.startPoint) originOpts.start = this.startPoint;
        if (this.endPoint) originOpts.end = this.endPoint;
        const opts = merge({
            col: 10,
            row: 10,
            grayarea: [],
            autoCompute: false,
            start: null,
            end: null,
            container: null,
            renderFindArea: false,
        }, this.options, originOpts, options);
        this.options = opts;
        this.setGrayArea(opts.grayarea);
        if (opts.end) this.setEnd(opts.end.x, opts.end.y);
        if (opts.start) this.setStart(opts.start.x, opts.start.y, this.endPoint);
        if (opts.container) this.setContainer(opts.container);
    }

    destroy() {
        this.erd.removeAllListeners(this.canvas);
        this.container.innerHTML = '';
    }

    reset() {
        this.openList = [];
        this.closeList = [];
        this.path = [];
    }

    update() {
        if (this.endPoint) this.endPoint.parent = null;
        if (this.options.autoCompute && this.startPoint && this.endPoint) return this.compute();
        this.reset();
        this.drawCanvas();
    }

    setStart(x, y, endPoint) {
        this.startPoint = new Point(x, y, endPoint);
        this.update();
    }

    setEnd(x, y) {
        this.endPoint = new Point(x, y, true);
        if (this.startPoint) this.setStart(this.startPoint.x, this.startPoint.y, this.endPoint);
        this.update();
    }

    setGrayArea(points) {
        const matrix = [];
        for (let x = 0; x < this.options.col; x++) {
            matrix[x] = [];
            for (let y = 0; y < this.options.row; y++) {
                matrix[x][y] = 0;
            };
        };
        this.matrix = matrix;
        this.grayarea = points;
        points.forEach(({
            x,
            y,
        }) => {
            if (this.matrix[x] == undefined || this.matrix[x][y] == undefined) return;
            this.matrix[x][y] = 1;
        });
        this.update();
    }

    getBestPoint() {
        if (!this.openList.length) return;
        return this.openList.sort((a, b) => a.compareTo(b))[0];
    }

    closePoint(point) {
        this.openList = this.openList.filter(item => !item.equal(point));
        this.closeList.push(point);
    }

    openNearByPoint(point, ignoreGray = false) {
        [{
            x: point.x - 1,
            y: point.y,
        }, {
            x: point.x + 1,
            y: point.y,
        }, {
            x: point.x,
            y: point.y - 1,
        }, {
            x: point.x,
            y: point.y + 1,
        }].forEach(({
            x,
            y,
        }) => {
            if (this.matrix[x] == undefined || this.matrix[x][y] == undefined || (!ignoreGray && this.matrix[x][y] == 1)) return;
            const newPoint = new Point(x, y, this.endPoint, point);
            const open = this.getFromOpenList(newPoint);
            const close = this.getFromCloseList(newPoint);
            if (!open && !close) return this.openList.push(newPoint);
            if (open && newPoint.compareTo(open) < 0) return open.update(newPoint);
        });
    }

    getFromOpenList(point) {
        return this.openList.filter(item => item.equal(point))[0];
    }

    getFromCloseList(point) {
        return this.closeList.filter(item => item.equal(point))[0];
    }

    compute(ignoreGray) {
        this.reset();
        let target = this.startPoint;
        this.openList.push(target);
        while (target && !target.isEnd()) {
            this.openNearByPoint(target, ignoreGray);
            this.closePoint(target);
            target = this.getBestPoint();
        };
        if (target) {
            this.endPoint.update(target);
            this.drawCanvas();
            return this.path = target.toArray();
        } else if (!ignoreGray) return this.compute(true);
        this.drawCanvas();
        return this.path = [];
    }

    setContainer(container) {
        if (!(container instanceof HTMLElement)) return console.error('canvas is not a HTMLElement');
        this.container = container;
        this.canvas = document.createElement('canvas');
        container.innerHTML = '';
        if (!container.clientHeight) return console.error('container height not null');
        container.appendChild(this.canvas);
        this.bindEvent();
        this.erd.listenTo(this.container, () => {
            const {
                clientWidth,
                clientHeight,
            } = container;
            const size = Math.min(~~(container.clientWidth / this.options.col), ~~(container.clientHeight / this.options.row));
            this.blockSize = size;
            this.containerWidth = clientWidth;
            this.containerHeight = clientHeight;
            this.width = size * this.options.col;
            this.height = size * this.options.row;
            this.canvas.width = clientWidth;
            this.canvas.height = clientHeight;
            this.translate = {
                x: (clientWidth - this.width) / 2,
                y: (clientHeight - this.height) / 2,
            };
            this.drawCanvas();
        });
    }

    bindEvent(canvas = this.canvas) {
        if (!(canvas instanceof HTMLCanvasElement)) return;
        console.warn('Click or drag the blank area setting to cancel the obstacle, drag the start / end point to change the position');
        console.warn('点击或拖动空白区域设置取消障碍，开始/结束点可拖动改变位置');
        let isDown = false;
        let isMoved = false;
        let isStart = false;
        let isEnd = false;
        let prePoint = null;

        const handler = ({
            x,
            y,
        }) => {
            if (prePoint && x == prePoint.x && y == prePoint.y || this.matrix[x] == undefined || this.matrix[x][y] == undefined) return;
            prePoint = {
                x,
                y,
            };
            if (isStart) return this.setStart(x, y, this.endPoint);
            if (isEnd) return this.setEnd(x, y);
            if ((this.startPoint && this.startPoint.equal(prePoint)) || (this.endPoint && this.endPoint.equal(prePoint))) return;
            const grayarea = [];
            let inGrayarea = false;
            this.grayarea.forEach(item => {
                if (item.x == x && item.y == y) return inGrayarea = true;
                grayarea.push(item);
            });
            if (!inGrayarea) grayarea.push(prePoint);
            this.setGrayArea(grayarea);
        };

        canvas.addEventListener('mousedown', e => {
            isDown = true;
            const point = this.getPointByOffset(canvas, e);
            if (this.startPoint) isStart = this.startPoint.equal(point);
            if (this.endPoint) isEnd = this.endPoint.equal(point);
        });
        canvas.addEventListener('mousemove', e => {
            if (!isDown) return;
            isMoved = true;
            handler(this.getPointByOffset(canvas, e));
        });
        document.addEventListener('mouseup', e => {
            if (!isDown) return;
            isDown = false;
            if (!isMoved || isStart || isEnd) handler(this.getPointByOffset(canvas, e));
            isMoved = false;
            isStart = false;
            isEnd = false;
            prePoint = null;
        });
    }

    getPointByOffset(canvas, {
        offsetX,
        offsetY,
    }) {
        return {
            x: ~~((offsetX - this.translate.x) / this.blockSize),
            y: ~~((offsetY - this.translate.y) / this.blockSize),
        };
    }

    drawCanvas(canvas = this.canvas) {
        if (!(canvas instanceof HTMLCanvasElement)) return;
        if (!this.translate) return window.requestAnimationFrame(() => this.drawCanvas());
        const context = canvas.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0, 0, this.containerWidth, this.containerHeight);
        context.translate(this.translate.x, this.translate.y);
        // 绘制背景
        (() => {
            context.fillStyle = context.createPattern((() => {
                let cvs = document.createElement('canvas');
                let ctx = cvs.getContext('2d');
                cvs.width = this.blockSize;
                cvs.height = this.blockSize;
                ctx.fillStyle = '#dcdcdc';
                ctx.fillRect(0, 0, this.blockSize, this.blockSize);
                ctx.beginPath();
                ctx.moveTo(0, this.blockSize);
                ctx.lineTo(0, 0);
                ctx.lineTo(this.blockSize, 0);
                ctx.strokeStyle = '#999';
                ctx.stroke();
                return cvs;
            })(), 'repeat');
            context.fillRect(0, 0, this.width, this.height);
            context.beginPath();
            context.moveTo(this.width, 0);
            context.lineTo(this.width, this.height);
            context.lineTo(0, this.height);
            context.strokeStyle = '#999';
            context.lineWidth = 1;
            context.stroke();
        })();
        if (this.options.renderFindArea)[...this.openList, ...this.closeList].forEach(({
            x,
            y,
        }) => {
            const params = [x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize];
            context.fillStyle = 'rgba(0, 0, 0, .5)';
            context.fillRect(...params);
            context.strokeStyle = '#999';
            context.strokeRect(...params);
        });
        this.grayarea.forEach(({
            x,
            y,
        }) => {
            const params = [x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize];
            context.fillStyle = '#000097';
            context.fillRect(...params);
            context.strokeStyle = '#999';
            context.strokeRect(...params);
        });
        if (this.endPoint) {
            const {
                x,
                y,
            } = this.endPoint;
            const radius = this.blockSize / 2;
            let point = this.endPoint.parent;
            if (point) {
                context.beginPath();
                context.moveTo(x * this.blockSize + radius, y * this.blockSize + radius);
                while (point) {
                    context.lineTo(point.x * this.blockSize + radius, point.y * this.blockSize + radius);
                    point = point.parent;
                };
                context.strokeStyle = '#000';
                context.lineWidth = 2;
                context.stroke();
            }
            const params = [x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize];
            context.fillStyle = '#a40000';
            context.fillRect(...params);
            context.strokeStyle = '#999';
            context.strokeRect(...params);
        }
        if (this.startPoint) {
            const {
                x,
                y,
            } = this.startPoint;
            const params = [x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize];
            context.fillStyle = '#018301'
            context.fillRect(...params);
            context.strokeStyle = '#999';
            context.strokeRect(...params);
        }
        context.translate(-this.translate.x, -this.translate.y);
    }

}

export default AStar;