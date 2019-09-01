canvasWidth = 900;
canvasHeight = 400;
Crafty.init(canvasWidth, canvasHeight, 'main');
canvas = document.getElementById('main');
tableY = 200;
tableX = 20;
width = 600;
height = 400;
tableNum = 0;
lineHeight = 5;
unitGap = 3;
bottomBarHeight = 90;
cardHeight = 150;
cardWidth = 80;
attackdeltax = 5;
attackdeltay = 140;
endButtonWidth = 50;
endButtonHeight = 50;
namedeltax = 5;
namedeltay = 5;
manadeltax = 70;
fieldHeight = 5;
fieldWidth = 7;
fieldCellHeight = (height - bottomBarHeight) / fieldHeight;
fieldCellWidth = (width - endButtonWidth) / fieldWidth;
unitWidth = fieldCellWidth - 10;
unitHeight = fieldCellHeight - 10;
manadeltay = namedeltay;
hpdeltax = 70;
hpdeltay = attackdeltay;
yourDeltaY = 7;
abilitiesDeltaXUnit = 35;
abilitiesDeltaYUnit = yourDeltaY;
cardRowY = height - bottomBarHeight;
mouseX = 0;
mouseY = 0;
mouseXUnit = 0;
mouseYUnit = 0;
cardDeltaX = 85;
playerIdGlobal = 0;
isYourTurn = true;
var readyState = true;
var securityValue = 0;
var sendData = {};
var int = 0;

var allCards = [
    {name: 'bab', attack: 1, cost: 2, health: 1, abilities: '', id: 0},
    {name: 'ban', attack: 4, cost: 2, health: 3, abilities: '', id: 1},
    {name: 'bak', attack: 5, cost: 2, health: 5, abilities: 'r', id: 2},
    {name: 'bat', attack: 1, cost: 2, health: 2, abilities: 'rs', id: 3},
    {name: 'foo', attack: 8, cost: 8, health: 8, abilities: 'i', id: 4},
    {name: 'bar', attack: 1, cost: 2, health: 1, abilities: '', id: 5},
    {name: 'baz', attack: 1, cost: 2, health: 3, abilities: 'rsi', id: 6},
    {name: 'bank', attack: 1, cost: 2, health: 3, abilities: '', id: 7},
    {name: 'basta', attack: 3, cost: 2, health: 3, abilities: '', id: 8},
]


var cards = [new cardObject('Duke', 3, 2, 2, 'rs')]
for (var i = 1; i < 10; i++)
    cards.push(new cardObject('Unit', 1, i, i, ''))

/*
  abilities list:
    r - rush     - unit can move during the first move
    s - speed    - unit can move for a distance of 2 fields in one turn
    d - distance - unit can attack enemies within distance of 2 fields without getting
                   damage from the opponent
*/

function randInt(n) {
    return Math.trunc(Math.random() * n);
}

var shuffle = function (array) {

    var currentIndex = array.length;
    var temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
};

function line(x1, y1, x2, y2, color, width) {
    console.log('line ' + [x1, y1, x2, y2])
    if (x2 >= x1) {
        let dy = y2 - y1;
        let dx = x2 - x1;
        console.log('dx: ' + dx);
        console.log('dy: ' + dy);

        let rot = Math.atan(dy / dx) / Math.PI * 180;
        console.log('rot: ' + rot);

        let rectWidth = Math.sqrt(dx * dx + dy * dy);
        console.log('width: ' + rectWidth);

        let t = x2;
        y2 = x2;
        x2 = t;

        let line = Crafty.e('2D, Canvas, Color')
            .attr({
                x: x1,
                y: y1,
                h: 5,
                w: rectWidth,
                rotation: rot,
            })
            .color('grey')
        setTimeout(() => {
            line.x -= 1000;
        }, 1000)
    } else {
        line(x2, y2, x1, y1, color, width);
    }

};

function arrow(x1, y1, x2, y2) {
    console.log('arrow is drawn')
    x1 *= fieldCellWidth;
    y1 *= fieldCellHeight;
    x1 += fieldCellWidth / 2;
    y1 += fieldCellHeight / 2;
    x2 *= fieldCellWidth;
    y2 *= fieldCellHeight;
    x2 += fieldCellWidth / 2;
    y2 += fieldCellHeight / 2;
    let l = line(x1, y1, x2, y2, 'grey', 5)
    console.log(l)
}

socket.on('moveArrow', data => {
    console.log('move arrow data: ');
    console.log(data);
    arrow(fieldWidth - 1 - data.moveData[3], fieldHeight - 1 - data.moveData[2], fieldWidth - 1 - data.moveData[1], fieldHeight - 1 - data.moveData[0])
    console.log(data)
})

function cardObject(name, attack, health, cost, abilities) {
    this.attack = attack;
    this.health = health;
    this.cost = cost;
    this.name = name;
    this.abilities = abilities;
    this.repr = function () {
        return this.attack + ' ' + this.health + ' ' + this.cost + ' ' + this.name;
    }
    return this;
}

function setCorrectNumbers() {
    for (let i = 0; i < game.hand.length; i++)
        game.hand[i].num = i;
}

function card(xpos, ypos, cobj, num) { // карта
    var x = 0;
    var y = 0;
    abilities = cobj.abilities;

    this.rect = Crafty.e("2D, Canvas, Color, Mouse, Draggable")
        .attr({x: xpos, y: ypos, w: cardWidth, h: cardHeight})
        .color("orange")
        .bind('MouseUp', function (MouseEvent) {
            // выкладывание карты на стол
            console.log('mouse up')
            if ((!isYourTurn) || (!readyState) || ((mouseY > height - bottomBarHeight)
                || (!canPut(mouseYUnit, mouseXUnit, playerIdGlobal))
                || (cobj.cost > game.currentMana))) {
                this.x = xpos;
                console.log('go back')
                x = xpos;
                this.y = ypos;
                game.hand.forEach(function (a) {
                    console.log(a);
                    a.putBack()
                })
            } else {
                console.log('putted');
                game.currentMana -= cobj.cost;
                game.showMana();
                //game.hand.pop(this.num)
                game.moveCards(this.num);
                setCorrectNumbers();
                addUnit(cobj, mouseXUnit, mouseYUnit);
                this.x = -width;
            }
        });
    this.rect.putBack = function () {
        this.x = xpos;
        console.log('go back')
        x = xpos;
        this.y = ypos;
    }
    this.rect.decXpos = function (n) {
        xpos -= n;
    }
    text = Crafty.e("2D, Canvas, Text")
        .attr({x: xpos + 5, y: ypos + 5})
        .text(cobj.name);
    abilitiestext = Crafty.e("2D, Canvas, Text")
        .attr({x: xpos + 5, y: ypos + 18})
        .text(cobj.abilities);
    attacktext = Crafty.e("2D, Canvas, Text")
        .attr({x: xpos + 5, y: ypos + 5})
        .text(cobj.attack);
    hptext = Crafty.e("2D, Canvas, Text")
        .attr({x: xpos + 5, y: ypos + 5})
        .text(cobj.health);
    manatext = Crafty.e("2D, Canvas, Text")
        .attr({x: xpos + 5, y: ypos + 5})
        .text(cobj.cost);
    rect.bind('UpdateFrame', function () {
        x = this.x;
        y = this.y;
    });
    setInterval(() => {
        if (isYourTurn) {
        }
    }, 2000)
    text.bind('UpdateFrame', function () {
        this.x = x + namedeltax;
        this.y = y + namedeltay;
    });
    abilitiestext.bind('UpdateFrame', function () {
        this.x = x + namedeltax;
        this.y = y + 18;
    });
    this.attacktext.bind('UpdateFrame', function () {
        this.x = x + attackdeltax;
        this.y = y + attackdeltay;
    });
    hptext.bind('UpdateFrame', function () {
        this.x = x + hpdeltax;
        this.y = y + hpdeltay;
    });
    manatext.bind('UpdateFrame', function () {
        this.x = x + manadeltax;
        this.y = y + manadeltay;
    });
    this.rect.num = num;
    return this.rect;
}


function Deck(your = false) {

    this.list = [];
    this.isYour = null;

    let xpos = width + 15;
    let ypos = 15 + (your ? cardHeight + 5 : 0);
    let text = Crafty.e("2D, Canvas, Color, Text")//;(, Text")
        .attr({x: xpos + cardWidth + 5 + 3, y: ypos, w: cardWidth, h: 50})
        .color('white')
        .text(this.list.length)

    this.shuffle = function () {
        shuffle(this.list);
    }

    // тянуть карту
    this.drop = function () {
        if (this.list.length == 0)
            return false;
        text.text(this.list.length - 1);
        return this.list.pop(0);
    }

    this.set = function (arr) {
        this.list = arr;
        text.text(this.list.length);
        this.shuffle();
    }

    //отрисовка
    this.firstDraw = function () {
        let xpos = width + 15;
        let ypos = 15 + (your ? cardHeight + 5 : 0);
        this.rect = Crafty.e("2D, Canvas, Color")//;(, Text")
            .attr({x: xpos, y: ypos, w: cardWidth, h: cardHeight})
            .color('green')
        let message = Crafty.e("2D, Canvas, Color")//;(, Text")
            .attr({x: xpos + cardWidth + 5, y: ypos, w: cardWidth, h: 50})
            .color('grey')
        let text = Crafty.e("2D, Canvas, Color, Text")//;(, Text")
            .attr({x: xpos + cardWidth + 5 + 3, y: ypos, w: cardWidth, h: 50})
            .color('white')
            .text(this.list.length)
        setInterval(function () {
            if ((mouseX > xpos) && (mouseX < xpos + cardWidth)
                && (mouseY > ypos) && (mouseY < ypos + cardHeight)) {
                message.x = width + 15 + cardWidth + 5;
                text.x = width + 15 + cardWidth + 5 + 3;
            } else {
                message.x = xpos + 1000;
                text.x = xpos + 1000;
            }
        }, 100);

        text.text(this.list.length);
    }
}


var yourDeck = new Deck(true);
yourDeck.firstDraw();
newList = []

// мусор?
for (var i = 1; i < 10; i++)
    newList.push(new cardObject('Unit', 1, i, i, ''))
yourDeck.set(newList)

var opponentDeck = new Deck();
opponentDeck.firstDraw();


canvas.onmousemove = function (evt) {
    var rect = canvas.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
    mouseXUnit = Math.trunc(mouseX / fieldCellWidth);
    mouseYUnit = Math.trunc(mouseY / fieldCellHeight);
}

function canPut(i, j, userId) {
    if ((i < 0) || (j < 0) || (i >= fieldHeight) || (j >= fieldWidth))
        return false;
    if ((i == fieldHeight - 1) && (j == 0))
        return true;
    if (i > 0)
        if (field.array[i - 1][j] != 0)
            if (field.array[i - 1][j].unit.playerId() == userId)
                return true
    if (j > 0)
        if (field.array[i][j - 1] != 0)
            if (field.array[i][j - 1].unit.playerId() == userId)
                return true
    if (i < fieldHeight - 1)
        if (field.array[i + 1][j] != 0)
            if (field.array[i + 1][j].unit.playerId() == userId)
                return true
    if (j < fieldWidth - 1)
        if (field.array[i][j + 1] != 0)
            if (field.array[i][j + 1].unit.playerId() == userId)
                return true
    return false;
}

function possiblePuts(userId) {
    res = [];
    for (var i = 0; i < fieldHeight; i++)
        for (var j = 0; j < fieldWidth; j++)
            if (canPut(i, j, userId))
                res.push({x: i, y: j})
    return res;
}

var manaText = Crafty.e("2D, Canvas, Text")
    .attr({x: 5, y: height - bottomBarHeight + 15})
    .text('mana:\n1/1');

function popByNum(arr, n) {
    res = [];
    for (i = 0; i < arr.length; i++) {
        if (i != n)
            res.push(arr[i])
    }
    a = res;
    console.log('READY');
    return res;
}

function gameClass() {
    this.x = 1;
    this.currentPlayer = 0;
    this.maxMana = 1;
    this.currentMana = 1;
    this.showMana = function () {
        manaText.text('mana:\n' + this.currentMana + '/' + this.maxMana);
    }
    this.endTurn = function () {
        this.maxMana += 1;
        this.currentMana = this.maxMana;
        this.showMana();
        this.currentPlayer = 1 - this.currentPlayer;
        doDrop();

        for (let i = 0; i < fieldHeight; i++)
            for (let j = 0; j < fieldWidth; j++)
                if (field.array[i][j] != 0)
                    if (field.array[i][j].unit.playerId() == playerIdGlobal) {
                        console.log(i + ' ' + j)
                        field.array[i][j].unit.canMove = true;
                    }
        sendField();
        playerFlag.color('red');
    }
    this.setHand = function () {
        this.hand = [];
    }
    this.moveCard = function (num) {
        this.hand[num].x -= cardDeltaX;
    }


    this.moveCards = function (num) {
        this.hand = popByNum(this.hand, num);
        for (let i = num; i < this.hand.length; i++) {
            this.hand[i].x -= cardDeltaX;
            this.hand[i].decXpos(cardDeltaX);
        }
    }
}

function handShow() {
}

var game = new gameClass();

function alertObject(text, time = false) {
    let ypos = 0;
    let yposEnd = 100;
    let numTicks = 10;
    let textDeltaY = 10;
    let rect = Crafty.e("2D, Canvas, Color")
        .attr({x: 200, y: 0, w: 200, h: 50})
        .color("orange");
    let label = Crafty.e("2D, Canvas, Text")
        .attr({x: 220, y: textDeltaY})
        .text(text)
        .textFont({size: '40px'});

    let i = setInterval(function () {
        ypos += yposEnd / numTicks;
        rect.y = ypos;
        label.y = ypos + textDeltaY;
    }, 10)
    setTimeout(function () {
        clearInterval(i);
    }, 100)
    this.hide = function () {
        setInterval(function () {
            ypos -= yposEnd / numTicks;
            rect.y = ypos;
            label.y = ypos + textDeltaY;
        }, 10)
    }
    if (time)
        setTimeout(this.hide, time)
}

function endTurn() {
    for (var i = 0; i < fieldHeight; i++)
        for (var j = 0; j < fieldWidth; j++)
            if (field.array[i][j] != 0)
                field.array[i][j].unit.unSelect()
    checkYourAll();
    sockEndMove();
    isYourTurn = false;
    game.endTurn();
    
}

function gameButton(text, width, height, xpos, ypos, clickF) {
    var rect = Crafty.e("2D, Canvas, Color, Mouse")
        .attr({x: xpos, y: ypos, w: width, h: height})
        .color('red')
        .bind('MouseDown', clickF)
    Crafty.e("2D, Canvas, Text, Mouse")
        .attr({x: xpos + 5, y: ypos + 5, w: width, h: height})
        .text(text)
}

var rect = Crafty.e("2D, Canvas, Color") //нижняя полоса
    .attr({x: 0, y: height - bottomBarHeight, w: width, h: lineHeight})
    .color("lightblue")
var playerFlag = Crafty.e("2D, Canvas, Color")
    .attr({x: width - 30, y: 0, w: 30, h: 30})
    .color('green')

var canConcede = true;
concedeFunction = function () {
    if (canConcede) {
        socket.emit('concede',{gameId:gameId.gameId,userId:gameId.playerId})
        showEndMenu();
        canConcede = false;
    }
}

passTurn = gameButton('end turn', endButtonWidth, endButtonHeight, width - endButtonWidth, height / 2 - endButtonHeight / 2, endTurn)
passTurn = gameButton('concede', endButtonWidth, endButtonHeight, width - endButtonWidth, height / 2 - endButtonHeight * 2 - 10, concedeFunction)

doDrop = function () {
    c = yourDeck.drop();
    game.hand.push(card(100 + cardDeltaX * game.hand.length, cardRowY, c, game.hand.length));
}

function fieldObject() {
    this.array = [];
    this.selectedX = -1;
    this.selectedY = -1;
    this.selected = false;

    for (var i = 0; i < fieldHeight; i++) {
        var tarr = []
        for (var j = 0; j < fieldWidth; j++) {
            tarr.push(0)
        }
        this.array.push(tarr)
    }
    this.checkKilled = function () {
        for (var i = 0; i < fieldHeight; i++)
            for (var j = 0; j < fieldWidth; j++)
                if (this.array[i][j] != 0)
                    if ((this.array[i][j].health <= 0) || (this.array[i][j].unit.health <= 0))
                        this.array[i][j] = 0;
    }
    this.drawCell = function (i, j) {
        cell = Crafty.e("2D, Canvas, Color, Mouse")
            .attr({x: fieldCellWidth * j, y: fieldCellHeight * i, w: fieldCellWidth - 10, h: fieldCellHeight - 10})
            .color('green')
            .bind('updateFrame', function () {
            })
            .bind("MouseDown", function (evt) {
                xsel = field.selectedX;
                ysel = field.selectedY;
                if (
                    ((Math.abs(xsel - i) <= 1) && (Math.abs(ysel - j) <= 1))
                    ||
                    ((Math.abs(xsel - i) <= 2) && (Math.abs(ysel - j) <= 2) && (field.array[xsel][ysel].unit.abilities.indexOf('s') != -1))
                ) {
                    //console.log('Can move here')
                    move(xsel, ysel, mouseXUnit, mouseYUnit)
                    sendField();
                }
            });
    }
    this.draw = function () {
        for (var i = 0; i < fieldHeight; i++) {
            for (var j = 0; j < fieldWidth; j++) {
                this.drawCell(i, j);
            }
        }
    }
    this.setUnit = function (x, y, unitAttack, unitHealth, cobj, isOpponent) {
        this.array[y][x] = {
            attack: unitAttack,
            unitHealth: unitHealth,
            unit: new unit(x * fieldCellWidth, y * fieldCellHeight, cobj.name, cobj, y, x, isOpponent)
        }
    }
    this.clear = function () {
        for (var i = 0; i < fieldHeight; i++) {
            for (var j = 0; j < fieldWidth; j++) {
                if (this.array[i][j]) {
                    //sconsole.log(this.array[i][j]);
                    this.array[i][j].unit.kill();
                    this.array[i][j] = 0;
                }
            }
        }
    }
}

var field = new fieldObject();
field.draw();
f_attack = function (field_selectedX, field_selectedY, mouse_XUnit, mouse_YUnit) {
    //console.log(field_selectedX+' '+field_selectedY+' '+mouse_XUnit+' '+mouse_YUnit);
    attack1 = field.array[field_selectedX][field_selectedY].unit.attack;
    try {
        attack2 = field.array[mouse_YUnit][mouse_XUnit].unit.attack;
    } catch {
        attack2 = field.array[mouse_YUnit][mouse_XUnit].attack;
    }
    ;
    try {
        console.log('unit: ');
        field.array[mouse_YUnit][mouse_XUnit].unit.damage(attack1);
    } catch {
        field.array[mouse_YUnit][mouse_XUnit].unit.damage(attack1);
    }
    if ((Math.abs(mouse_YUnit - field_selectedX) <= 1) && (Math.abs(mouse_XUnit - field_selectedY) <= 1)) {
        try {
            field.array[field_selectedX][field_selectedY].unit.damage(attack2);//health-=field.array[mouseYUnit][mouseXUnit].unit.attack;
        } catch {
            field.array[field_selectedX][field_selectedY].damage(attack2);
        }
    }
    field.array[field_selectedX][field_selectedY].canAttack = false;
    field.checkKilled();
    if (isYourTurn)
        sendField();
}

function unit(xpos, ypos, text, cobj, fieldx, fieldy, isOpponent = false) { // существо
    var x = 0;
    var y = 0;

    this.abilities = cobj.abilities;
    this.canMove = false;
    this.canAttack = false;
    if (cobj.abilities.indexOf('r') != -1)
        this.canMove = true;
    var playerId = isOpponent ? 1 - playerIdGlobal : playerIdGlobal;
    this.playerId = function () {
        return playerId;
    }
    var fieldx = fieldx;
    var fieldy = fieldy;
    this.kill = function () {
        this.rect.x = 1000;
        this.y = 1000;
        this.attacktext = null;
    }
    this.getFieldX = function () {
        return fieldx;
    }
    this.getFieldY = function () {
        return fieldy;
    }
    this.setFieldX = function (fx) {
        return fieldx;
    }
    this.setFieldY = function (fy) {
        fieldy = fy;
    }
    this.attack = cobj.attack;
    this.health = cobj.health;
    var selected = false;
    var selPoint = Crafty.e("2D,Canvas, Color")
        .attr({x: x, y: y, w: 0, h: 5})
        .color('blue');
    this.unSelect = function () {
        for (i = 0; i < fieldWidth; i++)
            for (j = 0; j < fieldHeight; j++) {
                if (field.array[j][i] != 0)
                    field.array[j][i].unit.rect.color('lightblue')
            }
        selected = false;
        field.selected = false;
    }
    this.select = function () {
        if (!isYourTurn)
            return;
        if (playerId != playerIdGlobal) {
            if (field.selected) {
                if (!field.array[field.selectedX][field.selectedY].unit.canAttack) {
                    return;
                }
                sendField();
                if (
                    ((Math.abs(mouseYUnit - field.selectedX) > 1) || (Math.abs(mouseXUnit - field.selectedY) > 1))
                    &&
                    !(
                        (Math.abs(mouseYUnit - field.selectedX) <= 2) && (Math.abs(mouseXUnit - field.selectedY) <= 2) && (field.array[field.selectedX][field.selectedY].unit.abilities.indexOf('d') != -1)
                    )
                ) {
                } else {
                    f_attack(field.selectedX, field.selectedY, mouseXUnit, mouseYUnit);
                }
            }
        }
        if ((!selected) && (playerId == playerIdGlobal)) {
            for (i = 0; i < fieldHeight; i++)
                for (j = 0; j < fieldWidth; j++) {
                    //console.log(i+' '+j)
                    if (i < field.array.length)
                        if (j < field.array[i].length)
                            if (field.array[i][j] != 0)
                                field.array[i][j].unit.unSelect()
                }
            field.array[mouseYUnit][mouseXUnit].unit.rect.color('grey')
            field.selected = true;
            fieldx = mouseYUnit;
            fieldy = mouseXUnit;
            field.selectedX = fieldx;
            field.selectedY = fieldy;
            selected = true;
        } else {
            try {
                if (field.array[mouseXUnit][mouseYUnit] != 0)
                    field.array[mouseYUnit][mouseXUnit].unit.unSelect();
            } catch {
            }
        }
    };
    this.isSelected = function () {
        return selected;
    }
    this.rect = Crafty.e("2D, Canvas, Color, Mouse")
        .attr({x: xpos, y: ypos, w: unitWidth, h: unitHeight})
        .color("lightblue")
        .bind('MouseDown', this.select);
    this.attacktext = Crafty.e("2D, Canvas, Text")
        .attr({x: xpos + 5, y: ypos + 5})
        .text(this.attack);
    this.hptext = Crafty.e("2D, Canvas, Text")
        .attr({x: xpos + 5, y: ypos + 5})
        .text(this.health);
    var yourtext = Crafty.e("2D, Canvas, Text")
        .attr({x: xpos + 5, y: ypos + yourDeltaY})
        .text(playerId == playerIdGlobal ? 'Y' : 'N');
    var abilitiesText = Crafty.e("2D, Canvas, Text")
        .attr({x: xpos + abilitiesDeltaXUnit, y: ypos + abilitiesDeltaYUnit})
        .text(cobj.abilities);
    this.setYour = function (y) {
        yourtext.text(y)
    };
    this.setHealth = function (y) {
        this.hptext.text(y)
    };
    this.rect.bind('UpdateFrame', function () {
        x = this.x;
        y = this.y;
    });
    this.attacktext.bind('UpdateFrame', function () {
        this.x = x + 5;
        this.y = y + unitHeight - 10;
    });
    this.hptext.bind('UpdateFrame', function () {
        this.x = x + unitWidth - 10;
        this.y = y + unitHeight - 10;
    });
    abilitiesText.bind('UpdateFrame', function () {
        this.x = x + 30;
        this.y = y + 7;
    });
    yourtext.bind('UpdateFrame', function () {
        this.x = x + 5;
        this.y = y + 8;
    });
    this.damage = function (x) {
        this.health -= x;
        if (this.health <= 0) {
            this.rect.x = 10000;
            field.array[fieldx][fieldy] = 0;
        }
        this.hptext.text(this.health)
    }
}

function addUnit(cobj, x, y, isOpponent = false) { // добавляет существо на стол
    field.setUnit(x, y, cobj.attack, cobj.health, cobj, isOpponent);
    sendField();
    tableNum++;
}

function move(x1, y1, y2, x2, force = false) {
    if ((!force) && (!readyState)) return;
    if (!force && !isYourTurn)
        return
    if (field.array[x1][y1] == 0) {
        return;
    }
    if ((Math.abs(x1 - x2) > 1 || Math.abs(y1 - y2) > 1)
        &&
        !((Math.abs(x1 - x2) <= 2) && (Math.abs(y1 - y2) <= 2) && (field.array[x1][y1].unit.abilities.indexOf('s') != -1))) {
        return;
    }
    if ((field.array[x1][y1].unit.canMove == false) && (force == false)) {
        console.log('this unit cannot move');
        return;
    }
    if (field.array[x2][y2] != 0) {
        return;
    }
    console.log('socket sent')
    socket.emit('moveArrow', {userId: userId, gameId: gameId, moveData: [x1, y1, x2, y2]});
    sendField();
    field.array[x2][y2] = field.array[x1][y1];
    field.array[x2][y2].unit.rect.x = y2 * fieldCellWidth;
    field.array[x2][y2].unit.rect.y = x2 * fieldCellHeight;
    field.array[x2][y2].unit.canMove = false;
    field.array[x2][y2].unit.fieldx = x2;
    field.array[x2][y2].unit.fieldy = y2;
    field.array[x1][y1] = 0;
    field.selectedX = x2;
    field.selectedY = y2;
}

function checkYourAll() {
    for (var i = 0; i < fieldHeight; i++)
        for (var j = 0; j < fieldWidth; j++)
            if (field.array[i][j] != 0) {
                field.array[i][j].unit.canMove = true;
                field.array[i][j].unit.canAttack = true;
                //console.log(field.array[i][j].unit.playerId()+" "+playerIdGlobal)
                if (field.array[i][j].unit.playerId() == playerIdGlobal)
                    field.array[i][j].unit.setYour('Y');
                else
                    field.array[i][j].unit.setYour('N');
            }
}

socket.on('sendDeck', function (data) {
    console.log(data)
    let deck = [];
    data.deck.forEach(i => {
        deck.push(allCards[i]);
    })
    console.log(deck);
    yourDeck.list = []
    deck.forEach(i => {
        yourDeck.list.push(i)
    })
    doStart();
})

function showDecks(arr) {
    console.log('showing decks: ', arr)
    n = 0;
    deckButtons = [];

    arr.decks.forEach(i => {
        console.log(i);
        let k = i;
        deckButtons.push(Crafty.e('2D, Canvas, Color, Mouse')
            .attr({x: 210, y: n * 55, w: 80, h: 50})
            .color('red')
            .bind('MouseDown', function () {
                console.log('chosen deck ' + k)
                socket.emit('getDeck', {userId: userId, deckId: k})
                deckButtons.forEach(i => {
                    i.y -= 1000;
                })
            }))

        n++;
    })
}

var menu = Crafty.e("2D, Canvas, Color")
    .attr({x: 0, y: 0, w: canvasWidth, h: canvasHeight})
    .color('grey')

function doStart(deckNum) {
    console.log(deckNum);
    hideMenu();
    startGame();
    isYourTurn = true;
    playerFlag.color('green');
    game.setHand();
}

async function doSelectDeck() {
    i = 0;
    let buttons = [];
    let labels = [];

    function doStart2(deckNum) {
        doStart(deckNum);
        buttons.forEach(i => {
            i.y -= 1000
        })
        labels.forEach(i => {
            i.y -= 1000
        })
    }

    numberOfDecks = 0;
    a = new Promise(function (resolve, reject) {
        socket.on('sendDeckList', function (f) {
            resolve(f);
        })
    })
    a.then(result => {
            showDecks(result)
        },
        error => {
            console.log('result' + error)
        })

    socket.emit('getDeckList', {userId: userId})
    while (i < numberOfDecks) {
        let num = i;
        let deck1 = Crafty.e("2D, Canvas, Color, Mouse")
            .attr({x: 202, y: 80 + 32 * i, w: 100, h: 30})
            .color('red')
            .bind('MouseDown', function () {
                doStart2(num)
            })
        buttons.push(deck1);
        let label1 = Crafty.e("2D, Canvas, Color, Text")
            .attr({x: 205, y: 82 + 32 * i, w: 100, h: 30})
            .textFont({size: '20px'})
            .textColor('white')
            .color('red')
            .text("Deck " + (num + 1))
        labels.push(label1);
        i++
    }
}

var startButton = Crafty.e("2D, Canvas, Color, Mouse")
    .attr({x: 100, y: 80, w: 100, h: 30})
    .color('red')
    .bind('MouseDown', function () {
        doSelectDeck()
    })


var startButtonText = Crafty.e("2D, Canvas, Text")
    .attr({x: 105, y: 82})
    .text('Start')
    .textFont({size: '20px'})
    .textColor('white')

var editDecksButton = Crafty.e("2D, Canvas, Color, Mouse")
    .attr({x: 100, y: 120, w: 100, h: 30})
    .color('red')
    .bind('MouseDown', function () {
        // hideMenu();showEditDecksMenu()
        document.location.href = '/editDecks'
    })

var editDecksButtonText = Crafty.e("2D, Canvas, Text")
    .attr({x: 105, y: 127})
    .text('Edit decks')
    .textFont({size: '20px'})
    .textColor('white')


var editDecksMenu = Crafty.e("2D, Canvas, Color")
    .attr({y: -canvasHeight, x: 0, w: canvasWidth, h: canvasHeight})
    .color('grey')

var editDecksMenuBackButton = Crafty.e("2D, Canvas, Color, Mouse")
    .attr({y: -40, x: canvasWidth - 100, h: 30, w: 80})
    .color('red')
    .bind('MouseDown', function () {
        showMenu();
        hideEditDecksMenu()
    })

var editDecksMenuBackButtonLabel = Crafty.e("2D, Canvas, Color, Text")
    .attr({y: -38, x: canvasWidth - 90, h: 30, w: 80})
    .textColor('white')
    .color('red')
    .textFont({size: '20px'})
    .text('go back')

function showEditDecksMenu() {
    editDecksMenu.y = 0;
    editDecksMenuBackButton.y += canvasHeight;
    editDecksMenuBackButtonLabel.y += canvasHeight;
}

function hideEditDecksMenu() {
    editDecksMenu.y = -canvasHeight;
    editDecksMenuBackButton.y -= canvasHeight;
    editDecksMenuBackButtonLabel.y -= canvasHeight;
}


var readyMarker = Crafty.e('2D, Canvas, Color')
    .attr({x: 0, y: 0, w: 50, h: 50})
    .color('pink')

setInterval(() => {
    if (!readyState) {
        readyMarker.x = 0;
        socket.emit('field', {gameId: gameId, field: field, securityValue: securityValue});
    } else
        readyMarker.x = -60;
}, 400)

var endMenu = Crafty.e("2D, Canvas, Color")
    .attr({x: 0, y: 0, w: canvasWidth, h: canvasHeight})
    .color('grey')

var endGameButton = Crafty.e("2D, Canvas, Color, Mouse")
    .attr({x: 180, y: 170, w: 240, h: 50})
    .color('red')
    .bind('MouseDown', function () {
        hideEndMenu();
        showMenu();
    })

var endLabel = Crafty.e("2D, Canvas, Text")
    .attr({x: 150, y: 82})
    .text('Game over')
    .textFont({size: '60px'})
    .textColor('white')

var endLabelWon = Crafty.e("2D, Canvas, Text")
    .attr({x: 150, y: 250})
    .text('You won!')
    .textFont({size: '60px'})
    .textColor('white')

var endButtonLabel = Crafty.e("2D, Canvas, Text")
    .attr({x: 190, y: 180})
    .text('Go to menu')
    .textFont({size: '40px'})
    .textColor('white')

var hideMenu = function () {
    menu.y -= canvasHeight;
    startButton.y -= canvasHeight
    startButtonText.y -= canvasHeight;

    editDecksButton.y -= canvasHeight
    editDecksButtonText.y -= canvasHeight;
}

var showMenu = function () {
    menu.y += canvasHeight;
    startButton.y += canvasHeight;
    startButtonText.y += canvasHeight;
    editDecksButton.y += canvasHeight
    editDecksButtonText.y += canvasHeight;
}


var hideEndMenu = function () {
    endMenu.y = 0 - canvasHeight;
    endLabel.y = 82 - canvasHeight;
    endLabelWon.y = 250 - canvasHeight;
    endGameButton.y = 170 - canvasHeight;
    endButtonLabel.y = 180 - canvasHeight;
}

var showEndMenu = function (won = false) {
    field.clear();
    for (var i = 0; i < game.hand.length; i++) {
        game.hand[i].x -= width;
    }
    game.maxMana = 1;
    game.currentMana = 1;
    manaText.text('mana: 1/1');
    game.hand = [];
    endMenu.y = 0;
    endLabel.y = 82;
    endLabelWon.y = 250;
    endGameButton.y = 170;
    endButtonLabel.y = 180;
    won = won;
    if (won)
        endLabelWon.text('You Won!')
    else
        endLabelWon.text('You lost...')
}

function isYourHero(x, y) {
    if (field.array[x][y] == 0) return false;
    return (field.array[x][y].unit.abilities.indexOf('h') != -1) && (field.array[x][y].unit.playerId() == playerIdGlobal)
}

function yourHeroExists() {
    console.log('check')
    let n = 0;
    for (let i = 0; i < fieldHeight; i++)
        for (let j = 0; j < fieldWidth; j++) {
            if (isYourHero(i, j))
                return true;
            n++;
        }
    concedeFunction();
    return false;
}

function showXs() {
    res = ''
    for (let i = 0; i < game.hand.length; i++)
        res += i + ':' + game.hand[i].x + ' ';
    console.log(res)
}

function setField(list) {
    for (let i = 0; i < fieldHeight; i++)
        for (let j = 0; j < fieldWidth; j++)
            if (field.array[i][j] != 0) {
                field.array[i][j].unit.kill();
                field.array[i][j] = 0;
            }
    list.forEach((i) => {
        field.array[i.fy][i.fx] = {
            attack: i.co.attack,
            unitHealth: i.co.health,
            unit: new unit(
                i.fx * fieldCellWidth,
                i.fy * fieldCellHeight,
                '',
                i.co,
                i.fx,
                i.fy,
                !i.isYour
            )
        }
    })
}

function sendField() {
    data = [];
    data2 = [];
    for (let i = 0; i < fieldHeight; i++)
        for (let j = 0; j < fieldWidth; j++)
            if (field.array[i][j] != 0)
                data2.push({
                    fx: i,
                    fy: j,
                    attack: field.array[i][j].unit.attack,
                    health: field.array[i][j].unit.health,
                    isYour: field.array[i][j].unit.playerId() == playerIdGlobal,
                    co: {
                        attack: field.array[i][j].unit.attack,
                        health: field.array[i][j].unit.health,
                        abilities: field.array[i][j].unit.abilities,
                    },
                })
    securityValue = Math.random();
    readyState = false;
    sendData = {gameId: gameId, field: data2, securityValue: securityValue};
    socket.emit('field', {gameId: gameId, field: data2, securityValue: securityValue})
}

hideEndMenu();