//import { Scene } from 'phaser';

var player;

var coins;
var floors;
var ceilings;

var score = 0;
var scoreText;

var gameDepth = 150;
var coinDepth = 100;
var textDepth = 200;

var cursors;
var gravityKey;
var gravity;
var isFlipped = false;
var scrollSpeed = 24 * 5;
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
var minGap = 3 * gridSize;
var maxGap = 10 * gridSize;

var floorHeight = 0;
var ceilingHeight = 0;


class Game extends Phaser.Scene
{
    constructor()
    {
        super('Game');
    }

    lastCeiling;
    lastGround;

    createCoin(x, y)
    {
        var coin = coins.create(x, y, 'coin');
        coin.setVelocityX(-scrollSpeed);
        coin.setScale(2);
        coin.setDepth(coinDepth);
        return coin;
    }

    collectStar(player, star)
    {
        star.disableBody(true, true);

        score += 20;
        console.log(score);

        scoreText.setText('Score: ' + score);
    }

    createRandomTile(sprite = 'wooden', group, x = 0, y = 0, widthMin = 1, widthMax = 3, heightMin = 1, heightMax = 4)
    {
        var height = Phaser.Math.Between(heightMin, heightMax);
        var width = Phaser.Math.Between(widthMin, widthMax);

        return this.createTile(x, y, width, height, sprite, group);
    }

    createTile(x = 0, y = 0, width = 1, height = 1, sprite = 'wooden', group)
    {
        let realWidth = width * gridSize;
        let realHeight = height * gridSize;

        var obstacle = this.add.tileSprite(x, y, realWidth, realHeight, sprite).setScale(tileScale);
        group.add(obstacle);
        this.physics.add.existing(obstacle, false);

        obstacle.body.setVelocityX(-scrollSpeed);
        obstacle.setOrigin(0, 0);
        obstacle.displayWidth = realWidth;
        obstacle.displayHeight = realHeight;
        obstacle.setDepth(gameDepth);
        return obstacle;
    }

    create()
    {
        this.add.image(400, 300, 'sky');
        gravity = config.physics.arcade.gravity.y;

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

        this.physics.add.overlap(player, coins, this.collectStar, null, this);

        cursors = this.input.keyboard.createCursorKeys();
        gravityKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.cameras.main.setBounds(0, 0, mainWidth, mainHeight);
        this.physics.world.setBounds(0, 0, mainWidth, mainHeight);
        this.cameras.main.startFollow(player);

        let offscreenBuffer = 3;
        for(var i = 0; i < maxTileWidth + offscreenBuffer; ++i)
        {
            this.createGround('wooden', i * gridSize, 1, 1, 10, 10);
            this.createCeiling('wooden', i * gridSize, 1, 1, 5, 5);
        }

        scoreText = this.add.text(16, 16, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
        });
        scoreText.setDepth(textDepth);
    }

    createBetterGround(sprite = 'wooden')
    {
        let previousWidth = this.lastGround.displayWidth;
        let previousHeight = this.lastGround.displayHeight;
        let prevX = this.lastGround.body.x;
        let prevY = this.lastGround.body.y;

        let randomNumber = Phaser.Math.Between(0, 100);

        let x = prevX + previousWidth;
        let y = prevY + previousHeight;
        let width = 1;
        let height = previousHeight / gridSize;

        let groundPos = this.lastGround.body.y;
        let ceilingPos = this.lastCeiling.body.y + this.lastCeiling.displayHeight;
        let currentGap = groundPos - ceilingPos;

        if (randomNumber > 60)
        {
            let variance = Phaser.Math.Between(-1,1);
            height = previousHeight / gridSize + variance;
            
            let calcGap = currentGap - variance * gridSize;

            if (calcGap < minGap)
            {
                height = previousHeight / gridSize;
            }

            height = Phaser.Math.Clamp(height, 1, 100);
        }

        this.lastGround = this.createTile(x, y, width, height, sprite, floors).setOrigin(0,1);
    }

    createGround(sprite = 'wooden', x = 0, minWidth = 1, maxWidth = 1, minHeight = 1, maxHeight = 10)
    {
        this.lastGround = this.createRandomTile(sprite, floors, x, floorTileY * gridSize, minWidth, maxWidth, minHeight, maxHeight).setOrigin(0, 1);
    }

    createBetterCeiling(sprite = 'wooden')
    {
        let previousWidth = this.lastCeiling.displayWidth;
        let previousHeight = this.lastCeiling.displayHeight;
        let prevX = this.lastCeiling.body.x;
        let prevY = this.lastCeiling.body.y;

        let randomNumber = Phaser.Math.Between(0, 100);

        let x = prevX + previousWidth;
        let y = prevY;
        let width = 1;
        let height = previousHeight / gridSize;

        let groundPos = this.lastGround.body.y;
        let ceilingPos = this.lastCeiling.body.y + this.lastCeiling.displayHeight;
        let currentGap = groundPos - ceilingPos;

        if (randomNumber > 60)
        {
            let variance = Phaser.Math.Between(-1,1);
            height = previousHeight / gridSize + variance;
            let calcGap = currentGap - variance * gridSize;

            if (calcGap < minGap)
            {
                height = previousHeight / gridSize;
            }
            height = Phaser.Math.Clamp(height, 1, 100);
        }

        this.lastCeiling = this.createTile(x, y, width, height, sprite, ceilings).setOrigin(0,0);
    }


    createCeiling(sprite = 'wooden', x = 0, minWidth = 1, maxWidth = 1, minHeight = 1, maxHeight = 10)
    {
        this.lastCeiling = this.createRandomTile(sprite, ceilings, x, ceilingTileY * gridSize, minWidth, maxWidth, minHeight, maxHeight);
    }

    update()
    {
        tick++;
        if (isGameOver) return;

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
            player.setVelocityX(0);
        }

        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }

        if (Phaser.Input.Keyboard.JustDown(gravityKey))
        {
            if (isFlipped && player.body.touching.up)
            {
                this.physics.world.gravity.y = gravity;
                player.setFlipY(false);
                isFlipped = !isFlipped;
            } else if (player.body.touching.down)
            {
                this.physics.world.gravity.y = -gravity;
                player.setFlipY(true);
                isFlipped = !isFlipped;
            }
            
        }

        if (player.x <= 0 || player.y > 600)
        {
            this.scene.start('GameOver');
        }

        // spawn coins every 2ish seconds
        if (tick % 120 == 0)
        {
            var coinX = Phaser.Math.Between(config.width, config.width + 200);
            var coinY = Phaser.Math.Between(100, 400);
            this.createCoin(coinX, coinY);
        }

        // remove all the vertical walls that have gone offscreen
        let deleteCount = 0;
        let posX = 0;
        
        for (var i = 0; i < floors.children.entries.length; ++i)
        {
            let child = floors.children.entries[i];
            if (child.x <= -child.displayWidth)
            {
                posX = child.x;
                deleteCount++;
                floors.children.entries.splice(i, 1);
                i--;
            }
        }

        // add in new vertical walls for each wall that was deleted
        for (var i = 0; i < deleteCount; ++i)
        {
            this.createBetterGround('wooden');
            //this.createGround('wooden', this.lastGround.body.x + this.lastGround.displayWidth);
        }

        deleteCount = 0;
        for (var i = 0; i < ceilings.children.entries.length; ++i)
        {
            let child = ceilings.children.entries[i];
            if (child.x <= -child.displayWidth)
            {
                posX = Math.ceil(child.x / gridSize);
                deleteCount++;
                ceilings.children.entries.splice(i, 1);
                i--;
            }
        }

        // add in new vertical walls for each wall that was deleted
        for (var i = 0; i < deleteCount; ++i)
        {
            console.log(posX);
            this.createBetterCeiling('wooden');
        }

        // delete coins that go offscreen
        for (var i = 0; i < coins.children.entries.length; ++i)
        {
            let child = coins.children.entries[i];
            if (child.x <= -20)
            {
                coins.children.entries.splice(i, 1);
                i--;
            }
        }
    }
}
