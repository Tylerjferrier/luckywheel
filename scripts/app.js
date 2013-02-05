/*
So we need to draw six times. Each time we draw two arc
*/

define(['jquery', 'underscore', 'backbone', 'buzz', 'localStorage'], function ($, _, Backbone, buzz) {
    "use strict";

    var wantedSlot, wantedAngle, spinId = 0
    
    var appView, mcView, resultView

    var Roulette = function () {
        this.constant = 100 - ((Math.pow(100, 4) / 4 - 1 / 4) / (Math.pow(100, 3)) - 3 * (Math.pow(100, 3) / 3 - 1 / 3) / (Math.pow(100, 2)) + 3 * (Math.pow(100, 2) / 2 - 1 / 2) / (100))
        this.colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
            "#2E2C75", "#673A7E", "#CC0071", "#F80120",
            "#F35B20", "#FB9A00", "#FFCC00", "#FEF200"]
        this.subColors = ["#D8CCDA", "#EFE6F1", "#DEA460", "#AAA6AB",
            "#F891A4", "#DDDDB5", "#77EBEF", "#F9D6F4",
            "#A248D6", "#304890", "#A5CFDD", "#C92F81"]

        this.awards = [
            {sku: 'ceenee_usb', name:"USB",chance:"83",amount:50, src: 'ceenee.png', w: 10}, 
            {sku:     'mt_pen', name:"MienTay Pen",chance:"70",amount:500, w: 20},
            {sku: 'mt_auto_repair', name:"AutoRepair Coupon",chance:"15",amount:2, w: 30},
            {sku: 'ceenee_cutee', name:"CuTee",chance:"10",amount:5, w: 40},
            {sku: 'mt_body_work', name:"Bodyshop Coupon",chance:"15",amount:3, w: 50},
            {sku: 'ceenee_miniplus', name:"miniPlus",chance:"2",amount:1, w: 60},
            {sku: 'mt_calendar', name:"Calendar",chance:"40",amount:20, w: 70},
            {sku: 'ceenee_beegee', name:"BeeGee",chance:"0.1",amount:1, w: 80},
            {sku: 'queen_hair_nail', name:"Queen's Hair",chance:"15",amount:3, w: 90},
            {sku: 'hungphat_usa', name:"Hung Phat",chance:"15",amount:2, w: 100},
            {sku: 'ceenee_mini', name:"mini",chance:"5",amount:2, w: 110},
            {sku: 'ceenee_sorry', name:"Sorry",chance:"20",amount:999999, w: 120}
        ]
        
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

        this.drawInterval = 50; //redraw each this amount of ms 
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
        this.init = false
        this.loadResource()
    }
    var i = 99;    
    Roulette.prototype.setAwards = function (collection) {
      console.log(collection.length)
      
      if (collection.length == 0) {
        for (var i=0; i<this.awards.length; i++) {
          collection.create(this.awards[i])
        }        
      }
      this.awards = collection      
      console.log(collection)
      console.log(this.awards)
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
        
        ctx.rotate(angle )          

        ctx.drawImage(this.wheelImage, -500, -500, 1000, 1000)

        ctx.restore()
    }

    Roulette.prototype.draw = function () {
        var canvas = this.canvas
        if (canvas.getContext) {
            this._drawBoard()        
        }
    }

    Roulette.prototype.spin = function () {
        spinId += 1;
        
        var randomProb = Math.random() * 100;
        var awards= this.awards
        if (randomProb < 5)  {                                                                    //CeeNee Group --5%
          var ceenee = Math.random() * 100
          var totalC = 0;
          if (ceenee < (totalC += awards.at(8).get('chance')) && awards.at(8).get('amount') > 0) wantedSlot = 8            //BeeGee 0.1%  
          else if (ceenee < (totalC += awards.at(6).get('chance')) && awards.at(6).get('amount') > 0) wantedSlot = 6       //miniPlus 2%
          else if (ceenee < (totalC += awards.at(11).get('chance')) && awards.at(11).get('amount') > 0) wantedSlot = 11    //Mini 5%
          else if (ceenee < (totalC += awards.at(4).get('chance')) && awards.at(4).get('amount') > 0) wantedSlot = 4       //CuTee 10%
          else if (awards.at(1).get('amount') > 0) wantedSlot = 1                                              //USB 83%
        }            
        
        else if (randomProb < 15) {                                                               //Sponsor Group --10%          
          var five = Math.random() * 100      
          var totalS = 0;  
          if (five < (totalS += awards.at(3).get('chance')) && awards.at(3).get('amount') > 0)wantedSlot = 3              //AutoRepair 15%
          else if (five < (totalS += awards.at(5).get('chance')) && awards.at(5).get('amount') > 0) wantedSlot = 5          //BodyShop 15%
          else if (five < (totalS += awards.at(9).get('chance')) && awards.at(9).get('amount') > 0) wantedSlot = 9          //Queen's Hair 15%
          else if (five < (totalS += awards.at(10).get('chance')) && awards.at(10).get('amount') > 0) wantedSlot = 10       //HungPhat 15%
          else if (awards.at(7).get('amount') > 0) wantedSlot = 7                                               //Calendar 40%
        }         
        
        else {                                                                                    //Extra Group --85%
          var extra = Math.random() * 100          
          if (extra < 5 && awards.at(1).get('amount') > 0) wantedSlot = 1                                       //USB 5%          
          else if (extra < 10 && awards.at(7).get('amount') > 0) wantedSlot = 7                                 //Calendar 5%
          else if (extra < 65 && awards.at(2).get('amount') > 0) wantedSlot = 2                                 //Pen 55%
          else  wantedSlot = 12                                                                       //Sorry  35%
        }

        var min = 30 * (12 - wantedSlot) + 8
        var max = 30 * (13 - wantedSlot) - 8
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
        var degrees = this.startAngle * 180 / Math.PI
        var arcd = this.arc * 180 / Math.PI
        var index = Math.floor((360 - degrees % 360) / arcd);

        if (_.contains(this.congratItems, index)) {
            this.startAngle += (this.arc * 180) / Math.PI
        }
        console.log(this.startAngle + ". In degree = 0" + (this.startAngle * 180 / Math.PI))
        console.log(this.spinAngleStart + " is spin angle start in degree")

        this.ctx.save();
        this.ctx.font = 'bold 30px Helvetica, Arial';
        var m = this.awards.at(index)  
        var text = m.get('name')
        console.log(this.awards)
        console.log('Index is : ' + index)
        console.log('___________________________-' + spinId + '-_______________________________')
        console.log('-------------------------Verify info-------------------------')
        console.log('Reward: ' + text)
        console.log('Wanted Slot: ' + wantedSlot)
        console.log('Wanted Angle: ' + Math.round(wantedAngle) + ' deg')
        console.log('-----------------------Technical info------------------------')
        console.log('Last angle rotation: ' + (Math.round(this.startAngle * 180 / Math.PI) % 360) + ' deg')
        console.log('Error: ' + (wantedAngle - (this.startAngle * 180 / Math.PI) % 360) + ' deg')
        console.log('Total angle rotation: ' + (Math.round(this.totalAngle * 180 / Math.PI)) + ' deg')
        console.log('Total draw: ' + this.count)
        console.log('-------------------------------------------------------------')
        //this.ctx.fillText(text, this.wheelRadius - this.ctx.measureText(text).width / 2, this.wheelRadius + 100);
        
        m.set('amount', m.get('amount') - 1)
        
        this.ctx.restore();
    }

    Roulette.prototype.easeOut = function (t, b, c, d) {
        var ts = (t / d) * (t / d);
        var tc = ts * t / d;
        return b + c * (tc + -3 * ts + 3 * t / d);
    }


  var r = new Roulette();

  var RewardModel = Backbone.Model.extend({
      initialize: function () {
          console.log('Add a new award')
          this.on('change', function (model) {
            console.log('Wonnnn')
            model.won()    
          })
      }
      ,defaults: {
          name: 'New item',
          quantity: 1,
          chance: 0.2,
          weight: 1
      }
      ,won : function () {
        this.quantity = this.quantity -1
        this.save
      }
  })

  var RewardCollection = Backbone.Collection.extend({
      localStorage: new Backbone.LocalStorage("reward") // Unique name within your app.
      ,model: RewardModel      
  })
  var Rewards = new RewardCollection
  Rewards.fetch()
  r.setAwards(Rewards)

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

      //When use won an item
      //Show and render result board
      ,win: function () {

      },

      //When use fail, show sorry screen
      sorry: function () {

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

  var ResultView = Backbone.View.extend({
    el: '#reward-stock-cp',
    template: _.template($('#tpl-result-board').html()),

    render: function () {
      this.$el.html(this.template(this.model.toJSON()))
    },

    initialize: function () {
      
    },

    show: function () {

    },

    hide: function () {

    }

  })

  // Disable for now. May be use later. WIP
  // var worker = new Worker('./scripts/db_task.js');
  // worker.onmessage = function (event) {
  //     console.log("Called back by the worker!\nHere is the mesage that worker sent: " + event.data);
  // }
  //worker.postMessages{cmd: 'sync', args: [], Date.now(), msg: "Trying to sync database"}

  return {
    _initDb: function () {

    }
    ,init: function () {
      appView = new AppView()
      mcView = new McView()
      resultView = new ResultView();

    }
  }

})