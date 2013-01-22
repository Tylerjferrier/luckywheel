/*
So we need to draw six times. Each time we draw two arc
*/  
		var colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
             "#2E2C75", "#673A7E", "#CC0071", "#F80120",
             "#F35B20", "#FB9A00", "#FFCC00", "#FEF200"];
var restaraunts = ["Cutee", "Mini", "MiniPlus", "eeTee",
                   "beegee", "good luck", "happy new", "year",
                   "Sorry", "well done", "one", "more"];

var startAngle = 0;
var arc = Math.PI / 6;
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;
var wheelRadius = 500;


function drawRouletteWheel() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = wheelRadius / 4 * 3;
    var textRadius = 300;
    var insideRadius = wheelRadius / 4 * 2;
    
    ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,2 * wheelRadius, 2*wheelRadius);
      
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
   
    ctx.font = '30px Helvetica, Arial';
   
    for(var i = 0; i < 12; i++) {
      var angle = startAngle + i * arc;
      ctx.fillStyle = colors[i];
     
      ctx.beginPath();
      ctx.arc(wheelRadius, wheelRadius, outsideRadius, angle, angle + arc, false);
      ctx.arc(wheelRadius, wheelRadius, insideRadius, angle + arc, angle, true);

      ctx.stroke();
      ctx.fill();
     //break;
      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur    = 0;
      ctx.shadowColor   = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(wheelRadius + Math.cos(angle + arc / 2) * textRadius,
                    wheelRadius + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = restaraunts[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }
   
    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(wheelRadius - 4, wheelRadius - (outsideRadius + 5));
    ctx.lineTo(wheelRadius + 4, wheelRadius - (outsideRadius + 5));
    ctx.lineTo(wheelRadius + 4, wheelRadius - (outsideRadius - 5));
    ctx.lineTo(wheelRadius + 9, wheelRadius - (outsideRadius - 5));
    ctx.lineTo(wheelRadius + 0, wheelRadius - (outsideRadius - 13));
    ctx.lineTo(wheelRadius - 9, wheelRadius - (outsideRadius - 5));
    ctx.lineTo(wheelRadius - 4, wheelRadius - (outsideRadius - 5));
    ctx.lineTo(wheelRadius - 4, wheelRadius - (outsideRadius + 5));
    ctx.fill();
  }
}
   
function spin() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000;
  rotateWheel();
}

function rotateWheel() {
  spinTime += 10;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = restaraunts[index]
  ctx.fillText(text, wheelRadius - ctx.measureText(text).width / 2, wheelRadius + 10);
  ctx.restore();
}

function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}

$(document).ready(function () {  
  Crafty.init(1000, 1000);
  Crafty.canvas.init();
  drawRouletteWheel();
})