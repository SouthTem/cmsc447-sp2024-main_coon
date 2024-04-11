//import { Scene } from 'phaser';

var player;

var platforms;
var obstacles;
var coins;

var score = 0;

var cursors;
var gravityKey;
var gravity;
var isFlipped = false;
var scrollSpeed = 100;
var isGameOver = false;
let topY = 0;
let bottomY = 500;
var tick = 0;

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
        return coin;
    }

    collectStar(player, star)
    {
        star.disableBody(true, true);

        score += 20;
        console.log(score);
    }

    createHorizontalPlatform(x, y, width)
    {
        var platform = platforms.create(x, y, 'ground');
        platform.setOrigin(0, 0);
        platform.setVelocityX(-scrollSpeed);
        platform.displayWidth = width;
        return platform;
    }

    createVerticalPlatform(x = 0, y = 0, widthMin = 25, widthMax = 50, heightMin = 100, heightMax = 200)
    {
        var height = Phaser.Math.Between(heightMin, heightMax);
        var width = Phaser.Math.Between(widthMin, widthMax);
        var obstacle = obstacles.create(x, y, 'ground').setVelocityX(-scrollSpeed);
        obstacle.setOrigin(0, 0);
        obstacle.displayWidth = width;
        obstacle.displayHeight = height;
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

        coins = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        this.createHorizontalPlatform(0, 0, 1200);
        this.createHorizontalPlatform(0, 500, 1200);

        player = this.physics.add.sprite(100, 450, 'dude').setFlipX(true);
        //player.setBounce(0.2);
        //player.setCollideWorldBounds(true);

        this.physics.add.collider(player, platforms);
        this.physics.add.collider(player, obstacles);

        this.physics.add.overlap(player, coins, this.collectStar, null, this);

        cursors = this.input.keyboard.createCursorKeys();
        gravityKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.cameras.main.setBounds(0, 0, 800, 600);
        this.physics.world.setBounds(0, 0, 800, 600);
        this.cameras.main.startFollow(player);

        

        this.createVerticalPlatforms(true, Phaser.Math.Between(0, 100));

        this.createVerticalPlatforms(false, 300 + Phaser.Math.Between(0, 100));
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
                platform = this.createVerticalPlatform(currWidth, topY, 50, 200, 100, 200).refreshBody();
            else
                platform = this.createVerticalPlatform(currWidth, bottomY, 50, 200, 50, 100).refreshBody().setOrigin(0,1);
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
        for (var i = 0; i < obstacles.children.entries.length; ++i)
        {
            let child = obstacles.children.entries[i];
            if (child.x <= -child.width)
            {
                deleteCount++;
                obstacles.children.entries.splice(i, 1);
                i--;
            }
        }

        // add in new vertical walls for each wall that was deleted
        for (var i = 0; i < deleteCount; ++i)
        {
            var offscreenX = config.width;
            var rand = Phaser.Math.Between(0, 1);
            if (rand === 1)
                this.createVerticalPlatform(offscreenX + Phaser.Math.Between(0, 50), topY, 50, 100, 100, 150);
            else
                this.createVerticalPlatform(offscreenX + Phaser.Math.Between(0, 50), bottomY, 50, 100, 100, 200).setOrigin(0,1);
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
