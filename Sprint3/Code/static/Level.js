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

    constructor(name, image, sprite, scene)
    {
        this.name = name;
        this.image = image;
        this.scene = scene;
        this.src = scene.textures.get(this.image).getSourceImage();
        this.sprite = sprite;
    }

    readLevelImage()
    {
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
    }
}