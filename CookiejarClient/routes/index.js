var express = require('express');
var router = express.Router();
var {CookiejarClient}  = require('./CookiejarClient');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('Home', { title: 'KBA' });
});

router.get('/bake',(req,res)=>{
  res.render('Bake');
});

router.get('/eat',(req,res)=>{
  res.render('Eat');
});

router.get('/count',(req,res)=>{
  res.render('Count');
});

router.get('/home',function(req, res, next){
  res.render('Home', { title: 'Sawtooth'});
})


router.post('/bake',(req,res,next)=>{
  var count= req.body.cookie;
  var pkey= req.body.pkey;
  var type=req.body.name;
  var  cookiejar_client = new CookiejarClient(pkey,type);

  cookiejar_client.send_data('bake',[count]);
  res.send({message: "Bake "+ count +" "+ type + " Cookies"});

});

router.post('/eat',(req,res,next)=>{
  var count= req.body.cookie;
  var pkey= req.body.pkey;
  var cookiejar_client = new CookiejarClient(pkey);
  cookiejar_client.send_data('eat',count);
  res.send({message: "Eat " +count+ "Cookies"});
});

router.post('/count', (req, res)=>{
  var pkey= req.body.pkey;
  const cookiejar_client = new CookiejarClient(pkey);
  const getYourBalance =  cookiejar_client._send_to_rest_api(null);
  getYourBalance.then(result => {res.send({ balance: result});});
})
module.exports = router;
