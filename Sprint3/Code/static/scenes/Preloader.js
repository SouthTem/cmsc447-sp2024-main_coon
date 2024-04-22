//import { Scene } from 'phaser';

class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        let user = getUser();
        user.then(json => {
            console.log(json);
            let success = json.success;
            let name = json.name;

            if (success)
            {
                //alert(`you are logged in as ${name}`);
            }
            else
            {
              alert('you are not logged in. Redirecting to login page!');
              window.location.href = "/login_page";
            }
          });

        let centerX = config.width / 2;
        let centerY = config.height / 2;

        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(centerX, centerY, 'sky');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(centerX, centerY, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(centerX-230, centerY, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload()
    {
        this.load.setPath('static/Sprites');
        //this.load.image('sky', 'sky.png');
        this.load.image(woodenKey, 'Wooden.png');
        this.load.image(castleKey, 'Castle.png');
        this.load.image(spaceKey, 'Space.png');
        this.load.image('coin', 'Coin.png');
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
        this.load.image('ground', 'platform.png');
        this.load.spritesheet('dog', 'Dog.png', { frameWidth: 24, frameHeight: 18 });
        this.load.image('star', 'star.png');
        this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image(level1key, 'level1.png');
        this.load.image(level2key, 'level2.png');
        this.load.image(level3key, 'level3.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}