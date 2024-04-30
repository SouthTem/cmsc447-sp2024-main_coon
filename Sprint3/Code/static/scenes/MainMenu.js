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

        let bg = this.add.image(centerX, centerY, backgroundSunset);
        bg.displayWidth = config.width;
        bg.displayHeight = config.height;

        // updates the game with the outfit information from the database
        // this could probably be merged with getUser, but this works so whatever
        this.getCoinsFromDatabase();

        this.add.image(centerX, centerY - 100, 'logo');

        const playButton = this.createButton(centerX, centerY, 'Play', () =>
        {
            this.sound.stopAll();

            let user = getUser();
            user.then(json =>
            {
                let success = json.success;
                let lastLevel = json.lastLevel;
                if (success)
                {
                    let index = levelsArray.findIndex(x => x.name == lastLevel);
                    if (index + 1 >= levelsArray.length)
                    {
                        this.scene.start('Game', levelsArray[levelsArray.length - 1]);
                    }
                    else if (index >= 0)
                    {
                        this.scene.start('Game', levelsArray[index + 1]);
                    }
                    else
                    {
                        this.scene.start('Game', levelsArray[0]);
                    }
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
            this.getCoinsFromDatabase().then( (coins) => {
                if (coins == undefined) {
                    coins = -1;
                }
                this.scene.start('Customize', {coins:coins});
            });
            
        });

        this.customButton = customButton;

        let soundConfig = {
            loop: true,
            volume: 1,
        };
        this.sound.add(musicMenuKey, soundConfig);
        this.sound.get(musicMenuKey).play();
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

    getCoinsFromDatabase()
    {
        let user = getUser();
        return user.then(json =>
        {
            console.log(json);
            let success = json.success;
            let name = json.name;
            let coins = json.coins;
            let unlockedOutfits = json.unlockedOutfits;
            let equippedOutfits = json.equippedOutfits;

            if (success)
            {
                for (let i = 0; i < unlockedOutfits.length; ++i)
                {
                    let found = skinArray.find(x => x.name == unlockedOutfits[i]) ??
                        capesArray.find(x => x.name == unlockedOutfits[i]) ??
                        hatsArray.find(x => x.name == unlockedOutfits[i]);

                    if (found != undefined)
                    {
                        found.obtained = true;
                    }
                }

                for (let i = 0; i < equippedOutfits.length; ++i)
                {
                    let found = skinArray.find(x => x.name == equippedOutfits[i]) ??
                        capesArray.find(x => x.name == equippedOutfits[i]) ??
                        hatsArray.find(x => x.name == equippedOutfits[i]);

                    if (found != undefined)
                    {
                        found.equipped = true;
                    }
                }

                if (skinArray.find(x => x.equipped) == undefined)
                {
                    skin1.obtained = true;
                    skin1.equipped = true;
                    changeOutfit(skinArray)
                }

                return coins;
            }
            else
            {
                alert('you are not logged in. Redirecting to login page!');
                window.location.href = "/login_page";
                return -1;
            }
        });
    }
}
