class Game {
  constructor() 
  {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    this.leadTitle = createElement("h2");
    this.lead1 = createElement("h2");
    this.lead2 = createElement("h2");
    this.playerMoving = false;

  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    fuels = new Group();
    powerCoins = new Group();
    obstactles = new Group();

    //addFuelSprite
    this.addSprites(fuels, 4, fuelImg, 0.02);

    //addpowerCoins
    this.addSprites(powerCoins, 18, powerCoinImg, 0.09);

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    this.addSprites(obstactles, obstaclesPositions.length, obstacle1Image, 0.04, obstaclesPositions);
    
  }

  handleFuel(index)
  {
    cars[index - 1].overlap(fuels, function(collector, collected){
      player.fuel = 185
      collected.remove();
    })

    if(player.fuel > 0 && this.playerMoving)
    {
      player.fuel -= 0.3;
    }

    if(player.fuel <= 0)
    {
      gameState = 2;
      this.gameOver;
    }
  
  }

  handlePowerCoin(index)
  {
    cars[index - 1].overlap(powerCoins, function(collector, collected){
      player.score += 21;
      player.update();
      collected.remove();
    })

  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width/2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width/2 + 200, 100);

    this.leadTitle.html("Leader Board");
    this.leadTitle.class("resetText");
    this.leadTitle.position(width/3 - 60, 40);
    
    this.lead1.class("leadersText");
    this.lead1.position(width/3 - 50, 80);

    this.lead2.class("leadersText");
    this.lead2.position(width/3 - 50, 130);
  }

  play() {
    this.handleElements();

    this.handleResetButton();

    Player.getPlayersInfo();

    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLeaderboard();

      this.showLife();
      this.showFuelBar();

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if(index == player.index)
        {
          fill("red");
          ellipse(x, y, 100, 100);

          this.handleFuel(index);
          this.handlePowerCoin(index);

          camera.position.x = x;
          camera.position.y = y;
        }


      }

      this.handlePlayerControls();

      const finishline = height*6-100;

      if(player.positionY > finishline)
      {
        gameState = 2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }

      drawSprites();
    }
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    This tag is used for displaying four spaces.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.lead1.html(leader1)
    this.lead2.html(leader2);
  }

  handlePlayerControls() {
    // handling keyboard events
    if (keyIsDown(UP_ARROW)) {
      this.playerMoving = true
      player.positionY += 10;
      player.update();
    }

    if(keyIsDown(LEFT_ARROW) && player.positionX > width/3 - 50)
    {
      player.positionX -= 5
      player.update();
    }

    if(keyIsDown(RIGHT_ARROW) && player.positionX < width/3 + 50)
    {
      player.positionX += 5

      player.update();
    }
  }

  handleResetButton()
  {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        carsAtEnd: 0,
        playerCount: 0,
        gameState: 0,
        players: {}

      });
      window.location.reload();
    });
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, position = [])
  {
    for(var i = 0; i < numberOfSprites; i++)
    {
      var x, y;
      
      if(position.length > 0)
      {
        x = position[i].x;
        y = position[i].y;
        spriteImage = position[i].image;

      }
      else
      { 
        x = random(width/2 + 150, width/2 - 150);
        y = random(-height*4.5, height - 400);
      }

      var sprite = createSprite(x, y, 10, 10);
      sprite.addImage("sprite", spriteImage);
      sprite.scale = scale;
      spriteGroup.add(sprite);
      
    }
  }

  showRank()
  {
    swal({
      title: `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
      text: "You reached the finish line successfuly",
      imageUrl: "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "OK"
    });
  }

  showLife() {
    push();
    image(lifeImage, width / 2 - 130, height - player.positionY - 300, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY - 300, 185, 20);
    fill("#f50057");
    rect(width / 2 - 100, height - player.positionY - 300, player.life, 20);
    noStroke();
    pop();
  }

  showFuelBar() {
    push();
    image(fuelImg, width / 2 - 130, height - player.positionY - 350, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY - 250, 185, 20);
    fill("#ffc400");
    rect(width / 2 - 100, height - player.positionY - 250, player.fuel, 20);
    noStroke();
    pop();
  }

  gameOver()
  {
    swal({
      title: `Game Over`,
      text: "Opps.You lost",
      imageUrl: "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100X100",
      confirmButtonText: "Thanks for playing"
    });
  }
}
