//import { Scene } from 'phaser';

class GameOver extends Phaser.Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        let centerX = config.width / 2;
        let centerY = config.height / 2;
        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(centerX, centerY, 'background').setAlpha(0.5);

        this.add.text(centerX, centerY, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.restart('MainMenu');
            this.scene.start('MainMenu');

        });

        // restart the game with space
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('Game');
        });

        // restart the game with r
        this.input.keyboard.on('keydown-R', () => {
            this.scene.start('Game');
        });
    }
}
