var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-div",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        MainMenu,
        GameOver,
    }
};

var game = new Phaser.Game(config);
var player;
var platforms;
var obstacles;
var cursors;
var gravityKey;
var gravity = 800;
var isFlipped = false;
var scrollSpeed = 100;
var isGameOver = false;

function preload ()
{
    this.load.setPath('static/Sprites');
    this.load.image('sky', 'sky.png');
    this.load.image('ground', 'platform.png');
    this.load.image('star', 'star.png');
    this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    obstacles = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    createHorizontalPlatform(0, 0, 1200);
    createHorizontalPlatform(0, 500, 1200);

    player = this.physics.add.sprite(100, 450, 'dude').setFlipX(true);
    player.setBounce(0.2);
    //player.setCollideWorldBounds(true);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, obstacles);

    cursors = this.input.keyboard.createCursorKeys();
    gravityKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.physics.world.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(player);

    createVerticalPlatform(200, 0).refreshBody();

    createVerticalPlatform(400, 500).refreshBody().setOrigin(1, 1);
}

function createHorizontalPlatform(x, y, width) {
    var platform = platforms.create(x, y, 'ground');
    platform.setOrigin(0, 0);
    platform.displayWidth = width;
    return platform;
}

function createVerticalPlatform(x, y) {
    var length = Phaser.Math.Between(100, 300);
    var obstacle = obstacles.create(x, y, 'ground');
    obstacle.setOrigin(0, 0);
    obstacle.displayWidth = 50;
    obstacle.displayHeight = length;
    return obstacle;
}

function update ()
{
    if(isGameOver) return;

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
        if (isFlipped)
        {
            this.physics.world.gravity.y = gravity;
            player.setFlipY(false);
        } else
        {
            this.physics.world.gravity.y = -gravity;
            player.setFlipY(true);
        }
        isFlipped = !isFlipped;
    }

    if(player.x <= 0 || player.y > 600) {
        this.scene.start('GameOver');
    }

    platforms.children.iterate(child => {
        child.setVelocityX(-scrollSpeed);
        
        if(child.x <= -child.width) {
            child.x += child.width;
        }
    });

    obstacles.children.iterate(child => {
        child.setVelocityX(-scrollSpeed);
        
        if(child.x <= -child.width) {
            child.x += child.width + config.width;
        }
    });
}

function gameOver() {
    isGameOver = true;
    player.setTint(0xff0000);
    game.scene.pause();
    alert("Game Over!");
}