"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighscoreServer = void 0;
const Http = require("http");
const Url = require("url");
const Mongo = require("mongodb");
var HighscoreServer;
(function (HighscoreServer) {
    let port = process.env.PORT == undefined ? 5001 : process.env.PORT;
    let databaseURL = "mongodb+srv://game:eFiJnzx1Cz9apjLj@highscores.808ei.mongodb.net/?retryWrites=true&w=majority";
    let databaseName = "HighscoreDatabase";
    let collectionName = "SingleScoreName";
    let mongoClient = new Mongo.MongoClient(databaseURL);
    startServer(port);
    connectToDatabase(databaseURL);
    function startServer(_port) {
        let server = Http.createServer();
        server.listen(port);
        server.addListener("request", handleRequest);
        console.log("listening on :" + port);
    }
    async function connectToDatabase(_url) {
        await mongoClient.connect();
        console.log("Database connection is established");
    }
    async function handleRequest(_request, _response) {
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");
        if (_request.url) {
            console.log(_request.url);
            let url = Url.parse(_request.url, true);
            let mongo = mongoClient.db(databaseName).collection(collectionName);
            let game = url.query["game"]?.toString();
            let command = url.query["command"]?.toString();
            let name = url.query["name"]?.toString();
            let score = url.query["score"]?.toString();
            let amount = url.query["amount"]?.toString();
            if (command != undefined) {
                switch (command) {
                    case "get":
                        const cursor = mongo.find({ game: game }).sort({ score: -1 }).limit(parseInt(amount ? amount : "10"));
                        let result = await cursor.toArray();
                        result.forEach(element => {
                            _response.write(element.name + ": " + element.score + "<br>");
                            _response.write("<br>");
                        });
                        _response.write(JSON.parse(result.toString()));
                        break;
                    case "create":
                        _response.write("Create new user");
                        if (name != undefined && score != undefined) {
                            await mongo.insertOne({ game: game, name: name, score: parseInt(score) });
                            _response.write("Insert successful");
                        }
                        else {
                            _response.write("Insert failed");
                        }
                        break;
                }
            }
        }
        _response.end();
    }
})(HighscoreServer = exports.HighscoreServer || (exports.HighscoreServer = {}));
//# sourceMappingURL=server.js.map