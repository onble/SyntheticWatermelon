import Fruit from "./Fruit";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainGame extends cc.Component {
    // 水果精灵图列表
    @property([cc.SpriteFrame])
    fruitSprites: Array<cc.SpriteFrame> = [];

    // 分数label标签
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    // 水果预制节点资源
    @property(cc.Prefab)
    fruitPre: cc.Prefab = null;

    // 顶部区域节点，生成的水果要添加到这个节点里面
    @property(cc.Node)
    topNode: cc.Node = null;

    // 用来暂存生成的水果节点
    targetFruit: cc.Node = null;

    // 已创建水果计数
    createFruitCount: number = 0;

    protected start(): void {
        this.createOneFruit(0);

        this.bindTouch();
    }

    createOneFruit(index: number) {
        let t = this;
        let n = cc.instantiate(this.fruitPre);
        n.parent = this.topNode;
        n.getComponent(cc.Sprite).spriteFrame = this.fruitSprites[index];
        // 获取附加给水果节点的Fruit脚本组件，注意名字大小写敏感
        n.getComponent(Fruit).fruitNumber = index;

        // 从新变大的一个展示效果
        n.scale = 0;
        cc.tween(n)
            .to(0.5, { scale: 1 }, { easing: "backOut" })
            .call(function () {
                t.targetFruit = n;
            })
            .start();
    }

    // 绑定Touch事件
    bindTouch() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    // 触摸开始
    onTouchStart(event: cc.Event.EventTouch) {
        if (null == this.targetFruit) {
            return;
        }

        // 把点击位置的x坐标值赋值给水果
        let x = this.node.convertToNodeSpaceAR(event.getLocation()).x;
        let y = this.targetFruit.position.y;
        cc.tween(this.targetFruit)
            .to(0.1, {
                position: cc.v3(x, y),
            })
            .start();
    }

    // 拖动
    onTouchMove(event: cc.Event.EventTouch) {
        if (null == this.targetFruit) {
            return;
        }

        this.targetFruit.x = this.node.convertToNodeSpaceAR(event.getLocation()).x;
    }
    // Touch结束
    onTouchEnd(event: cc.Event.EventTouch) {
        let t = this;
        if (null == this.targetFruit) {
            return;
        }
        // 让水果降落
        // TODO:

        // 去掉暂存指向
        this.targetFruit = null;
        // 生成一个新的水果
        this.scheduleOnce(function () {
            0 == t.createFruitCount
                ? (t.createOneFruit(0), t.createFruitCount++)
                : 1 == t.createFruitCount
                ? (t.createOneFruit(0), t.createFruitCount++)
                : 2 == t.createFruitCount
                ? (t.createOneFruit(1), t.createFruitCount++)
                : 3 == t.createFruitCount
                ? (t.createOneFruit(2), t.createFruitCount++)
                : 4 == t.createFruitCount
                ? (t.createOneFruit(2), t.createFruitCount++)
                : 5 == t.createFruitCount
                ? (t.createOneFruit(3), t.createFruitCount++)
                : (t.createFruitCount > 5 && t.createOneFruit(Math.floor(Math.random() * 5)), t.createFruitCount++);
        }, 0.5);
    }
}
