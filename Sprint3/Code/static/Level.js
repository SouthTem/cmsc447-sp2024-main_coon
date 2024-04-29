const key = 'map';

class Level
{
    
    index = 0;
    x = 0;
    y = 0;
    tileSize = 24;

    src;
    data;

    name;
    image;
    scene;
    sprite;
    bg;
    music;

    constructor(name, image, sprite, speed, music = null, bg, scene)
    {
        this.name = name;
        this.image = image;
        this.scene = scene;
        this.src = scene.textures.get(this.image).getSourceImage();
        this.sprite = sprite;
        this.music = music;
        this.bg = bg;
        this.speed = speed;
    }

    readLevelImage()
    {
        // this line prevents a crash when spamming the play button immediately on load.
        // there has got to be a better solution, but this works for now.
        this.scene.textures.removeKey(key);

        const canvas = this.scene.textures.createCanvas(key, this.src.width, this.src.height).draw(0,0,this.src);

        let count = 0;
        let data = []
        for (let i = 0; i < this.src.width; ++i)
        {
            data[i] = []
            for (let j = 0; j < this.src.height; ++j)
            {
                let pixel = new Phaser.Display.Color();
                canvas.getPixel(i, j, pixel);
                data[i][j] = pixel;
            }
        }
        this.data = data;
    }

    isFinished()
    {
        return this.index == this.src.width;
    }

    readNext()
    {
        let column = this.data[this.index];
        this.index++;
        this.x += this.tileSize;
        return column;
    }

    unload()
    {
        this.scene.textures.remove(key);
        
        if (this.music != null)
        {
            this.scene.sound.get(this.music).stop();    
        }
    }
}