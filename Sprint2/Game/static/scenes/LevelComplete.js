class LevelComplete extends Phaser.Scene
{
    score = 0;
    coins = 0;
    name = '';

    constructor ()
    {
        super('LevelComplete');
    }

    init (data)
    {
        this.score = data.score;
        this.coins = data.coins;
        this.name = data.name;
    }

    create ()
    {
        let centerX = config.width / 2;
        let centerY = config.height / 2;
        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(centerX, centerY, 'background').setAlpha(0.5);

        this.add.text(centerX, centerY - 100, 'Level Complete', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY, `Score: ${this.score}`, {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 100, `Coins: ${this.coins}`, {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        addRun(this.score, this.coins, this.name);

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