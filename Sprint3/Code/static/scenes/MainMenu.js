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

        this.add.text(centerX, centerY + 100, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // start the game with click
        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });

        // start the game with space
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('Game');
        });
    }
}
