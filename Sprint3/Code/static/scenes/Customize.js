class Customize extends Phaser.Scene
{
    constructor ()
    {
        super('Customize');
    }

    coins = -1;

    init(data)
    {
        this.getCoinsFromDatabase();
    }

    getCoinsFromDatabase()
    {
        let user = getUser();
        user.then(json => {
            console.log(json);
            let success = json.success;
            let name = json.name;
            let coins = json.coins;

            if (success)
            {
                this.coins = coins;
            }
            else
            {
              alert('you are not logged in. Redirecting to login page!');
              window.location.href = "/login_page";
            }
          });
    }

    create ()
    {
        let centerX = config.width / 2;
        let centerY = config.height / 2;

        this.add.image(centerX, centerY, 'background');

        this.add.image(20, 20, 'coin').setOrigin(0, 0).setScale(2);
        this.coinText = this.createCost(20 + 40, 20, "").setOrigin(0, 0);

        const homeRect = this.add.rectangle(config.width - 10, 0 + 10, 50, 50, '#ffffff').setOrigin(1, 0);

        homeRect.setInteractive();
        homeRect.on("pointerup", () => {
            this.scene.start("MainMenu");
        });

        let fontSize = 24;
        let yPadding = 75;

        const skinsText = this.add.text(100, 100, "Skins", {
            fontFamily: 'Arial Black', fontSize: fontSize, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        let startX = 150;
        let gapX = 150;
        for (let i = 0; i < 3; ++i)
        {
            this.createButton(startX + i * gapX, skinsText.y + yPadding, () => {});
            this.createCost(startX + i * gapX, skinsText.y + yPadding + 50, 1500);
        }

        const capesText = this.add.text(100, 275, "Capes", {
            fontFamily: 'Arial Black', fontSize: fontSize, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        for (let i = 0; i < 3; ++i)
        {
            this.createButton(startX + i * gapX, capesText.y + yPadding, () => {});
            this.createCost(startX + i * gapX, capesText.y + yPadding + 50, 100);
        }

        const hatsText = this.add.text(100, 450, "Hats", {
            fontFamily: 'Arial Black', fontSize: fontSize, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        for (let i = 0; i < 3; ++i)
        {
            this.createButton(startX + i * gapX, hatsText.y + yPadding, () => {});
            this.createCost(startX + i * gapX, hatsText.y + yPadding + 50, '300');
        }
    }

    createCost(x, y, cost)
    {
        const skinsText = this.add.text(x, y, `${cost}`, {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        return skinsText;
    }

    createButton(x, y, clickAction)
    {
        let color = "0xbbbbbb";
        const rect = this.add.rectangle(x, y, 24 * 3, 24 * 3, color);

        this.add.image(x, y, 'dog').setScale(2);
        rect.setInteractive();
        rect.on("pointerup", () => {
            clickAction();
            
            // use this for if the item is equipped or not
            rect.setStrokeStyle(4, "0xffffff");
        });

        rect.on("pointerover", () =>{
            rect.fillColor = '0xffff00';
        });

        rect.on("pointerout", () =>{
            rect.fillColor = color;
        });


        return rect;
    }

    update()
    {
        //console.log(this.coins);
        this.coinText.setText(`${this.coins < 0 ? "" : this.coins}`);
    }
}
