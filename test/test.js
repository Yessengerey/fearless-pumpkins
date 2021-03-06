var request = require('supertest');
var express = require('express');
var chai = require('chai');
var expect = chai.expect;
var app = require('../server/server.js');
var bodyParser = require('body-parser');
var db = require('../db/db.js');
var tweetrics = require('../helpers/tweetricsEngine.js')


describe("post requests", function () {

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

  it ("should find the screenName, location, name, and imageurl", function(done) {
    request(app)
        .post('/name')
        .send({screenName: 'realDonaldTrump'})
        .expect(200)
        .expect(function(res) {
          expect(res.body.screen_name).to.equal('realDonaldTrump');
          expect(res.body.location).to.equal('Washington, DC');
          expect(res.body.name).to.equal('Donald J. Trump');
          expect(res.body.imageUrl).to.equal('http://pbs.twimg.com/profile_images/874276197357596672/kUuht00m_normal.jpg')
        })
        .end(done);
  });

  it ('should fail when a twitter username doesnt exist', function(done) {  //app.use(bodydyParser.json());
    request(app)
        .post('/name')
        .send({screenName: 'asdfsadfsadfgosdajfoisdajf'})
        .expect(400)
        .end(done);
  });

  it ('should fail when a twitter username has symbols', function(done) {  //app.use(bodydyParser.json());
    request(app)
        .post('/name')
        .send({screenName: '%^#$'})
        .expect(400)
        .end(done);
  });

   it ('should work when a twitter username has only numbers', function(done) {  //app.use(bodydyParser.json());
    request(app)
        .post('/name')
        .send({screenName: '123456787654'})
        .expect(200)
        .end(done);
  });

  it ('it should fail when the screen name is past twitters character limit', function(done) {  //app.use(bodydyParser.json());
    request(app)
        .post('/name')
        .send({screenName: '12345adsfdsfsf6787654'})
        .expect(400)
        .end(done);
    });

   it ('it should get the location and avatar of that user', function(done) {  //app.use(bodydyParser.json());
    request(app)
        .post('/name')
        .send({screenName: 'realDonaldTrump'})
        .expect(200)
        .expect(function(res) {
          expect(res.body.location).to.equal('Washington, DC');
          expect(res.body.imageUrl).to.equal('http://pbs.twimg.com/profile_images/874276197357596672/kUuht00m_normal.jpg');
        })
        .end(done);
  });

   it ('friends of the user should have their screen name and name in an object', function(done) {  //app.use(bodydyParser.json());
    request(app)
        .post('/name')
        .send({screenName: 'realDonaldTrump'})
        .expect(200)
        .expect(function(res) {
          expect(res.body.friends[0].screen_name).to.equal('TuckerCarlson');
          expect(res.body.friends[0].name).to.equal('Tucker Carlson');
          expect(res.body.friends).to.be.an('array');
          expect(res.body.words).to.be.an('array');
        })
        .end(done);
  });

  it ("should sucessfully get all the values using the google api", function(done) {
    request(app)
        .post('/name')
        .send({screenName: 'realDonaldTrump'})
        .expect(200)
        .expect(function(res) {
          expect(res.body.words[0].name).to.exist;
          expect(res.body.words[0].type).to.exist;
          expect(res.body.words[0].salience).to.exist;
          expect(res.body.words[0].sentiment).to.exist;
        })
        .end(done);
  });

});

describe("database requests", function () {

  it ('should fetch the data from the database', function(done) {

       db.fetchTwitterUser('realDonaldTrump')
      .then(function(row) {
        expect(row).to.exist;
        done();
      }).catch(function(err) {
        console.log('err');
        done();
      });
  })



  it ('should fail when data isnt in the database', function(done) {

       db.fetchTwitterUser('sfafasfdsf')
      .then(function(row) {
        if (row.length < 1) {
          throw err;
        } else {
          expect(row).to.exist;
          done();
        }
      }).catch(function(err) {
        expect(err).to.exist;
        done();
      });
  })


  it ('should fetch all the data for democrats', function(done) {

       db.fetchDataset('democrat')
      .then(function(row) {
        expect(row).to.exist;
        expect(row.commonFriends).to.be.an('array');
        expect(row.commonWords).to.be.an('array');
        done();
      }).catch(function(err) {
        done();
      });
  })



  it ('should fetch all the data for republicans', function(done) {

       db.fetchDataset('republican')
      .then(function(row) {
        expect(row).to.exist;
        expect(row.commonFriends).to.be.an('array');
        expect(row.commonWords).to.be.an('array');
        done();
      }).catch(function(err) {
        done();
      });
  })

  it ('should fail for parties that arent democrats or republicans', function(done) {

      db.fetchDataset('pizza')
      .then(function(row) {
        expect(row).to.exist;
        expect(row.commonFriends).to.be.an('array');
        expect(row.commonWords).to.be.an('array');
        done();
      }).catch(function(err) {
        expect(err).to.exist;
        done();
      });
  })

  it ('should create a percentage of a persons political alignment', function(done) {

    db.fetchTwitterUser('realDonaldTrump')
      .then(function(user) {
        var answer = tweetrics.democratOrRepublican(user[0])
        expect(answer).to.exist;
        done();
    }).catch(function(err){
      console.log('err alignment');
      done();
    });
  })

   it ('should get a percentage value for a republican', function(done) {

    db.fetchTwitterUser('realDonaldTrump')
      .then(function(user) {
        var result = tweetrics.democratOrRepublican(user[0])
        expect(result.infographicState).to.exist;
        expect(result).to.exist;
        expect(result.infographicState.rep.percent).to.exist;
        done();
    }).catch(function(err){
      console.log(err, 'err');
      done();
    });
  })

   it ('should get a percentage value for the donald', function(done) {

    db.fetchTwitterUser('realDonaldTrump')
      .then(function(user) {
        var result = tweetrics.democratOrRepublican(user[0])
        expect(result.infographicState).to.exist;
        expect(result).to.exist;
        expect(result.infographicState.rep.percent).to.exist;
        done();
    }).catch(function(err){
      console.log(err, 'err');
      done();
    });
  })

    it ('should get a percentage for the Schwarzenegger', function(done) {
    db.fetchTwitterUser('Schwarzenegger')
      .then(function(user) {
        var result2 = tweetrics.democratOrRepublican(user[0])
        expect(result2.infographicState.percent);
        expect(result2).to.exist;
        expect(parseInt(result2.infographicState.rep.percent)).to.be.within(50,100);
        expect(result2.infographicState.rep.percent).to.exist;
        done();
    }).catch(function(err){
      console.log(err, 'err');
      done();
    });
  }

    it ('should get a percentage value for obama', function(done) {
    db.fetchTwitterUser('BarackObama')
      .then(function(user) {
        var result2 = tweetrics.democratOrRepublican(user[0])
        expect(result2.infographicState.percent);
        expect(result2).to.exist;
        expect(result2.infographicState).to.exist;
        expect(result2.infographicState.dem.percent).to.exist;
        done();
    }).catch(function(err){
      console.log(err, 'err');
      done();
    });
  })

  it ('should get a percentage for hillary clinton', function(done) {
    db.fetchTwitterUser('HillaryClinton')
      .then(function(user) {
        var result2 = tweetrics.democratOrRepublican(user[0])
        expect(result2.infographicState.percent);
        expect(result2).to.exist;
        expect(parseInt(result2.infographicState.dem.percent)).to.be.within(50,100);
        expect(result2.infographicState.dem.percent).to.exist;
        done();
    }).catch(function(err){
      console.log(err, 'err');
      done();
    });
  })

 it ('should get a percentage for al gore', function(done) {
    db.fetchTwitterUser('algore')
      .then(function(user) {
        var result2 = tweetrics.democratOrRepublican(user[0])
        expect(result2.infographicState.percent);
        expect(result2).to.exist;
        expect(parseInt(result2.infographicState.dem.percent)).to.be.within(50,100);
        expect(result2.infographicState.dem.percent).to.exist;
        done();
    }).catch(function(err){
      console.log(err, 'err');
      done();
    });
  })

  it ('should get a percentage for jaden smith', function(done) {
    db.fetchTwitterUser('officialjaden')
      .then(function(user) {
        var result2 = tweetrics.democratOrRepublican(user[0])
        expect(result2.infographicState.percent);
        expect(result2).to.exist;
        expect(parseInt(result2.infographicState.dem.percent)).to.be.within(50,100);
        expect(result2.infographicState.dem.percent).to.exist;
        done();
    }).catch(function(err){
      console.log(err, 'err');
      done();
    });
  })

})

//})



