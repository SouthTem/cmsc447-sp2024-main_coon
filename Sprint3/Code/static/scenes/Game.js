//import { Scene } from 'phaser';

var player;
var fakePlayer;

var coins;
var spikes;
var ceilings;

var score;
var scoreText;

var gameDepth = 150;
var coinDepth = 100;
var textDepth = 200;

var cursors;
var gravityKey;
var gravity;
var isFlipped = false;
var isGameOver = false;
let topY = 0;
let bottomY = 500;
var tick = 0;
var walls = []

var gridSize = 24;
var tileScale = 2;
var maxTileWidth = Math.ceil(mainWidth / gridSize);
var maxTileHeight = Math.ceil(mainHeight / gridSize);

var spawnTileX = Math.ceil(maxTileWidth / 2);
var spawnTileY = Math.ceil(maxTileHeight / 2);
var floorTileY = maxTileHeight;
var ceilingTileY = 0;
var minGap = 4 * gridSize;
var maxGap = 10 * gridSize;

var floorHeight = 0;
var ceilingHeight = 0;


class Game extends Phaser.Scene
{
    constructor()
    {
        super('Game');
    }

    level;

    lastCeiling;
    lastGround;

    createCoin(x, y)
    {
        var coin = coins.create(x, y, 'coin');
        coin.setVelocityX(0);
        coin.setScale(1.5);
        coin.setDepth(coinDepth);
        coin.setOrigin(0,0);
        return coin;
    }

    collectCoin(player, coin)
    {
        coin.setX(-20);
        score += 20;

        scoreText.setText('Score: ' + score);
    }

    createTile(x = 0, y = 0, width = 1, height = 1, sprite = 'wooden', group)
    {
        let realWidth = width * gridSize;
        let realHeight = height * gridSize;

        var obstacle = this.add.tileSprite(x, y, realWidth, realHeight, sprite).setScale(tileScale);
        group.add(obstacle);
        this.physics.add.existing(obstacle, false);

        let v = 0;
        //obstacle.body.setVelocityX(v);
        obstacle.setOrigin(0, 0);
        obstacle.displayWidth = realWidth;
        obstacle.displayHeight = realHeight;
        obstacle.setDepth(gameDepth);
        return obstacle;
    }

    createSpike(x = 0, y = 0, width = 1, height = 1)
    {
        let realWidth = width * gridSize;
        let realHeight = height * gridSize;
        let obstacle = spikes.create(x + 4 * 3, y + 4 * 3, 'spike').setScale(3);

        obstacle.displayWidth = realWidth;
        obstacle.displayHeight = realHeight;
        obstacle.setDepth(gameDepth);
        return obstacle;
    }

    init(data)
    {
        console.log(data);
        this.levelData = data;
        this.level = new Level(data.name, data.key, data.sprite, data.music, data.bg, this);
    }

    create()
    {
        let bg = this.add.image(400, 300, this.level.bg);
        bg.displayWidth = config.width;
        bg.displayHeight = config.height;
        gravity = config.physics.arcade.gravity.y;
        score = 0;
        isFlipped = false;
        isGameOver = false;

        ceilings = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        spikes = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        coins = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        player = this.physics.add.sprite(spawnTileX * gridSize, spawnTileY * gridSize, 'dog').setScale(2);
        fakePlayer = this.physics.add.sprite(spawnTileX * gridSize, spawnTileY * gridSize, 'dog').setScale(2);
        fakePlayer.visible = false;
        fakePlayer.setVelocityX(scrollSpeed);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('dog', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });

        player.anims.play('walk', true);

        //player.setBounce(0.2);
        //player.setCollideWorldBounds(true);

        this.physics.add.collider(player, ceilings);
        this.physics.add.collider(player, spikes, (p, s) => {
            this.level.unload();
            addCoins(score / 20);
            this.scene.start('GameOver', {
                score: score,
                coins: score / 20,
                completion: player.x / this.physics.world.bounds.width,
                levelData: this.levelData
            });
        });

        this.physics.add.overlap(player, coins, this.collectCoin, null, this);

        cursors = this.input.keyboard.createCursorKeys();
        gravityKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        //this.level = new Level(level3Name, level3key, castleKey, this);
        this.level.readLevelImage();

        this.cameras.main.setBounds(0, 0, (this.level.src.width) * gridSize, mainHeight);
        this.physics.world.setBounds(0, 0, (this.level.src.width) * gridSize, mainHeight);
        this.cameras.main.startFollow(fakePlayer);

        bg.setScrollFactor(0);

        // a level should be at least as long as the screen
        let buffer = 3;
        for (let i = 0; i < maxTileWidth + buffer; ++i)
        {
            this.drawNextColumn();
        }

        scoreText = this.add.text(16, 16, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
        });
        scoreText.setDepth(textDepth);
        scoreText.setScrollFactor(0);

        let soundConfig = {
            loop: true,
            volume: 1,
        };
        if (this.level.music != null)
        {
            this.sound.add(this.level.music, soundConfig);
        }
    }

    isColor(pixel, r = 0, g = 0, b = 0)
    {
        return pixel.b === b && pixel.r === r && pixel.g === g;
    }

    samePixel(pixel1, pixel2)
    {
        return pixel1.r == pixel2.r && pixel1.g == pixel2.g && pixel1.b == pixel2.b;
    }

    drawNextColumn()
    {
        if (this.level.isFinished()) return false;

        let column = this.level.readNext();
        let lastPixel = column[0];
        let count = 1;
        let y = 0;
        for (let i = 1; i < column.length; ++i)
        {
            let pixel = column[i];
            if (this.samePixel(pixel, lastPixel))
            {
                count++;
            }
            else
            {
                this.innerDraw(this.level.x, y, this.level.sprite, lastPixel, count);
                y += count * gridSize;
                count = 1; // why does this work
            }
            lastPixel = pixel;
        }
        if (count > 0)
        {
            this.innerDraw(this.level.x, y, this.level.sprite, lastPixel, count);
        }

        return true;
    }

    spikeUp(pixel) { return this.isColor(pixel, 255, 0, 0) };
    spikeDown(pixel) { return this.isColor(pixel, 200, 0, 0) };
    spikeRight(pixel) { return this.isColor(pixel, 150, 0, 0) };
    spikeLeft(pixel) { return this.isColor(pixel, 100, 0, 0) };

    innerDraw(x, y, sprite, pixel, count)
    {
        if (this.isColor(pixel, 0, 255, 0))
        {
            for (let i = 0; i < count; ++i)
            {
                this.createCoin(x, y + i * gridSize);
            }
        }

        else if (this.isColor(pixel, 0, 0, 255))
        {
            this.createTile(x, y, 1, count, sprite, ceilings);
        }

        else
        {
            for (let i = 0; i < count; ++i)
            {
                if (this.spikeUp(pixel))
                    this.createSpike(x, y + i * gridSize, 1, 1).body.setSize(8,4).setOffset(0,2);
                else if (this.spikeDown(pixel))
                    this.createSpike(x, y + i * gridSize, 1, 1).setFlipY(true).body.setSize(8,4).setOffset(0,2);
                else if (this.spikeLeft(pixel))
                    this.createSpike(x, y + i * gridSize, 1, 1).setAngle(270).body.setSize(4,8).setOffset(2,0);
                else if (this.spikeRight(pixel))
                    this.createSpike(x, y + i * gridSize, 1, 1).setAngle(90).body.setSize(4,8).setOffset(2,0);
            }
        }
    }

    update()
    {
        tick++;
        if (isGameOver) return;

        if (tick % 60 == 0)
        {
            console.log('object count = ', ceilings.children.entries.length);
        }

        if (cursors.left.isDown)
        {
            player.setVelocityX(-160);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);
        }
        else
        {
            player.setVelocityX(scrollSpeed);
        }

        if (Phaser.Input.Keyboard.JustDown(gravityKey))
        {
            if (isFlipped && player.body.touching.up)
            {
                this.physics.world.gravity.y = gravity;
                player.setFlipY(false);
                isFlipped = false;
            } 
            if (!isFlipped && player.body.touching.down)
            {
                this.physics.world.gravity.y = -gravity;
                player.setFlipY(true);
                isFlipped = true;
            }
        }

        // TODO refine this to be more accurate
        if (player.x <= this.cameras.main.worldView.x || player.y > mainHeight || player.y < 0)
        {
            this.level.unload();
            addCoins(score / 20);
            this.scene.start('GameOver', {
                score: score,
                coins: score / 20,
                completion: player.x / this.physics.world.bounds.width,
                levelData: this.levelData
            });
        }

        // TODO refine this to be more accurate
        if (player.x > this.physics.world.bounds.width)
        {
            this.level.unload();
            console.log('completion', player.x / this.physics.world.bounds.width);
            addCoins(score / 20);
            this.scene.start('LevelComplete', {
                score: score,
                coins: score / 20,
                name: this.level.name,
                levelData: this.levelData
            });
        }

        // remove all the vertical walls that have gone offscreen
        let deleteCount = 0;

        deleteCount = 0;
        for (var i = 0; i < ceilings.children.entries.length; ++i)
        {
            let child = ceilings.children.entries[i];
            if (child.x + child.displayWidth <= this.cameras.main.worldView.x)
            {
                deleteCount++;
                ceilings.children.entries.splice(i, 1);
                i--;
            }
        }

        // load the columns until the whole level is loaded
        this.drawNextColumn();

        // delete coins that go offscreen
        for (var i = 0; i < coins.children.entries.length; ++i)
        {
            let child = coins.children.entries[i];
            if (child.x + child.displayWidth <= this.cameras.main.worldView.x)
            {
                coins.children.entries.splice(i, 1);
                i--;
            }
        }

        if (this.level.music != null && !this.sound.get(this.level.music).isPlaying)
        {
            this.sound.get(this.level.music).play();
        }
    }
}
