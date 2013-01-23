/*
So we need to draw six times. Each time we draw two arc
*/

var Roulette = function () {
  this.colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
             "#2E2C75", "#673A7E", "#CC0071", "#F80120",
             "#F35B20", "#FB9A00", "#FFCC00", "#FEF200"];
  this.awards = ["Cutee", "Mini", "MiniPlus", "eeTee",
                   "beegee", "good luck", "happy new", "year",
                   "Sorry", "well done", "one", "more"];

  this.startAngle = 0;
  this.arc = Math.PI / 6;
  this.spinTimeout = null;

  this.spinArcStart = 10;
  this.spinTime = 0;
  this.spinTimeTotal = 0;

  this.wheelRadius = 500;

  return this;
}  

Roulette.prototype.draw = function() {
  var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
      var outsideRadius = this.wheelRadius / 4 * 3;
      var textRadius = 300;
      var insideRadius = this.wheelRadius / 4 * 2;
      
      var ctx = this.ctx = canvas.getContext("2d");
      ctx.clearRect(0,0,2 * this.wheelRadius, 2 * this.wheelRadius);
        
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
     
      ctx.font = '30px Helvetica, Arial';
     
      for(var i = 0; i < 12; i++) {
        var angle = this.startAngle + i * this.arc;
        ctx.fillStyle = this.colors[i];
       
        ctx.beginPath();
        ctx.arc(this.wheelRadius, this.wheelRadius, outsideRadius, angle, angle + this.arc, false);
        ctx.arc(this.wheelRadius, this.wheelRadius, insideRadius, angle + this.arc, angle, true);

        ctx.stroke();
        ctx.fill();
       //break;
        ctx.save();
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = -1;
        ctx.shadowBlur    = 0;
        ctx.shadowColor   = "rgb(220,220,220)";
        ctx.fillStyle = "black";
        ctx.translate(this.wheelRadius + Math.cos(angle + this.arc / 2) * textRadius,
                      this.wheelRadius + Math.sin(angle + this.arc / 2) * textRadius);
        ctx.rotate(angle + this.arc / 2 + Math.PI / 2);
        var text = this.awards[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
      }
     
      //Arrow
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.moveTo(this.wheelRadius - 4, this.wheelRadius - (outsideRadius + 5));
      ctx.lineTo(this.wheelRadius + 4, this.wheelRadius - (outsideRadius + 5));
      ctx.lineTo(this.wheelRadius + 4, this.wheelRadius - (outsideRadius - 5));
      ctx.lineTo(this.wheelRadius + 9, this.wheelRadius - (outsideRadius - 5));
      ctx.lineTo(this.wheelRadius + 0, this.wheelRadius - (outsideRadius - 13));
      ctx.lineTo(this.wheelRadius - 9, this.wheelRadius - (outsideRadius - 5));
      ctx.lineTo(this.wheelRadius - 4, this.wheelRadius - (outsideRadius - 5));
      ctx.lineTo(this.wheelRadius - 4, this.wheelRadius - (outsideRadius + 5));
      ctx.fill();
    }
};

Roulette.prototype.spin = function() {
  this.spinAngleStart = Math.random() * 10 + 10;
  this.spinTime = 0;
  this.spinTimeTotal = Math.random() * 3 + 4 * 1000;
  this.rotateWheel();
}

Roulette.prototype.rotateWheel = function() {
  this.spinTime += 10;
  if(this.spinTime >= this.spinTimeTotal) {
    this.stopRotateWheel();
    return;
  }
  var spinAngle = this.spinAngleStart - easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal);
  this.startAngle += (spinAngle * Math.PI / 180);
  this.draw();
  this.spinTimeout = setTimeout('this.rotateWheel()', 30);
}

Roulette.prototype.stopRotateWheel = function() {
  clearTimeout(this.spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = this.awards[index]
  ctx.fillText(text, wheelRadius - ctx.measureText(text).width / 2, wheelRadius + 10);
  ctx.restore();
}

Roulette.prototype.easeOut = function(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}


$(document).ready(function () {  
  
  Crafty.init(1000, 1000);
  Crafty.canvas.init();
  
  //the loading screen that will display while our assets load

  Crafty.scene("loading", function () {
    console.log('Loading the Main App');
      //load takes an array of assets and a callback when complete
      Crafty.load(["resource/imgs/arrow.png", "resource/imgs/bg.png", "resource/audio/spin.wav"], function () {
          Crafty.scene("main"); //when everything is loaded, run the main scene
      });

      //black background with some loading text
      Crafty.background("#000");
      Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
              .text("Loading")
              .css({ "text-align": "center" });
  });

  Crafty.scene("main", function () {
      console.log('Start the Main App');
      generateWorld();
  });

  //automatically play the loading scene
  Crafty.scene("loading");
})

function generateWorld() {
  var r = new Roulette();
  r.draw();
}