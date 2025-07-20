const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    protected onLoad(): void {
        this.node.setContentSize(cc.winSize.width, cc.winSize.height);
    }
    protected start(): void {}
}
