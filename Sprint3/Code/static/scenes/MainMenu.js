//import { Scene } from 'phaser';

class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        let centerX = config.width / 2;
        let centerY = config.height / 2;

        this.add.image(centerX, centerY, 'background');

        this.add.image(centerX, centerY - 100, 'logo');

        const playButton = this.createButton(centerX, centerY, 'Play', () =>{
            this.scene.start('Game', level1Data);
        });

        this.playButton = playButton;

        const levelButton = this.createButton(centerX, centerY + 100, 'Level Select', () =>{
            this.scene.start('LevelSelect');
        });

        this.levelButton = levelButton;

        const customButton = this.createButton(centerX, centerY + 200, 'Customize', () =>{
            this.scene.start('Customize');
        });

        this.customButton = customButton;
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
