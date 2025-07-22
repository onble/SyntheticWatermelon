const { ccclass, property } = cc._decorator;

@ccclass
export default class Fruit extends cc.Component {
    // 水果编号，同时用于索引要显示的水果精灵图片
    fruitNumber: number = 0;
    protected start(): void {}
}
