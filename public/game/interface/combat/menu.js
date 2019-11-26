const MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.Text,

  initialize: function MenuItem(x, y, text, scene) {
    Phaser.GameObjects.Text.call(this, scene, x, y, text, {
      color: "#ffffff",
      align: "left",
      fontSize: 15
    });
  },

  select: function() {
    this.setColor("#f8ff38");
  },

  deselect: function() {
    this.setColor("#ffffff");
  },
  // when the associated enemy or player unit is killed
  unitKilled: function() {
    this.active = false;
    this.visible = false;
  }
});

// base menu class, container for menu items
const Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Menu(x, y, scene, heroes) {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    this.menuItems = [];
    this.menuItemIndex = 0;
    this.x = x;
    this.y = y;
    this.selected = false;
  },
  addMenuItem: function(unit) {
    const menuItem = new MenuItem(
      0,
      this.menuItems.length * 20,
      unit,
      this.scene
    );
    this.menuItems.push(menuItem);
    this.add(menuItem);
    return menuItem;
  },
  // menu navigation
  moveSelectionUp: function() {
    this.menuItems[this.menuItemIndex].deselect();
    do {
      this.menuItemIndex--;
      if (this.menuItemIndex < 0)
        this.menuItemIndex = this.menuItems.length - 1;
    } while (!this.menuItems[this.menuItemIndex].active);
    this.menuItems[this.menuItemIndex].select();
  },
  moveSelectionDown: function() {
    this.menuItems[this.menuItemIndex].deselect();
    do {
      this.menuItemIndex++;
      if (this.menuItemIndex >= this.menuItems.length) this.menuItemIndex = 0;
    } while (!this.menuItems[this.menuItemIndex].active);
    this.menuItems[this.menuItemIndex].select();
  },
  // select the menu as a whole and highlight the choosen element
  select: function(index) {
    if (!index) index = 0;
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = index;
    while (!this.menuItems[this.menuItemIndex].active) {
      this.menuItemIndex++;
      if (this.menuItemIndex >= this.menuItems.length) this.menuItemIndex = 0;
      if (this.menuItemIndex == index) return;
    }
    this.menuItems[this.menuItemIndex].select();
    this.selected = true;
  },
  // deselect this menu
  deselect: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = 0;
    this.selected = false;
  },
  confirm: function() {
    // when the player confirms his slection, do the action
  },
  // clear menu and remove all menu items
  clear: function() {
    for (let i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].destroy();
    }
    this.menuItems.length = 0;
    this.menuItemIndex = 0;
  },
  // recreate the menu items
  remap: function(units) {
    this.clear();
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      unit.setMenuItem(this.addMenuItem(unit.type));
    }
    this.menuItemIndex = 0;
  }
});

const HeroesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function HeroesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  }
});

const ActionsMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function ActionsMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
    this.addMenuItem("Attack");
  },
  confirm: function() {
    // we select an action and go to the next menu and choose from the enemies to apply the action
    this.scene.events.emit("SelectedAction");
  }
});

const EnemiesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function EnemiesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  },
  confirm: function() {
    // the player has selected the enemy and we send its id with the event
    this.scene.events.emit("Enemy", this.menuItemIndex);
  }
});
