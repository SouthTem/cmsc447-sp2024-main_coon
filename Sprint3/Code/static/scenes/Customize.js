const skin1 = {
    name: "Skin 1",
    sprite: "Dog",
    cost: 100,
    obtained: true,
    equipped: false,
};

const skin2 = {
    name: "Skin 2",
    sprite: "Dog_White",
    cost: 100,
    obtained: false,
    equipped: false,
};

const skin3 = {
    name: "Skin 3",
    sprite: "Dog_Gold",
    cost: 100,
    obtained: false,
    equipped: false,
};

const skinArray = [skin1, skin2, skin3];

const cape1 = {
    name: "Cape 1",
    sprite: "Cape_Blue",
    cost: 100,
    obtained: false,
    equipped: false,
};

const cape2 = {
    name: "Cape 2",
    sprite: "Cape_Red",
    cost: 100,
    obtained: false,
    equipped: false,
};

const cape3 = {
    name: "Cape 3",
    sprite: "Cape_Pink",
    cost: 100,
    obtained: false,
    equipped: false,
};

const capesArray = [cape1, cape2, cape3];

const hat1 = {
    name: "Hat 1",
    sprite: "Hat_Halo",
    cost: 100,
    obtained: false,
    equipped: false,
};

const hat2 = {
    name: "Hat 2",
    sprite: "Hat_Cap",
    cost: 100,
    obtained: false,
    equipped: false,
};

const hat3 = {
    name: "Hat 3",
    sprite: "Hat_Top",
    cost: 100,
    obtained: false,
    equipped: false,
};

const hatsArray = [hat1, hat2, hat3];

class Customize extends Phaser.Scene
{
    constructor()
    {
        super('Customize');
    }

    init(data)
    {
        this.skinButtons = [];
        this.capeButtons = [];
        this.hatButtons = [];
        this.coins = data.coins;
    }

    create()
    {
        let centerX = config.width / 2;
        let centerY = config.height / 2;

        this.add.image(centerX, centerY, 'background');

        this.add.image(20, 20, 'coin').setOrigin(0, 0).setScale(2);
        this.coinText = this.createCost(20 + 40, 20, "").setOrigin(0, 0);

        const homeButton = this.add.sprite(config.width - 10, 0 + 10, 'menu_house').setOrigin(1, 0).setScale(2);
        homeButton.setScrollFactor(0);

        homeButton.setInteractive();
        homeButton.on('pointerover', () => {
            homeButton.setTint("0xffff00");
        });
        homeButton.on('pointerout', () => {
            homeButton.setTint("0xffffff");
        });

        homeButton.setInteractive();
        homeButton.on("pointerup", () =>
        {
            this?.scene?.start("MainMenu");
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
        for (let i = 0; i < skinArray.length; ++i)
        {
            let curr = skinArray[i];
            let button = new Button(this, startX + i * gapX, skinsText.y + yPadding, curr)
            this.skinButtons.push(this.createButtonFunctional(button, skinArray));
        }

        const capesText = this.add.text(100, 275, "Capes", {
            fontFamily: 'Arial Black', fontSize: fontSize, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        for (let i = 0; i < capesArray.length; ++i)
        {
            let curr = capesArray[i];
            let button = new Button(this, startX + i * gapX, capesText.y + yPadding, curr)
            this.skinButtons.push(this.createButtonFunctional(button, capesArray));
        }

        const hatsText = this.add.text(100, 450, "Hats", {
            fontFamily: 'Arial Black', fontSize: fontSize, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        for (let i = 0; i < hatsArray.length; ++i)
        {
            let curr = hatsArray[i];
            let button = new Button(this, startX + i * gapX, hatsText.y + yPadding, curr)
            this.skinButtons.push(this.createButtonFunctional(button, hatsArray));
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

    createButtonFunctional(button, array = skinArray)
    {
        button.clickAction = () =>
        {
            if (!button.data.obtained)
            {
                if (this.coins < button.data.cost) return;

                this.coins -= button.data.cost;
                addCoins(-button.data.cost);
                button.data.obtained = true;
            }

            button.data.equipped = array == skinArray ? true : !button.data.equipped;
            for (let i = 0; i < array.length; ++i)
            {
                if (button.data == array[i]) continue;

                array[i].equipped = false;
            }

            changeOutfit(array);
        };

        return button;
    }

    update()
    {
        //console.log(this.coins);
        this.coinText.setText(`${this.coins < 0 ? "" : this.coins}`);

        for (let i = 0; i < this.skinButtons.length; ++i)
        {
            let curr = this.skinButtons[i];
            curr.update();
        }
    }
}

class Button
{
    constructor(scene, x, y, data = skin1)
    {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.data = data;
        this.clickAction = () => { };
        this.create();
    }

    create()
    {
        this.button = this.createButton();
        this.cost = this.createCost();
    }

    createButton()
    {
        let color = "0xbbbbbb";
        const rect = this.scene.add.rectangle(this.x, this.y, 24 * 3, 24 * 3, color);

        this.scene.add.image(this.x, this.y, this.data.sprite).setScale(2);
        rect.setInteractive();
        rect.on("pointerup", () =>
        {
            this.clickAction();
        });

        rect.on("pointerover", () =>
        {
            rect.fillColor = '0xffff00';
        });

        rect.on("pointerout", () =>
        {
            rect.fillColor = color;
        });


        return rect;
    }

    createCost()
    {
        let x = this.x;
        let y = this.y + 50;
        const skinsText = this.scene.add.text(x, y, `${this.data.cost}`, {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        return skinsText;
    }

    update()
    {
        let costText = this.data.equipped ? "Equipped" : this.data.obtained ? "Owned" : this.data.cost;
        this.cost?.setText(costText);

        if (this.data.equipped)
        {
            this.button?.setStrokeStyle(4, "0xffffff");
        }
        else
        {
            this.button?.setStrokeStyle(0, "0xffffff");
        }
    }
}
