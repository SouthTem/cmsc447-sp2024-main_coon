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
        this.levelData = data.levelData;
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

        let user = getUser();
        user.then(json =>
        {
            let success = json.success;
            let lastLevel = json.lastLevel;
            if (success)
            {
                let lastIndex = levelsArray.findIndex(x => x.name == lastLevel);
                let currIndex = levelsArray.findIndex(x => x.name == this.name);
                let newLevel = currIndex >= lastIndex ? true : false;
                addRun(this.score, this.coins, this.name, newLevel);
            }
            else
            {
                alert('you are not logged in. Redirecting to login page!');
                window.location.href = "/login_page";
            }
        });

        const retry = this.add.text(314 - 50, centerY + 200, 'Retry', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        retry.on("pointerover", () => {
            retry.setStyle({ fill: '#ff0'});
        });

        retry.on("pointerout", () => {
            retry.setStyle({ fill: '#FFF'});
        });

        retry.on("pointerup", () => {
            this.scene.start('Game', this.levelData);
        });

        const mainMenu = this.add.text(541, centerY + 200, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        mainMenu.on("pointerover", () => {
            mainMenu.setStyle({ fill: '#ff0'});
        });

        mainMenu.on("pointerout", () => {
            mainMenu.setStyle({ fill: '#FFF'});
        });

        mainMenu.on("pointerup", () => {
            this.scene.start('MainMenu');
        });

        // restart the game with r
        this.input.keyboard.on('keydown-R', () => {
            this.scene.start('Game', this.levelData);
        });
    }

    update()
    {
        this.sound.stopAll();
    }
}