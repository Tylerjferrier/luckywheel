/*
So we need to draw six times. Each time we draw two arc
*/
define(['jquery', 'underscore', 'backbone', 'buzz'], function ($, _, Backbone, buzz) {
  console.log('Check if loaded');
  console.log($);
  console.log(_);
  console.log(Backbone);
  console.log(buzz);

  var Roulette = function () {
    this.colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
               "#2E2C75", "#673A7E", "#CC0071", "#F80120",
               "#F35B20", "#FB9A00", "#FFCC00", "#FEF200"];
    this.subColors = ["#D8CCDA", "#EFE6F1", "#DEA460", "#AAA6AB",
               "#F891A4", "#DDDDB5", "#77EBEF", "#F9D6F4",
               "#A248D6", "#304890", "#A5CFDD", "#C92F81"];
                           
    this.awards = ["Cutee", "Mini", "MiniPlus", "eeTee",
                     "beegee", "good luck", "happy new", "year",
                     "Sorry", "well done", "one", "more"];
    this.congratItems = [1, 4, 7];
                     
    this.avatars = [ 
      "assets/img/gift/1.png",
      "assets/img/gift/1.png",
      "assets/img/gift/2.png",
      "assets/img/gift/3.png",
      "assets/img/gift/4.png",
      "assets/img/gift/5.png",
      "assets/img/gift/6.png",
      "assets/img/gift/7.png",
      "assets/img/gift/8.png",
      "assets/img/gift/9.png",
      "assets/img/gift/10.png",
      "assets/img/gift/11.png",
      "assets/img/gift/12.png"
    ];    
    
    (function () {
      for (var i=0; i<=11; i++) {
        this.avatars[i] = new Image();
        this.avatars[i].src = "assets/img/gift/" + (i+1) + ".png";
      }
    }).call(this);
    //console.log(this.avatars);               

    this.startAngle = 0;
    this.arc = Math.PI / 6;
    this.spinTimeout = null;

    this.spinArcStart = 10;
    this.spinTime = 0;
    this.spinTimeTotal = 0;

    this.wheelRadius = 500;

    this.sound = new buzz.sound("resources/audio/spin", {
      formats: [ "wav" ],
      preload: true,
      autoplay: false,
      loop: true
    });

    return this;
  }  

  Roulette.prototype.draw = function() {
    var canvas = document.getElementById("wheel");
      if (canvas.getContext) {
        var outsideRadius = this.wheelRadius / 4 * 3;
        var textRadius = 200;
        var avatarRadius = 350;
        var insideRadius = this.wheelRadius / 4 * 2;
        
        var ctx = this.ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,2 * this.wheelRadius, 2 * this.wheelRadius);
        
        var subOutsideRadius = insideRadius; 
        var subInsideRadius = outsideRadius / 2;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
       
        ctx.font = '20px bold Helvetica, Arial';
       
        for(var i = 0; i < 12; i++) {
          var angle = this.startAngle + i * this.arc;
          ctx.fillStyle = this.colors[i];
         
          ctx.beginPath();
          ctx.arc(this.wheelRadius, this.wheelRadius, outsideRadius, angle, angle + this.arc, false);
          ctx.arc(this.wheelRadius, this.wheelRadius, insideRadius, angle + this.arc, angle, true);

          ctx.stroke();
          ctx.fill();

          //Draw inner cỉclesucỉclesub
          ctx.fillStyle = this.subColors[i];
          ctx.beginPath();
          ctx.arc(this.wheelRadius, this.wheelRadius, subOutsideRadius, angle, angle + this.arc, false);
          ctx.arc(this.wheelRadius, this.wheelRadius, subInsideRadius, angle + this.arc, angle, true);

          ctx.stroke();
          ctx.fill();


          //draw icon 
          ctx.save();
          ctx.translate(this.wheelRadius + Math.cos(angle + this.arc / 2) * avatarRadius,
                        this.wheelRadius + Math.sin(angle + this.arc / 2) * avatarRadius);
          ctx.rotate(angle + this.arc / 2 + Math.PI / 2);
          ctx.drawImage(this.avatars[i], -32, 0, 64, 64); 
          ctx.restore();
          

         //draw text
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
        // ctx.fillStyle = "black";
        // ctx.beginPath();
        // ctx.moveTo(this.wheelRadius - 4, this.wheelRadius - (outsideRadius + 5));
        // ctx.lineTo(this.wheelRadius + 4, this.wheelRadius - (outsideRadius + 5));
        // ctx.lineTo(this.wheelRadius + 4, this.wheelRadius - (outsideRadius - 5));
        // ctx.lineTo(this.wheelRadius + 9, this.wheelRadius - (outsideRadius - 5));
        // ctx.lineTo(this.wheelRadius + 0, this.wheelRadius - (outsideRadius - 13));
        // ctx.lineTo(this.wheelRadius - 9, this.wheelRadius - (outsideRadius - 5));
        // ctx.lineTo(this.wheelRadius - 4, this.wheelRadius - (outsideRadius - 5));
        // ctx.lineTo(this.wheelRadius - 4, this.wheelRadius - (outsideRadius + 5));
        // ctx.fill();
      }
  };

  Roulette.prototype.spin = function() {
    this.spinAngleStart = Math.random() * 10 + 10;
    this.spinTime = 0;
    this.spinTimeTotal = Math.random() * 3 + 4 * 1000;
    this.rotateWheel();
    this.sound.play();
  }

  Roulette.prototype.rotateWheel = function() {
    this.spinTime += 10;
    if(this.spinTime >= this.spinTimeTotal) {
      this.stopRotateWheel();
      return;
    }
    var s=this,
      spinAngle = this.spinAngleStart - this.easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal);
    this.startAngle += (spinAngle * Math.PI / 180);
    this.draw();
    this.spinTimeout = setTimeout((function () {    
      s.rotateWheel.call(s);
    }), 30);
  }

  Roulette.prototype.stopRotateWheel = function() {
    this.sound.stop();
    clearTimeout(this.spinTimeout);
    var degrees = this.startAngle * 180 / Math.PI + 90;
    var arcd = this.arc * 180 / Math.PI;
    var index = Math.floor((360 - degrees % 360) / arcd);
    this.ctx.save();
    this.ctx.font = 'bold 30px Helvetica, Arial';
    var text = this.awards[index]
    this.ctx.fillText(text, this.wheelRadius - this.ctx.measureText(text).width / 2, this.wheelRadius + 100);
    this.ctx.restore();
  }

  Roulette.prototype.easeOut = function(t, b, c, d) {
    var ts = (t/=d)*t;
    var tc = ts*t;
    return b+c*(tc + -3*ts + 3*t);
  }



    var r = new Roulette();

    var AppView = Backbone.View.extend({
      el: '#playboard',

      initialize: function () {
        r = r || new Roulette();
        this.render();
      },

      render : function() {
        r.draw();    
      },

      events: {
        "click button#spin": "doPlay",      
      },

      doPlay: function () {
        r.spin();
      },

    });

  var McView = Backbone.View.extend({
    el: '#mc',

    message: 'Welcome...',

    initialize: function () {
    },

    render : function() {
      r.draw();    
    }


  });  

  return {
    init: function() {
      var appView = new AppView();  
    }
  }

});