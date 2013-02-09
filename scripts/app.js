/*
So we need to draw six times. Each time we draw two arc
*/

define(['jquery', 'underscore', 'backbone', 'buzz', 'localStorage',  'transform', 'easing', 'bootstrap'], function ($, _, Backbone, buzz) {
    "use strict";
    var VERSION_LEVEL = "0.1.0.6" //major.minor.patch.update_cache_clean_number
    var wantedSlot, wantedAngle, spinId = 0
    
    var appView, mcView, resultView, rewardStockCpView, winnerListView, Rewards, winners
    
    var rotatingResult

    var definedSlot = 13

    var Roulette = function () {
        this.constant = 100 - ((Math.pow(100, 4) / 4 - 1 / 4) / (Math.pow(100, 3)) - 3 * (Math.pow(100, 3) / 3 - 1 / 3) / (Math.pow(100, 2)) + 3 * (Math.pow(100, 2) / 2 - 1 / 2) / (100))
        this.colors = ["#B8D430", "#3AB745", "#029990", "#3501CB",
            "#2E2C75", "#673A7E", "#CC0071", "#F80120",
            "#F35B20", "#FB9A00", "#FFCC00", "#FEF200"]
        this.subColors = ["#D8CCDA", "#EFE6F1", "#DEA460", "#AAA6AB",
            "#F891A4", "#DDDDB5", "#77EBEF", "#F9D6F4",
            "#A248D6", "#304890", "#A5CFDD", "#C92F81"]

        this.awards = this._awards = [
            {pt: 0, sku: 'ceenee_usb', name:"USB",chance:50,amount:50, src: 'usb.png', w: 10}, 
            {pt: 1, sku: 'queen_hair_nail', name:"Queen's Hair",chance:10,amount:3, src: '1queen.png', w: 90},
            {pt: 2, sku: 'ceenee_30', name:"CeeNee $30 Coupon",chance:30,amount:200, src: 'ceenee_30.png',w: 30},
            {pt: 3, sku: 'ceenee_cutee', name:"CuTee",chance:4,amount:2, src: 'cutee.jpg', w: 40},
            {pt: 4, sku: 'mt_coupon', name:"MienTay Coupon",chance:10,amount:3, src: 'mientay.png',w: 50
              ,inner_gift: [
                {amount: 1, name: '$100 off coupon'}, 
                {amount: 2, name: '$200 off coupon'}, 
                {amount: 3, name: '$300 off coupon'}
              ]
            },
            {pt: 5, sku: 'ceenee_miniplus', name:"miniPlus",chance:0,amount:0,src: 'miniplus.jpg', w: 60},
            {pt: 6, sku: 'ceenee_50', name:"CeeNee $50 Coupon",chance:15,amount: 40, src: 'ceenee_50.png',w: 70},
            {pt: 7, sku: 'ceenee_beegee', name:"BeeGee",chance:0,amount:0, src: 'beegee.jpg', w: 80},
            {pt: 8, sku: 'ceenee_20', name:"CeeNee $20 Coupon",chance:30,amount:120, src: 'ceenee_20.png',w: 20},
            {pt: 9, sku: 'statefarm', name:"Tina Vu StateFarm's Prize",chance:10,amount:4, src: 'tinavu.png',w: 100
             ,inner_gift: [
                {amount: 1, name: 'iPod Shuffle'}, 
                {amount: 1, name: 'Lucky Japanese Cat'}, 
                {amount: 1, name: ' iPhone 4 Docking Station'}
              ] 
            },
            {pt: 10, sku: 'ceenee_mini', name:"mini",chance:2,amount:2, src: 'mini.jpg',w: 110},
            {pt: 11, sku: 'lee_coffee', name:"Coffee from Lee Sandwiches",chance:50,amount:155, src: 'lee_coffee.png', w: 120},            
            {pt: 12, sku: 'hightech_dental', name:"High Tech Dental Coupon!!", chance:10, amount:10, src: 'htcare.png', w:0},
            {pt: 13, sku: 'ceenee_sd', name:"SD",chance:44,amount:50, src: 'sd.png', w: 10},
            {pt: 14, sku: 'lee_financial', name: "Lee Tax &amp; Financial Coupon", chance:10,amount:56, src:'lee_financial.png', w:0}
        ]

        this.extraChance = [2.5, 2.5, 20]   //SD , USB , Lee 
        
        this.drawInterval = 30; //redraw each this amount of ms 
        this.startAngle = 0;
        this.totalAngle = 0;
        this.arc = 2*Math.PI / 15; 
        this.spinTimeout = null;

        this.spinArcStart = 10;
        this.spinTime = 0;
        this.spinTimeTotal = 0;
        this.count = 0;

            

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
        // (function () {
        //     for (var i = 0; i <= 11; i++) {
        //         this.avatars[i] = new Image();
        //         this.avatars[i].src = "assets/img/gift/" + (i + 1) + ".png";
        //     }
        // }).call(this)      
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
        //$('body').css({backgroundImage: ()"})

        var randomProb = Math.random() * 100        
        var awards= this.awards
        var ceenee=0
          , totalC=0
          , totalS=0
          , totalE=0
          , extra = 0
          , five =0
        var sumCeeNee  =  awards.at(7).get('amount')    //beegee
                        + awards.at(5).get('amount')    //miniPlus
                        + awards.at(10).get('amount')   //mini
                        + awards.at(3).get('amount')    //cuTee
                        + awards.at(0).get('amount')    //USB
                        + awards.at(13).get('amount')   //SD
        // console.log("Sum CeeNee: " + sumCeeNee)                        
        var sumSponsor =  awards.at(1).get('amount')    //queen
                        + awards.at(4).get('amount')    //mientay
                        + awards.at(11).get('amount')   //lee
                        + awards.at(9).get('amount')    //statefarm           
        // console.log("Sum Sponsor: " + sumSponsor) 
        console && console.log("RANDOM PROB: " + randomProb)
        if (randomProb < 5 && sumCeeNee > 0)  {                                                                    //CeeNee Group --10%
          ceenee = Math.random() * 100
          console && console.log("CEENEE CASE: " + ceenee)
          totalC = 0;
          if (ceenee < (totalC += parseInt(awards.at(7).get('chance'))) && parseInt(awards.at(7).get('amount')) > 0) wantedSlot = 8            //BeeGee 0%  
          else if (ceenee < (totalC += parseInt(awards.at(5).get('chance'))) && parseInt(awards.at(5).get('amount')) > 0) wantedSlot = 6       //miniPlus 0%
          else if (ceenee < (totalC += parseInt(awards.at(10).get('chance'))) && parseInt(awards.at(10).get('amount')) > 0) wantedSlot = 11    //Mini 5%
          else if (ceenee < (totalC += parseInt(awards.at(3).get('chance'))) && parseInt(awards.at(3).get('amount')) > 0) wantedSlot = 4       //CuTee 10%
          else if (ceenee < (totalC += parseInt(awards.at(0).get('chance'))) && parseInt(awards.at(0).get('amount')) > 0) wantedSlot = 1       //USB 45%
          else if (awards.at(13).get('amount') > 0) wantedSlot = 14                                                                            //SD 40%
        }                  
        else if (randomProb < 15 && sumSponsor > 0) {                                                               //Sponsor Group --20%          
          five = Math.random() * 100      
          console && console.log("COUPON CASE: " + five)
          totalS = 0;  
          if (five < (totalS += parseInt(awards.at(1).get('chance'))) && parseInt(awards.at(1).get('amount')) > 0) wantedSlot = 2               //Queen's Hair 10%
          else if (five < (totalS += parseInt(awards.at(4).get('chance'))) && parseInt(awards.at(4).get('amount')) > 0) wantedSlot = 5          //BodyShop 10%
          else if (five < (totalS += parseInt(awards.at(9).get('chance'))) && parseInt(awards.at(9).get('amount')) > 0) wantedSlot = 10         //StateFarm 10%
          else if (five < (totalS += parseInt(awards.at(14).get('chance'))) && parseInt(awards.at(14).get('amount')) > 0) wantedSlot = 15       //Lee Finan 10%          
          else if (parseInt(awards.at(11).get('amount')) > 0) wantedSlot = 12                                                         //Lee 60%
        }                 
        else {                                                                                                      //Extra Group --70%
          extra = Math.random() * 100          
          console && console.log("EXTRA CASE: " + extra)
          totalE=0
          if (extra < (totalE += parseInt(this.extraChance[0])) && parseInt(awards.at(13).get('amount')) > 0) wantedSlot = 14                    //SD 2.5%          
          else if (extra < (totalE += parseInt(this.extraChance[1])) && parseInt(awards.at(0).get('amount')) > 0) wantedSlot = 1                 //USB 2.5%
          else if ( extra < (totalE += parseInt(this.extraChance[2])) && parseInt(awards.at(11).get('amount')) > 0) wantedSlot = 12              //Lee 20%
          else if (extra < (totalE += parseInt(awards.at(6).get('chance'))) && parseInt(awards.at(6).get('amount')) > 0) wantedSlot = 7          //Ceenee $50- 15%
          else if (extra < (totalE += parseInt(awards.at(2).get('chance'))) && parseInt(awards.at(2).get('amount')) > 0) wantedSlot = 3          //Ceenee $30- 30%
          else if (extra < (totalE += parseInt(awards.at(8).get('chance'))) && parseInt(awards.at(8).get('amount')) > 0) wantedSlot = 9          //Ceenee $20- 30%
          else wantedSlot = definedSlot                         
        }
        // console.log("TotalC is: " + totalC)
        // console.log("TotalS is: " + totalS)
        // console.log("TotalE is: " + totalE)
        // wantedSlot = 11             /*Test wantedSlot*/
         
        var min = (2*180/15)* (15 - wantedSlot) +8
        var max = (2*180/15)* (16 - wantedSlot) -8
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
        // console && console.log('Index is : ' + index)
        console && console.log('___________________________-' + spinId + '-_______________________________')
        console && console.log('-------------------------Verify info-------------------------')
        console && console.log('Reward: ' + text)
        console && console.log('Wanted Slot: ' + wantedSlot)
        // console && console.log('Wanted Angle: ' + Math.round(wantedAngle) + ' deg')
        // console && console.log('-----------------------Technical info------------------------')
        // console && console.log('Last angle rotation: ' + (Math.round(this.startAngle * 180 / Math.PI) % 360) + ' deg')
        // console && console.log('Error: ' + (wantedAngle - (this.startAngle * 180 / Math.PI) % 360) + ' deg')
        // console && console.log('Total angle rotation: ' + (Math.round(this.totalAngle * 180 / Math.PI)) + ' deg')
        // console && console.log('Total draw: ' + this.count)
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
        var innerGift, innerRewardIndex;
        if (this.get('inner_gift')) {
          innerGift = this.get('inner_gift')

          do {
            innerRewardIndex = Math.round(Math.random() * (innerGift.length-1))          
          } while (innerGift[innerRewardIndex].amount<=0)

          innerGift[innerRewardIndex].amount = innerGift[innerRewardIndex].amount-1
          this.set('inner_gift', innerGift)

          rotatingResult.set({
            item: innerGift[innerRewardIndex].name
            ,src: this.get('src')            
            ,won: 'ceenee_sorry' === this.get('sku')? false:true
            ,forItem: this.get('id')
            ,rnd: Math.random() //to force a update o rotatingResult model
          })

        } else {          
          rotatingResult.set({
            item: this.get('name')
            ,src: this.get('src')
            ,won: 'ceenee_sorry' === this.get('sku')? false:true
            ,forItem: this.get('id')
            ,rnd: Math.random() //to force a update o rotatingResult model
          })  
        }        
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
      this.$el.slideDown({
        duration: 600,
        easing: 'easeOutBounce'
      })
    },

    hide: function () {
      //Stop sound instantly when closing the board
      appView.r.sound.blah.stop()
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
      $('tbody', '#winner-list').append(view.el)
    },

    addAll: function () {
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
        ,amount: parseInt($('.item-amount', this.$el).eq(index).val())
        ,chance: parseInt($('.item-chance', this.$el).eq(index).val())
        ,src:    $('.item-src', this.$el).eq(index).val()
      })
      m.save()
    }

    ,doReset: function (e) {
      VERSION_LEVEL = "reset-flag-" + Math.random()
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
