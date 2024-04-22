class Customize extends Phaser.Scene
{
    constructor ()
    {
        super('Customize');
    }

    create ()
    {
        let centerX = config.width / 2;
        let centerY = config.height / 2;

        this.add.image(centerX, centerY, 'background');
    }

    createButton(x, y, text, clickAction)
    {
        const levelButton = this.add.text(x, y, text, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        levelButton.on("pointerover", () => {
            levelButton.setStyle({ fill: '#ff0'});
        });

        levelButton.on("pointerout", () => {
            levelButton.setStyle({ fill: '#FFF'});
        });

        levelButton.on("pointerup", () => {
            clickAction();
        });


        return levelButton;
    }
}
