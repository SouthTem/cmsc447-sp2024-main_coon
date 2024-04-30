const level1Data = {
    name: level1Name,
    key: level1key,
    sprite: woodenKey,
    speed: scrollSpeed,
    music: null,
    difficulty: 1,
    bg: backgroundTown,
    image: 'level1_preview', 
}

const level2Data = {
    name: level2Name,
    key: level2key,
    sprite: spaceKey,
    speed: scrollSpeed,
    music: musicSpaceKey,
    difficulty: 2,
    bg: backgroundSpace,
    image: 'level2_preview', 
}

const level3Data = {
    name: level3Name,
    key: level3key,
    sprite: castleKey,
    speed: scrollSpeed,
    music: musicCastleKey,
    difficulty: 3,
    bg: backgroundCastle,
    image: 'level3_preview', 
}

const bonusLevelData = {
    name: "Speed Run",
    key: "bonus_level",
    sprite: castleKey,
    speed: scrollSpeed * 2,
    music: musicCastleKey,
    difficulty: 5,
    bg: backgroundSunset,
    image: 'bonus_level_preview', 
}

const levelsArray = [level1Data, level2Data, level3Data, bonusLevelData];

class LevelSelect extends Phaser.Scene
{
    constructor ()
    {
        super('LevelSelect');
    }

    preload()
    {
        this.load.setPath('static/Sprites');
        
    }

    index = 0;

    create ()
    {
        let centerX = config.width / 2;
        let centerY = config.height / 2;

        this.add.image(centerX, centerY, 'background');

        // const headerText = this.add.text(centerX, 50, 'Select A Level', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5);

        const name = this.add.text(centerX, 100, 'Easy Level', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        this.name = name;

        this.add.rectangle(centerX, centerY, 500 + 20, 300 + 20, '0x0040fc');
        const levelImage = this.add.image(centerX, centerY, level3Data.image);
        levelImage.setScale(500/700, 300/500);
        this.levelImage = levelImage;

        const challenge = this.add.text(centerX, centerY + 150 + 50, 'Difficulty: 3', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        this.challenge = challenge;

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
            let user = getUser();
            user.then(json =>
            {
                let success = json.success;
                let lastLevel = json.lastLevel;
                if (success)
                {
                    let lastIndex = levelsArray.findIndex(x => x.name == lastLevel);
                    let isUnlocked = this.index <= lastIndex + 1;
                    if (isUnlocked)
                    {
                        this.sound.stopAll();
                        this.scene.start('Game', levelsArray[this.index]);
                    }
                    else
                    {
                        alert("level is not unlocked yet");
                    }
                }
                else
                {
                    alert('you are not logged in. Redirecting to login page!');
                    window.location.href = "/login_page";
                }
            });
        });

        
        //const homeRect = this.add.rectangle(config.width - 10, 0 + 10, 50, 50, '#ffffff').setOrigin(1, 0);
        const homeButton = this.add.sprite(config.width - 10, 0 + 10, 'menu_house').setOrigin(1, 0).setScale(2);

        homeButton.setInteractive();
        homeButton.on('pointerover', () => {
            homeButton.setTint("0xffff00");
        });
        homeButton.on('pointerout', () => {
            homeButton.setTint("0xffffff");
        });
        homeButton.on("pointerup", () => {
            this.scene.start("MainMenu");
        });

        const leftArrow = this.add.sprite(0 + 50, centerY, 'menu_arrow').setScale(3).setFlipX(true);
        leftArrow.setInteractive();
        leftArrow.on('pointerover', () => {
            leftArrow.setTint("0xffff00");
        });
        leftArrow.on('pointerout', () => {
            leftArrow.setTint("0xffffff");
        });
        leftArrow.on("pointerup", () => {
            this.updateIndex(this.index - 1);
        });

        //const rightRect = this.add.rectangle(config.width - 50, centerY, 50, 50, '#ffffff');
        const rightArrow = this.add.sprite(config.width - 50, centerY, 'menu_arrow').setScale(3);
        rightArrow.setInteractive();
        rightArrow.on('pointerover', () => {
            rightArrow.setTint("0x0ffff00");
        });
        rightArrow.on('pointerout', () => {
            rightArrow.setTint("0xffffff");
        });
        rightArrow.on("pointerup", () => {
            this.updateIndex(this.index + 1);
        });

        this.input.keyboard.on('keydown-LEFT', () => {
            this.updateIndex(this.index - 1);
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            this.updateIndex(this.index + 1);
        });

        this.updateIndex(0);
    }

    updateIndex(newIndex)
    {
        this.index = newIndex >= levelsArray.length ? 0 
            : newIndex < 0 ? levelsArray.length - 1 
            : newIndex;
        const currLevel = levelsArray[this.index];

        this.levelImage.setTexture(currLevel.image);
        this.challenge.setText(`Difficulty: ${currLevel.difficulty}`);
        this.name.setText(`${currLevel.name}`);
    }
}