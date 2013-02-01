/*
So we need to draw six times. Each time we draw two arc
*/
define(['jquery', 'underscore', 'backbone', 'buzz'], function ($, _, Backbone, buzz) {
    console.log('Check if loaded');
    console.log($);
    console.log(_);
    console.log(Backbone);
    console.log(buzz);

    var wantedSlot;
    var wantedAngle;
    var spinId = 0;

    //Parse.initialize("1zzAMVXIJK6AZoxdKetSHXhXS7IVEJxOb5Vh1dqF", "VqN2jIE1EZTZ3EzHS9NLT71i4oSKI9JeEtYek3Yz");

    var Roulette = function () {
        this.constant = 100 - ((Math.pow(100, 4) / 4 - 1 / 4) / (Math.pow(100, 3)) - 3 * (Math.pow(100, 3) / 3 - 1 / 3) / (Math.pow(100, 2)) + 3 * (Math.pow(100, 2) / 2 - 1 / 2) / (100))
        console.log(this.constant)
        this.colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
            "#2E2C75", "#673A7E", "#CC0071", "#F80120",
            "#F35B20", "#FB9A00", "#FFCC00", "#FEF200"]
        this.subColors = ["#D8CCDA", "#EFE6F1", "#DEA460", "#AAA6AB",
            "#F891A4", "#DDDDB5", "#77EBEF", "#F9D6F4",
            "#A248D6", "#304890", "#A5CFDD", "#C92F81"]

        this.awards = ["CeeNee", "Pen", "GoodLuck", "CuTee",
            "Body", "MiniPlus", "Calendar", "BeeGee",
            "Queen", "HungPhat", "Mini", "Sorry"];
        this.percent = [10, 75, 10, 5, 10, 1, 20, 0.1, 10, 10, 2, 100] //just to show                 
        this.amount = [50, 500, 2, 5, 3, 1, 20, 1, 3, 2, 2, 10000]
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
            "assets/img/gift/12.png"]

        this.drawInterval = 60; //redraw each this amount of ms 
        this.startAngle = 0;
        this.totalAngle = 0;
        this.arc = Math.PI / 6;
        this.spinTimeout = null;

        this.spinArcStart = 10;
        this.spinTime = 0;
        this.spinTimeTotal = 0;
        this.count = 0;

        this.wheelRadius = 500;
        this.canvas = document.getElementById("wheel");

        this.sound = new buzz.sound("resources/audio/spin", {
            formats: ["wav"],
            preload: true,
            autoplay: false,
            loop: true
        })

        this.loadResource()
    }

    Roulette.prototype.loadResource = function () {
        (function () {
            for (var i = 0; i <= 11; i++) {
                this.avatars[i] = new Image();
                this.avatars[i].src = "assets/img/gift/" + (i + 1) + ".png";
            }
        }).call(this)
        //console.log(this.avatars);      
        this.wheelImage = new Image()
        this.wheelImage.src = "assets/img/wheel.png"
    }

    Roulette.prototype._drawBoard = function () {
        var canvas = this.canvas,
            ctx = this.ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 2 * this.wheelRadius, 2 * this.wheelRadius);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        var angle = this.startAngle + 0 * this.arc //in radian
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(angle + this.arc / 2 + Math.PI / 2)
        ctx.drawImage(this.wheelImage, -500, -500, 1000, 1000)

        ctx.restore()
    }

    Roulette.prototype.draw = function () {
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
    }

    Roulette.prototype.spin = function () {
        spinId += 1;
        // this.spinAngleStart = Math.random() * 10 + 10;
        var randomProb = Math.random() * 100;
        if (randomProb < 0.1) wantedSlot = 2 //BeeGee 0.1%
        else if (randomProb < 1) wantedSlot = 4 //MiniPlus 1%
        else if (randomProb < 2) wantedSlot = 11 //Mini 2%
        else if (randomProb < 5) wantedSlot = 6 //CuTee 5%
        else if (randomProb < 10) { //10% chance for CeeNee, GoodLuck, Body, Queen and HungPhat
            var five = Math.random() * 4 + 1
            if (Math.floor(five) === 1) wantedSlot = 9 //CeeNee 10%
            else if (Math.floor(five) === 2) wantedSlot = 7 //GoodLuck 10%
            else if (Math.floor(five) === 3) wantedSlot = 5 //Body 10%
            else if (Math.floor(five) === 4) wantedSlot = 1 //Queen 10%
            else if (Math.floor(five) === 5) wantedSlot = 12 //HungPhat 10%
        } else if (randomProb < 20) wantedSlot = 3 //Calendar 20%
        else if (randomProb < 75) wantedSlot = 8 //Pen 75%
        else wantedSlot = 10 //Sorry    

        var min = 30 * (wantedSlot - 1) + 5
        var max = 30 * wantedSlot - 5
        wantedAngle = Math.random() * (max - min) + min;


        this.startAngle = 0;
        this.spinAngleStart = (wantedAngle) / (this.constant) + 360 * 4
        this.totalAngle = 0;
        this.count = 0;
        // console.log(this.spinAngleStart)    
        this.spinTime = 0;
        // this.spinTimeTotal = Math.random() * 3 + 4 * 1000;
        this.spinTimeTotal = 100
        this.rotateWheel();
        this.sound.play();
    }

    Roulette.prototype.rotateWheel = function () {
        this.spinTime += 1;
        this.count += 1;
        if (this.spinTime >= this.spinTimeTotal) {
            this.stopRotateWheel()
            return this
        }
        var s = this,
            spinAngle = this.spinAngleStart - this.easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal);
        // spinAngle = spinAngle + 
        this.startAngle += (spinAngle * Math.PI / 180)
        this.totalAngle += this.startAngle
        // console.log(this.startAngle)
        this.draw();
        this.spinTimeout = setTimeout((function () {
            s.rotateWheel.call(s)
        }), this.drawInterval)
        return this
    }

    Roulette.prototype.stopRotateWheel = function () {
        this.sound.stop()
        clearTimeout(this.spinTimeout)
        var degrees = this.startAngle * 180 / Math.PI + 90
        var arcd = this.arc * 180 / Math.PI
        var index = Math.floor((360 - degrees % 360) / arcd);

        if (_.contains(this.congratItems, index)) {
            this.startAngle += (this.arc * 180) / Math.PI
        }
        console.log(this.startAngle + ". In degree = 0" + (this.startAngle * 180 / Math.PI))
        console.log(this.spinAngleStart + " is spin angle start in degree")

        this.ctx.save();
        this.ctx.font = 'bold 30px Helvetica, Arial';
        var text = this.awards[index]
        console.log('___________________________-' + spinId + '-_______________________________')
        console.log('-------------------------Verify info-------------------------')
        console.log('Reward: ' + this.awards[index])
        console.log('Wanted Slot: ' + wantedSlot)
        console.log('Wanted Angle: ' + Math.round(wantedAngle) + ' deg')
        console.log('-----------------------Technical info------------------------')
        console.log('Last angle rotation: ' + (Math.round(this.startAngle * 180 / Math.PI) % 360) + ' deg')
        console.log('Error: ' + (wantedAngle - (this.startAngle * 180 / Math.PI) % 360) + ' deg')
        console.log('Total angle rotation: ' + (Math.round(this.totalAngle * 180 / Math.PI)) + ' deg')
        console.log('Total draw: ' + this.count)
        this.ctx.fillText(text, this.wheelRadius - this.ctx.measureText(text).width / 2, this.wheelRadius + 100);
        this.ctx.restore();
    }

    Roulette.prototype.easeOut = function (t, b, c, d) {
        var ts = (t / d) * (t / d);
        var tc = ts * t / d;
        return b + c * (tc + -3 * ts + 3 * t / d);
    }




  var r = new Roulette();

  var Award = Backbone.Model.extend({
      initialize: function () {
          console.log('Add a new award')
      },
      defaults: {
          name: 'New item',
          quantity: 1,
          chance: 0.2
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

      render: function () {
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

  })

  var McView = Backbone.View.extend({
      el: '#playboard > #mc',

      message: 'Welcome...',

      initialize: function () {
          this.render()
      },

      render: function () {
          this.$el.html(this.message)
      }

  })

  var worker = new Worker('./scripts/db_task.js');
  worker.onmessage = function (event) {
      console.log("Called back by the worker!\nHere is the mesage that worker sent: " + event.data);

  }
  //worker.postMessages{cmd: 'sync', args: [], Date.now(), msg: "Trying to sync database"}

  return {
      init: function () {
          var appView = new AppView()
          var mcView = new McView()

      }
  }

})