//import { Scene } from 'phaser';

var player;
var fakePlayer;

var coins;
var floors;
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

    create()
    {
        let bg = this.add.image(400, 300, 'sky');
        gravity = config.physics.arcade.gravity.y;
        score = 0;

        ceilings = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        floors = this.physics.add.group({
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
        this.physics.add.collider(player, floors);

        this.physics.add.overlap(player, coins, this.collectCoin, null, this);

        cursors = this.input.keyboard.createCursorKeys();
        gravityKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const src = this.textures.get('level1').getSourceImage();
        this.level = new Level(src);
        this.level.readLevelImage(this);

        this.cameras.main.setBounds(0, 0, (src.width - spawnTileX) * gridSize, mainHeight);
        this.physics.world.setBounds(0, 0, (src.width - spawnTileX) * gridSize, mainHeight);
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
                this.innerDraw(this.level.x, y, lastPixel, count);
                y += count * gridSize;
                count = 1; // why does this work
            }
            lastPixel = pixel;
        }
        if (count > 0)
        {
            this.innerDraw(this.level.x, y, lastPixel, count);
        }

        return true;
    }

    innerDraw(x, y, pixel, count)
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
            this.createTile(x, y, 1, count, 'wooden', ceilings);
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
        if (player.x <= this.cameras.main.worldView.x || player.y > 600)
        {
            this.level.unload(this);
            this.scene.start('GameOver');
        }

        // TODO refine this to be more accurate
        if (player.x > this.physics.world.bounds.width)
        {
            this.level.unload(this);
            this.scene.start('LevelComplete', {
                score: score,
                coins: score / 20,
                id: 1
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

        // when one column is deleted another should takes its place
        if (deleteCount > 0)
        {
            this.drawNextColumn();
        }

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
    }
}
