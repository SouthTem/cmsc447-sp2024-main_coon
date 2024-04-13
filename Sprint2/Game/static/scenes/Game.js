//import { Scene } from 'phaser';

var player;

var platforms;
var obstacles;
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
var scrollSpeed = 100;
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



class Game extends Phaser.Scene
{
    constructor()
    {
        super('Game');
    }

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

    createHorizontalPlatform(x, y, width, sprite = 'wooden')
    {
        var platform = platforms.create(x, y, sprite);
        platform.setOrigin(0, 0);
        platform.setVelocityX(-scrollSpeed);
        platform.displayWidth = width;
        platform.setDepth(gameDepth);
        return platform;
    }

    // clean this up and define a grid so that tiles look good
    createVerticalPlatform(x = 0, y = 0, widthMin = 25, widthMax = 50, heightMin = 100, heightMax = 200)
    {
        var height = Phaser.Math.Between(heightMin, heightMax);
        var width = Phaser.Math.Between(widthMin, widthMax);
        //var obstacle = obstacles.create(x, y, 'wooden').setVelocityX(-scrollSpeed);
        var obstacle = this.add.tileSprite(x, y, width, height, 'wooden').setScale(2);
        obstacles.add(obstacle);
        this.physics.add.existing(obstacle, false);

        //block.body.setVelocity(-scrollSpeed, 0);
        obstacle.body.setVelocityX(-scrollSpeed);
        obstacle.setOrigin(0, 0);
        obstacle.displayWidth = width;
        obstacle.displayHeight = height;
        obstacle.setDepth(gameDepth);
        return obstacle;
    }

    createRandomObstacle(sprite = 'wooden', group, gridX = 0, gridY = 0, widthMin = 1, widthMax = 3, heightMin = 1, heightMax = 4)
    {
        var height = Phaser.Math.Between(heightMin, heightMax);
        var width = Phaser.Math.Between(widthMin, widthMax);

        return this.createTile(gridX, gridY, width, height, sprite, group);
    }

    createTile(gridX = 0, gridY = 0, width = 1, height = 1, sprite = 'wooden', group)
    {
        let x = gridX * gridSize;
        let y = gridY * gridSize;
        let realWidth = width * gridSize;
        let realHeight = height * gridSize;

        console.log(x, y, width, height)

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

        platforms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        obstacles = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

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

        console.log(coins);

        //this.createHorizontalPlatform(0, 0, 1200);
        //this.createHorizontalPlatform(0, 500, 1200);

        player = this.physics.add.sprite(spawnTileX * gridSize, spawnTileY * gridSize, 'dude').setFlipX(true);
        //player.setBounce(0.2);
        //player.setCollideWorldBounds(true);
        //this.physics.add.existing(block, true);

        this.physics.add.collider(player, platforms);
        this.physics.add.collider(player, obstacles);
        this.physics.add.collider(player, ceilings);
        this.physics.add.collider(player, floors);

        this.physics.add.overlap(player, coins, this.collectStar, null, this);

        cursors = this.input.keyboard.createCursorKeys();
        gravityKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.cameras.main.setBounds(0, 0, mainWidth, mainHeight);
        this.physics.world.setBounds(0, 0, mainWidth, mainHeight);
        this.cameras.main.startFollow(player);

        for(var i = 0; i < maxTileWidth; ++i)
        {
            this.createGround('wooden', i);
            this.createCeiling('wooden', i);
        }

        //this.createVerticalPlatforms(true, Phaser.Math.Between(0, 100));

        //this.createVerticalPlatforms(false, 300 + Phaser.Math.Between(0, 100));

        //scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        scoreText = this.add.text(16, 16, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
        });
        scoreText.setDepth(textDepth);
    }

    createGround(sprite = 'wooden', gridX = 0)
    {
        this.createRandomObstacle(sprite, floors, gridX, floorTileY, 1, 1, 1, 10).setOrigin(0, 1);
    }

    createCeiling(sprite = 'wooden', gridX = 0)
    {
        this.createRandomObstacle(sprite, ceilings, gridX, ceilingTileY, 1, 1, 1, 8);
    }

    createVerticalPlatforms(top=true, startX=0)
    {
        let maxWidth = config.width;
        let maxHeight = config.height;
        

        let currWidth = startX;
        while (currWidth < maxWidth)
        {
            var platform;
            if (top) 
                platform = this.createVerticalPlatform(currWidth, topY, 50, 200, 100, 200)//.refreshBody();
            else
                platform = this.createVerticalPlatform(currWidth, bottomY, 50, 200, 50, 100).setOrigin(0,1);
            currWidth += platform.displayWidth + Phaser.Math.Between(-50, 50);
        }
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

        // move the ceiling and floor platforms to keep them on scren
        platforms.children.iterate(child =>
        {
            if (child.x <= -child.width)
            {
                child.x += child.width;
            }
        });

        // remove all the vertical walls that have gone offscreen
        let deleteCount = 0;
        let posX = 0;
        
        for (var i = 0; i < floors.children.entries.length; ++i)
        {
            let child = floors.children.entries[i];
            if (child.x <= -child.displayWidth)
            {
                posX = Math.ceil(child.x / gridSize);
                deleteCount++;
                floors.children.entries.splice(i, 1);
                i--;
            }
        }

        // add in new vertical walls for each wall that was deleted
        for (var i = 0; i < deleteCount; ++i)
        {
            this.createGround('wooden', posX + maxTileWidth);
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
            this.createCeiling('wooden', posX + maxTileWidth);
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
