class Level
{
    src;
    index = 0;
    x = 0;
    y = 0;
    tileSize = 24;
    data;

    constructor(src)
    {
        this.src = src;
    }

    readLevelImage(scene)
    {
        const canvas = scene.textures.createCanvas('map', this.src.width, this.src.height).draw(0,0,this.src);

        let count = 0;
        let data = []
        for (let i = 0; i < this.src.width; ++i)
        {
            data[i] = []
            for (let j = 0; j < this.src.height; ++j)
            {
                let pixel = new Phaser.Display.Color();
                pixel.red
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
}