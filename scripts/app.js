/*
So we need to draw six times. Each time we draw two arc
*/
define(['jquery', 'underscore', 'backbone', 'buzz', 'parse'], function ($, _, Backbone, buzz, Parse) {
  "use strict"
  console.log('Check if loaded')
  console.log($)
  console.log(_)
  console.log(Backbone)
  console.log(buzz)

  Parse.initialize("rJBiku5BRJwE4BKaKhspW5R61OLT8d19KxsojnFM", "SWiZlZ8Pw28Gv7yj632JKQGlEHcHszQI2w8dDtgU")

  var Roulette = function () {
    this.colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
               "#2E2C75", "#673A7E", "#CC0071", "#F80120",
               "#F35B20", "#FB9A00", "#FFCC00", "#FEF200"]
    this.subColors = ["#D8CCDA", "#EFE6F1", "#DEA460", "#AAA6AB",
               "#F891A4", "#DDDDB5", "#77EBEF", "#F9D6F4",
               "#A248D6", "#304890", "#A5CFDD", "#C92F81"]
                           
    this.awards = ["eeTee", "one", "Gluck",  "cutee"
                    ,"year", "minoplus", "welldone", "beegee",
                    , "more", "hapy", "mini", "sorry"]
    
    this.congratItems = [0, 2, 4, 6, 8]
                     
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
    ]    
    
    this.drawInterval = 30; //redraw each this amount of ms 
    this.startAngle = 0;
    this.arc = Math.PI / 6;
    this.spinTimeout = null;

    this.spinArcStart = 10;
    this.spinTime = 0;
    this.spinTimeTotal = 0;

    this.wheelRadius = 500;
    this.canvas = document.getElementById("wheel");

    this.sound = new buzz.sound("resources/audio/spin", {
      formats: [ "wav" ],
      preload: true,
      autoplay: false,
      loop: true
    })

    this.loadResource()    
  }  

  Roulette.prototype.loadResource = function () {
    ;(function () {
      for (var i=0; i<=11; i++) {
        this.avatars[i] = new Image();
        this.avatars[i].src = "assets/img/gift/" + (i+1) + ".png";
      }
    }).call(this)
    //console.log(this.avatars);      
    this.wheelImage = new Image()    
    this.wheelImage.src = "assets/img/wheel.png"  
  }

  Roulette.prototype._drawBoard = function() {
    var canvas = this.canvas
        ,ctx = this.ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,2 * this.wheelRadius, 2 * this.wheelRadius);
        
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
       
    var angle = this.startAngle + 0 * this.arc;
    ctx.save()
    ctx.translate(canvas.width/2, canvas.height/2)
    ctx.rotate(angle + this.arc / 2 + Math.PI / 2)
    ctx.drawImage(this.wheelImage, -500, -500, 1000, 1000)

    ctx.restore()
  }

  Roulette.prototype.draw = function() {
    var canvas = this.canvas
      if (canvas.getContext) {
        this._drawBoard()
        /*
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
        */
        
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
    this.rotateWheel()
        .sound.play()
  }

  Roulette.prototype.rotateWheel = function() {
    this.spinTime += 10;
    if(this.spinTime >= this.spinTimeTotal) {
      this.stopRotateWheel()
      return this
    }
    var s=this
        ,spinAngle = this.spinAngleStart - this.easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal)
    this.startAngle += (spinAngle * Math.PI / 180)
    this.draw()
    this.spinTimeout = setTimeout((function () {    
      s.rotateWheel.call(s)
    }), this.drawInterval)
    return this
  }

  Roulette.prototype.stopRotateWheel = function() {
    this.sound.stop()
    clearTimeout(this.spinTimeout)
    var degrees = this.startAngle * 180 / Math.PI + 90
    var arcd = this.arc * 180 / Math.PI
    var index = Math.floor((360 - degrees % 360) / arcd);

    if (_.contains(this.congratItems, index)) {
      this.startAngle += (this.arc * 180) / Math.PI    
    }

    this.ctx.save();
    this.ctx.font = 'bold 30px Helvetica, Arial';
    var text = this.awards[index]
    console && console.log(text)
    this.ctx.fillText(text, this.wheelRadius - this.ctx.measureText(text).width / 2, this.wheelRadius + 100)
    this.ctx.restore()
  }

  Roulette.prototype.easeOut = function(t, b, c, d) {
    var ts = (t/=d)*t;
    var tc = ts*t;
    return b+c*(tc + -3*ts + 3*t);
  }

  Roulette.prototype.preventLucky = function () {

  }


  var r = new Roulette();

  var Award = Backbone.Model.extend({
    initialize: function(){
      console.log('Add a new award')      
    }
    ,defaults : {
      name: 'New item'
      ,quantity: 1
      ,chance: 0.2
    }    
  })

  var AwardCollection = Backbone.Collection.extend({

  })



    var AppView = Backbone.View.extend({
      el: '#playboard',
      playButton: $('button#spin'),

      initialize: function () {
        r = r || new Roulette();
        this.render();
      },

      render : function() {
        r.draw();    
      },

      events: {
        "click #spin": "doPlay", 
        "hover #spin": "animatePlayButton"     
      },

      doPlay: function () {
        r.spin();
      },

      animatePlayButton: function () {
        console.log('Hover')
        console.log(this.playButton)
        this.playButton.transform({
          rotate: 90
        })
      }

    });

  var McView = Backbone.View.extend({
    el: '#playboard > #mc',

    message: 'Welcome...',

    initialize: function () {
      this.render()      
    },

    render : function() {
      this.$el.html(this.message)          
    }

  })  

  var worker = new Worker('./scripts/db_task.js');
  worker.onmessage = function(event) {
    console.log("Called back by the worker!\nHere is the mesage that worker sent: " + event.data);

  }
  worker.postMessages{cmd: 'sync', args: [], Date.now(), msg: "Trying to sync database"}

  return {
    init: function() {
      var appView = new AppView()
      var mcView = new McView()

    }
  }

})
