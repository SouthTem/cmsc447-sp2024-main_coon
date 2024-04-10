import { Scene } from 'phaser';

let player;
let cursors;
let platforms;
let lastPlatformX = 0;
let lastJumpPosition = { x: 0, y: 0 };

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        platforms = this.physics.add.staticGroup();
        this.createInitialPlatforms();

        player = this.physics.add.sprite(400, 300, 'dude'); // Start in the middle
        player.setBounce(0.2);
        player.setCollideWorldBounds(false); // Disable world bounds collision for smoother movement

        // Set camera bounds manually to cover the entire game world
        this.cameras.main.setBounds(0, 0, 10000, 768);

        this.cameras.main.startFollow(player, true, 0.05, 0.05); // Follow the player with a slight delay

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        player.body.setGravityY(300);
        this.physics.add.collider(player, platforms);

        cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (player.y > 1024 || player.x < 0) {
            this.scene.start('GameOver');

        }

        if (player.y <= 0) {
            player.setPosition(player.x, this.cameras.main.worldView.height - 1);
        } else if (player.y >= this.cameras.main.worldView.height) {
            player.setPosition(player.x, 1);
        }

        if (player.x > lastPlatformX + 150) {
            this.createPlatformAtRight();
            lastPlatformX = player.x;
        }

        if (cursors && cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        } else if (cursors && cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors && cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-500);
            lastJumpPosition.x = player.x;
            lastJumpPosition.y = player.y;
        } else if (cursors && cursors.space.isDown && player.body.touching.down) {
            player.setVelocityY(-500);
            lastJumpPosition.x = player.x;
            lastJumpPosition.y = player.y;
        }
    }

    createInitialPlatforms() {
        for (let i = 0; i < 5; i++) {
            const x = 300 * i; // Spacing for horizontal movement
            const y = Phaser.Math.Between(250, 550);
            platforms.create(x, y, 'ground');
            lastPlatformX = x;
        }
    }

    createPlatformAtRight() {
        const x = lastPlatformX + Phaser.Math.Between(150, 300);
        const y = Phaser.Math.Between(250, 550);
        platforms.create(x, y, 'ground');
        lastPlatformX = x;
    }
}
