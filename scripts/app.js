/*
So we need to draw six times. Each time we draw two arc
*/

define(['jquery', 'underscore', 'backbone', 'buzz', 'localStorage'], function ($, _, Backbone, buzz) {
    "use strict";
    var VERSION_LEVEL = "0.1.0.6" //major.minor.patch.update_cache_clean_number
    var wantedSlot, wantedAngle, spinId = 0
    
    var appView, mcView, resultView, rewardStockCpView, winnerListView, Rewards, winners
    
    var rotatingResult

    var Roulette = function () {
        this.constant = 100 - ((Math.pow(100, 4) / 4 - 1 / 4) / (Math.pow(100, 3)) - 3 * (Math.pow(100, 3) / 3 - 1 / 3) / (Math.pow(100, 2)) + 3 * (Math.pow(100, 2) / 2 - 1 / 2) / (100))
        this.colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
            "#2E2C75", "#673A7E", "#CC0071", "#F80120",
            "#F35B20", "#FB9A00", "#FFCC00", "#FEF200"]
        this.subColors = ["#D8CCDA", "#EFE6F1", "#DEA460", "#AAA6AB",
            "#F891A4", "#DDDDB5", "#77EBEF", "#F9D6F4",
            "#A248D6", "#304890", "#A5CFDD", "#C92F81"]

        this.awards = this._awards = [
            {sku: 'ceenee_usb', name:"USB",chance:"45",amount:50, src: 'usb.png', w: 10}, 
            {sku: 'queen_hair_nail', name:"Queen's Hair",chance:"10",amount:3, src: '1queen.png', w: 90},
            {sku: 'ceenee_50', name:"CeeNee $50 Coupon",chance:"2",amount:20, src: 'ceenee_50.png',w: 30},
            {sku: 'ceenee_cutee', name:"CuTee",chance:"10",amount:5, src: 'cutee.jpg', w: 40},
            {sku: 'mt_body_work', name:"MienTay $200 Coupon",chance:"10",amount:1, src: '3bodywork.png',w: 50},
            {sku: 'ceenee_miniplus', name:"miniPlus",chance:"0",amount:0,src: 'miniplus.jpg', w: 60},
            {sku: 'ceenee_30', name:"CeeNee $30 Coupon",chance:"10",amount: 100, src: 'ceenee_30.jpg',w: 70},
            {sku: 'ceenee_beegee', name:"BeeGee",chance:"0",amount:0, src: 'beegee.jpg', w: 80},
            {sku: 'ceenee_20', name:"CeeNee $20 Coupon",chance:"60",amount:500, src: 'ceenee_20.png',w: 20},
            {sku: 'hungphat_usa', name:"Hung Phat",chance:"10",amount:0, src: '6hungphat.png',w: 100},
            {sku: 'ceenee_mini', name:"mini",chance:"5",amount:2, src: 'mini.jpg',w: 110},
            {sku: 'lee_coffee', name:"1 Coffee from Lee Sandwiches",chance:"23",amount:160, src: 'lee_coffee.png', w: 120},
            {sku: 'ceenee_sd', name:"SD",chance:"40",amount:50, src: 'sd.png', w: 10}, 
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

        this.drawInterval = 30; //redraw each this amount of ms 
        this.startAngle = 0;
        this.totalAngle = 0;
        this.arc = Math.PI / 6; 
        this.spinTimeout = null;

        this.spinArcStart = 10;
        this.spinTime = 0;
        this.spinTimeTotal = 0;
        this.count = 0;

        this.extraChance = [5, 10, 75]        

        this.wheelRadius = 500;
        this.canvas = document.getElementById("wheel");

        this.sound = {}
        this.sound.spin = new buzz.sound("resources/audio/spin", {
            formats: ["wav"],
            preload: true,
            autoplay: false,
            loop: true
        })
        this.sound.blah = new buzz.sound("resources/audio/blah", {
            formats: ["wav"],
            preload: true,
            autoplay: false,
            loop: false
        })
        this.sound.sorry = new buzz.sound("resources/audio/sad", {
            formats: ["wav"],
            preload: true,
            autoplay: false,
            loop: false
        })

        this.init = false
        this.loadResource()
    }
    
    /**
    Award collection. Each award contains name, amount,..
    When found no model then we dump definition data into collection. Also, when we bump up VERSION_LEVEL. We may
    repopulate data from definition
    @param a backbone collection
    */
    Roulette.prototype.setAwards = function (collection) {
      if (collection.length == 0 || localStorage.getItem('VERSION_LEVEL')!=VERSION_LEVEL) {
        collection.reset()
        localStorage.clear(function () {
          console && console.log('Clear local storage')  
        })
        localStorage.setItem('VERSION_LEVEL', VERSION_LEVEL)
        for (var i=0; i<this._awards.length; i++) {
          collection.create(this._awards[i])
        }        
      }
      this.awards = collection            
    }

    Roulette.prototype.loadResource = function () {
        (function () {
            for (var i = 0; i <= 11; i++) {
                this.avatars[i] = new Image();
                this.avatars[i].src = "assets/img/gift/" + (i + 1) + ".png";
            }
        }).call(this)      
        this.wheelImage = new Image()
        this.wheelImage.src = "assets/img/wheel.png"
    }

    /**
    Draw whole of background of the board and rotate an amount
    */
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
        
        var randomProb = Math.random() * 100
        console && console.log("RANDOM PROB: " + randomProb)
        var awards= this.awards
        var ceenee=0
          , totalC=0
          , totalS=0
          , totalE=0
          , extra = 0
          , five =0
        if (randomProb < 5)  {                                                                    //CeeNee Group --5%
          ceenee = Math.random() * 100
          console && console.log("CEENEE CASE: " + ceenee)
          totalC = 0;
          if (ceenee < (totalC += awards.at(7).get('chance')) && awards.at(7).get('amount') > 0) wantedSlot = 8            //BeeGee 0.1%  
          else if (ceenee < (totalC += awards.at(5).get('chance')) && awards.at(5).get('amount') > 0) wantedSlot = 6       //miniPlus 2%
          else if (ceenee < (totalC += awards.at(10).get('chance')) && awards.at(10).get('amount') > 0) wantedSlot = 11    //Mini 5%
          else if (ceenee < (totalC += awards.at(3).get('chance')) && awards.at(3).get('amount') > 0) wantedSlot = 4       //CuTee 10%
          else if (awards.at(1).get('amount') > 0) wantedSlot = 1                                              //USB 83%
        }            
        
        else if (randomProb < 15) {                                                               //Sponsor Group --10%          
          five = Math.random() * 100      
          console && console.log("COUPON CASE: " + five)
          totalS = 0;  
          if (five < (totalS += awards.at(2).get('chance')) && awards.at(2).get('amount') > 0) wantedSlot = 3              //AutoRepair 15%
          else if (five < (totalS += awards.at(4).get('chance')) && awards.at(4).get('amount') > 0) wantedSlot = 5          //BodyShop 15%
          else if (five < (totalS += awards.at(1).get('chance')) && awards.at(1).get('amount') > 0) wantedSlot = 2          //Queen's Hair 15%
          else if (five < (totalS += awards.at(9).get('chance')) && awards.at(9).get('amount') > 0) wantedSlot = 10       //HungPhat 15%
          else if (awards.at(7).get('amount') > 0) wantedSlot = 7                                               //Calendar 40%
        }         
        
        else {                                                                                    //Extra Group --85%
          extra = Math.random() * 100          
          console && console.log("EXTRA CASE: " + extra)
          totalE=0
          console && console.log(awards.at(9))
          console && console.log(awards.at(9).get('amount'))
          if (extra < (totalE += this.extraChance[0]) && awards.at(0).get('amount') > 0) wantedSlot = 1                                       //USB 5%          
          else if (extra < (totalE += this.extraChance[1]) && awards.at(6).get('amount') > 0) wantedSlot = 7                                 //Calendar 5%
          else if ( extra < (totalE += this.extraChance[2]) && awards.at(8).get('amount') > 0) wantedSlot = 9                                 //Pen 55%
          else  wantedSlot = 12                                                                       //Sorry  35%
        }

        var min = 30 * (12 - wantedSlot) + 8
        var max = 30 * (13 - wantedSlot) - 8
        wantedAngle = Math.random() * (max - min) + min;

        this.startAngle = 0;
        this.spinAngleStart = (wantedAngle) / (this.constant) + 360 * 2
        this.totalAngle = 0;
        this.count = 0;
        this.spinTime = 0;
        this.spinTimeTotal = 100
        this.rotateWheel();
        this.sound.spin.play();
    }

    Roulette.prototype.rotateWheel = function () {
        this.spinTime += 1; //1
        this.count += 1;
        if (this.spinTime >= this.spinTimeTotal) {
            this.stopRotateWheel()
            return this
        }
        var s = this,
            spinAngle = this.spinAngleStart - this.easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal);
        this.startAngle += (spinAngle * Math.PI / 180)
        this.totalAngle += this.startAngle
        this.draw();
        this.spinTimeout = setTimeout((function () {
            s.rotateWheel.call(s)
        }), this.drawInterval)
        return this
    }

    Roulette.prototype.stopRotateWheel = function () {
        this.sound.spin.stop()
        clearTimeout(this.spinTimeout)
        var degrees = this.startAngle * 180 / Math.PI
        var arcd = this.arc * 180 / Math.PI
        var index = Math.floor((360 - degrees % 360) / arcd);

        if (_.contains(this.congratItems, index)) {
            this.startAngle += (this.arc * 180) / Math.PI
        }
        console && console.log(this.startAngle + ". In degree = 0" + (this.startAngle * 180 / Math.PI))
        console && console.log(this.spinAngleStart + " is spin angle start in degree")

        this.ctx.save();
        this.ctx.font = 'bold 30px Helvetica, Arial';
        var m = this.awards.at(index)  
        var text = m.get('name')
        console && console.log(this.awards)
        console && console.log('Index is : ' + index)
        console && console.log('___________________________-' + spinId + '-_______________________________')
        console && console.log('-------------------------Verify info-------------------------')
        console && console.log('Reward: ' + text)
        console && console.log('Wanted Slot: ' + wantedSlot)
        console && console.log('Wanted Angle: ' + Math.round(wantedAngle) + ' deg')
        console && console.log('-----------------------Technical info------------------------')
        console && console.log('Last angle rotation: ' + (Math.round(this.startAngle * 180 / Math.PI) % 360) + ' deg')
        console && console.log('Error: ' + (wantedAngle - (this.startAngle * 180 / Math.PI) % 360) + ' deg')
        console && console.log('Total angle rotation: ' + (Math.round(this.totalAngle * 180 / Math.PI)) + ' deg')
        console && console.log('Total draw: ' + this.count)
        console && console.log('-------------------------------------------------------------')
        //this.ctx.fillText(text, this.wheelRadius - this.ctx.measureText(text).width / 2, this.wheelRadius + 100);
        m.won()        
        
        this.ctx.restore();
    }

    Roulette.prototype.easeOut = function (t, b, c, d) {
        var ts = (t / d) * (t / d);
        var tc = ts * t / d;
        return b + c * (tc + -3 * ts + 3 * t / d);
    }

  var RewardModel = Backbone.Model.extend({
      initialize: function () {
          this.on('change', function (model) {
            //do sth here when model changes data
          })
      }
      
      ,defaults: {
          name: 'New item',
          quantity: 1,
          chance: 0.2,
          weight: 1,
          src: ''
      }

      ,won : function () {
        rotatingResult.set({
          item: this.get('name')
          ,src: this.get('src')
          ,won: 'ceenee_sorry' === this.get('sku')? false:true
          ,forItem: this.get('id')
          ,rnd: Math.random() //to force a update o rotatingResult model
        })        
        this.set('amount', this.get('amount') - 1)
        this.save()
      }
  })

  var RewardCollection = Backbone.Collection.extend({
      localStorage: new Backbone.LocalStorage("reward") // Unique name within your app.
      ,model: RewardModel      
  })
  
  var ResultModel = Backbone.Model.extend({
    initialize: function () {
      
    }
    ,defaults: {
      item: ''
      ,src: ''
      ,won: false
    }
  })
  
  var AppView = Backbone.View.extend({
      el: '#playboard',
      playButton: $('button#spin'),

      initialize: function () {
        this.r = new Roulette();
        
        rotatingResult = new ResultModel()
        winners = new WinnerCollection()      

        Rewards = new RewardCollection
        Rewards.fetch()
        this.r.setAwards(Rewards)

        resultView = new ResultView({model: rotatingResult})
        rewardStockCpView = new RewardStockCpView({collection: Rewards})
        this.render()        
      },

      render: function () {
        this.r.draw();
      },

      events: {
          "click #spin": "doPlay",
          "hover #spin": "animatePlayButton"
      },

      doPlay: function () {
        this.r.spin();
      },

      animatePlayButton: function () {
          this.playButton.transform({
              rotate: 90
          })
      },

      resetData: function () {
        this.r.setAwards(Rewards)
      }

  })

  var ResultView = Backbone.View.extend({
    el: '#mc',
    template: _.template($('#tpl-result-board').html()),
    templateFail: _.template($('#tpl-result-board-fail').html()),

    render: function () {
      this.show()
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(winners, 'add', this.addOne)
      this.listenTo(winners, 'reset', this.addAll)
      winners.fetch()
    },

    show: function () {
      if (true===this.model.get('won')) {
        appView.r.sound.blah.play()
        $('.content', this.$el).html(this.template(this.model.toJSON()))                    
      } else {
        appView.r.sound.sorry.play()
        $('.content', this.$el).html(this.templateFail(this.model.toJSON()))                    
      }
      this.$el.slideDown('slow')
    },

    hide: function () {
      this.$el.slideUp().hide()
    },

    events : {
      'click .close-board' : 'hide',
      'click .new-winner'  : 'createWinner'
    },

    createWinner : function () {
      winners.create({
        name:  $('.winner-name', this.$el).val(),
        phone: $('.winner-phone', this.$el).val(),
        item:  this.model.get('name')
      })  
      $('.winner-name', this.$el).val('')
      $('.winner-phone', this.$el).val('')
      this.$el.slideUp().hide()
    },

    addOne : function (winner) {
      var view = new WinnerView({model: winner})
      view.render()
      console.log(view.el)
      $('tbody', '#winner-list').append(view.el)
    },

    addAll: function () {
      console.log(winners)
      winners.each(this.addOne, this)
    }

  })

  var RewardStockCpView = Backbone.View.extend({
    el: '#reward-stock-cp',
    template: _.template($('#tpl-reward-stock').html()),

    render: function () {
      $('.modal-body tbody', this.$el).html(this.template({rewards: this.collection.toJSON()}))
    }, 

    initialize: function () {
      this.listenTo(this.collection, 'change', this.render)
      this.render()
    },

    events: {
      'click .action-save': 'doSave',
      'click .action-reset': 'doReset'
    }

    ,doSave: function (e) {
      var index =  $(e.target).data('id')
      var m = this.collection.at(index)
      m.set({
        name:    $('.item-name', this.$el).eq(index).val()
        ,amount: $('.item-amount', this.$el).eq(index).val()
        ,src:    $('.item-src', this.$el).eq(index).val()
      })
      m.save()
    }

    ,doReset: function (e) {
      VERSION_LEVEL = "reset-flag-" + Math.random
      appView.resetData()  
    }

  })

  var WinnerModel = Backbone.Model.extend({
    initialize: function () {
    
    }
      
    ,defaults: {
      name: 'Winner Name',
      item: 1,
      phone: ''
    }    
  })

  var WinnerCollection = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage("winner") // Unique name within your app.
    ,model: WinnerModel
  })
  
  var WinnerView = Backbone.View.extend({
    tagName: "tr",
    template: _.template($('#tpl-winner-item').html()),

    initialize: function () {
      
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()))
      return this
    }
   
  })

  return {
    init: function () {
      appView = new AppView()      
    }
  }

})
