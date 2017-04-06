var express = require('express');
var app = express();  //express
var MongoClient = require('mongodb');  //mongodb

var formidable = require('formidable');
var request = require('request');

var fs = require('fs');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

MongoClient.connect('mongodb://samjm1618:a27796@ds141490.mlab.com:41490/ccdbd', (err, database) => {
	if(err) return console.log(err)
		db=database

	app.listen(port, function(){
		console.log('Conexion realizada : port ' + port)
	})

})

//set Express to use EJS view engine
app.set('view engine', 'ejs')

//define our public directory to serve our static resources
app.use(express.static(__dirname + '/public'))


//Rutas
//index
app.get('/', (req, res) => {
		res.render('index.ejs', {})
})

//post agregar
app.post('/add', (req,res) => {

      var form = new formidable.IncomingForm();
      form.parse(req);

      //post datos
      var fields = [];
      form.on('field', function(name, value) {
          console.log(name + " : " + value);
         fields[name] = value;
      });

      console.log(form);
      console.log(':::::::::::::::::::::::::');

      var filePath="";

      var base64str = "";//base64_encode('turismo-02.jpg').replace(/.*,/, '');
      form.on('fileBegin', function (name, file){
          file.path = __dirname + '\\public\\' /*'/public/'*/ + file.name;
          console.log(file.path);
          base64str =  base64_encode(file.path);
          filePath = file.path;
      });

    console.log(base64str);

      //API imgur
      request({
              url: 'https://api.imgur.com/3/upload',
              headers: {
                Authorization: 'Client-ID ' + 'a9a84f7cbe3ce34'
              },
              data:{
                image: base64str,//"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==".replace(/.*,/, ''),//base64_encode('turismo-02.jpg'),
                type: 'base64'
              }
        }, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                console.log(info);
              }else{
                var info = JSON.parse(body);
                console.log(info);
                console.log(response.statusCode);
              }
      });

      ///Inserta en bd
      form.on('end', function () {
        var imgData = {
              nombre: fields["inputNombre"],
              titulo: fields["inputTitulo"],
              descripcion: fields["inputDesc"],
              imgUrl: filePath
          };

          db.collection('imagen').insert(imgData, function(err) {
              if (err) {
                  console.log(err);
              }
              console.log("Insertado correctamente: " + imgData.nombre);
              res.redirect('/');
          });

      });
})


// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    //console.log(bitmap);
    //return bitmap;
    return new Buffer(bitmap).toString('base64');
}
