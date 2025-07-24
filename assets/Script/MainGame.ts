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

    //用来挂载落下的水果，作为他们的父节点，方便遍历查找
    @property(cc.Node)
    fruitNode: cc.Node = null;

    // 用来暂存生成的水果节点
    targetFruit: cc.Node = null;

    // 已创建水果计数
    createFruitCount: number = 0;

    // 分数变动和结果
    scoreObj = {
        isScoreChanged: false,
        target: 0,
        change: 0,
        score: 0,
    };

    // 设置一个静态单例引用，方便其他类中调用该类方法
    static Instance: MainGame = null;

    protected onLoad(): void {
        null != MainGame.Instance && MainGame.Instance.destroy();
        MainGame.Instance = this;

        this.phsicsSystemCtrl(true, false);
    }
    protected start(): void {
        this.createOneFruit(0);

        this.bindTouch();
    }

    protected update(dt: number): void {
        this.updateScoreLabel(dt);
    }

    createLevelUpFruit = function (fruitNumber: number, position: cc.Vec3) {
        let _t: MainGame = this;
        let o = cc.instantiate(this.fruitPre);
        o.parent = _t.fruitNode;
        o.getComponent(cc.Sprite).spriteFrame = _t.fruitSprites[fruitNumber];
        o.getComponent(Fruit).fruitNumber = fruitNumber;
        o.position = position;
        o.scale = 0;

        o.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, -100);
        o.getComponent(cc.PhysicsCircleCollider).radius = o.height / 2;
        o.getComponent(cc.PhysicsCircleCollider).apply();
        cc.tween(o)
            .to(0.5, { scale: 1 }, { easing: "backOut" })
            .call(function () {})
            .start();
    };

    //#region 分数面板更新
    setScoreTween(score: number) {
        let scoreObj = this.scoreObj;
        scoreObj.target != score &&
            ((scoreObj.target = score),
            ((scoreObj.change = Math.abs((scoreObj.target = scoreObj.score))), (scoreObj.isScoreChanged = !0)));
    }

    updateScoreLabel(dt: number) {
        let scoreObj = this.scoreObj;
        if (scoreObj.isScoreChanged) {
            (scoreObj.score += dt * scoreObj.change * 5),
                scoreObj.score >= scoreObj.target &&
                    ((scoreObj.score = scoreObj.target), (scoreObj.isScoreChanged = !1));
            var t = Math.floor(scoreObj.score);
            this.scoreLabel.string = t.toString();
        }
    }
    //#endregion 分数面板更新

    phsicsSystemCtrl(enablePhysics: boolean, enableDebug: boolean) {
        cc.director.getPhysicsManager().enabled = enablePhysics;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -300);
        if (enableDebug) {
            cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_shapeBit;
        }
        cc.director.getCollisionManager().enabled = enablePhysics;
        cc.director.getCollisionManager().enabledDebugDraw = enableDebug;
    }

    // 创建一个水果
    createOneFruit(index: number) {
        let t = this;
        let n = cc.instantiate(this.fruitPre);
        n.parent = this.topNode;
        n.getComponent(cc.Sprite).spriteFrame = this.fruitSprites[index];
        // 获取附加给水果节点的Fruit脚本组件，注意名字大小写敏感
        n.getComponent(Fruit).fruitNumber = index;

        // 创建时不受重力影响，碰撞物理边界半径为0
        n.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
        n.getComponent(cc.PhysicsCircleCollider).radius = 0;
        n.getComponent(cc.PhysicsCircleCollider).apply();

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
        let h = this.targetFruit.height;
        t.targetFruit.getComponent(cc.PhysicsCircleCollider).radius = h / 2;
        t.targetFruit.getComponent(cc.PhysicsCircleCollider).apply();
        t.targetFruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
        t.targetFruit.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, -800);

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
