var express = require("express");
var bodyParser = require("body-parser")
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var PORT = process.env.PORT || 3000;

var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var db = require("./models");



app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect (process.env.MONGODB_URI || "mongodb://localhost/articledb", {useNewUrlParser: true });
    // useNewUrlParser: true
  var db = require("./models")


app.get("/scrape", function (req, res) {
    axios.get("https://www.ocregister.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        
        $(".entry-title").each(function (i, element) {
            var result = {};

            result.title = $(this)
                .children("a")
                .text()
            result.link = $(this)
                .children("a")
                .attr("href");
                
            db.Article.create(result)
                .then(function (dbArticle) {
                   res.send(dbArticle)
                    // console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
       
       res.send("Scrape Complete");
    });
});
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
            // res.render("/articles", dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });
});
app.get("/", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            var articles = {
                articles: dbArticle
            }
            // res.json(dbArticle);
            
           // console.log(dbArticle)
            res.render("index", articles)
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.post("/articles/:id", function (req, res) {
    db.comment.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});