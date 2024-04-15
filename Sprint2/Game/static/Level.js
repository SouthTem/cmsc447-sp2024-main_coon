class Level
{
    #src;
    index = 0;
    data;

    constructor(src)
    {
        this.#src = src;
    }

    readLevelImage(scene)
    {
        const canvas = scene.textures.createCanvas('map', this.#src.width, this.#src.height).draw(0,0,this.#src);

        const pixel = new Phaser.Display.Color();
        let count = 0;
        let data = []
        for (let i = 0; i < this.#src.width; ++i)
        {
            data[i] = []
            for (let j = 0; j < this.#src.height; ++j)
            {
                canvas.getPixel(j, i, pixel);
                data[i][j] = pixel;
            }
        }
        this.data = data;
        console.log('level data', this.data);
    }

    isFinished()
    {
        return this.index == this.#src.width;
    }

    readNext()
    {
        let column = this.data[this.index];
        this.index++;
        return column;
    }
}