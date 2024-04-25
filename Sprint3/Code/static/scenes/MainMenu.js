//import { Scene } from 'phaser';

class MainMenu extends Phaser.Scene
{
    constructor()
    {
        super('MainMenu');
    }

    create()
    {
        let centerX = config.width / 2;
        let centerY = config.height / 2;

        let bg = this.add.image(centerX, centerY, 'bg_sunset');
        bg.displayWidth = config.width;
        bg.displayHeight = config.height;

        this.add.image(centerX, centerY - 100, 'logo');

        const playButton = this.createButton(centerX, centerY, 'Play', () =>
        {
            this.sound.get('menu').stop();

            let user = getUser();
            let levelData = undefined;
            user.then(json =>
            {
                let success = json.success;
                let lastLevel = json.lastLevel;
                if (success)
                {
                    levelData = levelsArray.find(x => x.name == lastLevel)

                    if (levelData != undefined)
                        this.scene.start('Game', levelData);
                    else
                        this.scene.start('Game', level1Data);
                }
                else
                {
                    alert('you are not logged in. Redirecting to login page!');
                    window.location.href = "/login_page";
                }
            });
        });

        this.playButton = playButton;

        const levelButton = this.createButton(centerX, centerY + 100, 'Level Select', () =>
        {
            this.scene.start('LevelSelect');
        });

        this.levelButton = levelButton;

        const customButton = this.createButton(centerX, centerY + 200, 'Customize', () =>
        {
            this.scene.start('Customize');
        });

        this.customButton = customButton;

        let soundConfig = {
            loop: true,
            volume: 1,
        };
        this.sound.add('menu', soundConfig);
    }

    update()
    {
        if (!this.sound.get('menu').isPlaying)
        {
            this.sound.get('menu').play();
        }
    }

    createButton(x, y, text, clickAction)
    {
        const levelButton = this.add.text(x, y, text, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        levelButton.on("pointerover", () =>
        {
            levelButton.setStyle({ fill: '#ff0' });
        });

        levelButton.on("pointerout", () =>
        {
            levelButton.setStyle({ fill: '#FFF' });
        });

        levelButton.on("pointerup", () =>
        {
            clickAction();
        });


        return levelButton;
    }
}
