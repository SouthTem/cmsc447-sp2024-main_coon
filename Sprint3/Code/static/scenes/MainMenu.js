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

        const playButton = this.add.text(centerX, centerY, 'Play', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        playButton.on("pointerover", () => {
            playButton.setStyle({ fill: '#ff0'});
        });

        playButton.on("pointerout", () => {
            playButton.setStyle({ fill: '#FFF'});
        });

        playButton.on("pointerup", () => {
            this.scene.start('Game', level1Data); // this might need to have an extra parameter
        });

        this.playButton = playButton;

        const levelButton = this.add.text(centerX, centerY + 100, 'Level Select', {
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
            this.scene.start('LevelSelect');
        });

        this.levelButton = levelButton;
    }
}
