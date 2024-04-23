const level1Data = {
    name: level1Name,
    key: level1key,
    sprite: woodenKey,
    music: null,
    difficulty: 1,
    image: 'level1_preview', 
}

const level2Data = {
    name: level2Name,
    key: level2key,
    sprite: spaceKey,
    music: 'space',
    difficulty: 2,
    image: 'level2_preview', 
}

const level3Data = {
    name: level3Name,
    key: level3key,
    sprite: castleKey,
    music: null,
    difficulty: 3,
    image: 'level3_preview', 
}

const level5Data = {
    name: level5Name,
    key: level5key,
    sprite: spaceKey,
    music: null,
    difficulty: 4,
    image: 'level3_preview', 
}

const levelsArray = [level1Data, level2Data, level3Data, level5Data];

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
            this.sound.get('menu').stop();
            this.scene.start('Game', levelsArray[this.index]);
        });

        
        const homeRect = this.add.rectangle(config.width - 10, 0 + 10, 50, 50, '#ffffff').setOrigin(1, 0);

        homeRect.setInteractive();
        homeRect.on("pointerup", () => {
            this.scene.start("MainMenu");
        });

        const leftRect = this.add.rectangle(0 + 50, centerY, 50, 50, '#ffffff');
        leftRect.setInteractive();
        leftRect.on("pointerup", () => {
            this.updateIndex(this.index - 1);
        });

        const rightRect = this.add.rectangle(config.width - 50, centerY, 50, 50, '#ffffff');
        rightRect.setInteractive();
        rightRect.on("pointerup", () => {
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