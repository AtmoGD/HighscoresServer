"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Oasis = void 0;
const Http = require("http");
const Url = require("url");
const Mongo = require("mongodb");
var Oasis;
(function (Oasis) {
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
            let id = url.query["id"]?.toString();
            let name = url.query["name"]?.toString();
            let score = url.query["score"]?.toString();
            if (command != undefined && id != undefined) {
                switch (command) {
                    case "get":
                        let result = await mongo.find().sort({ score: -1 }).limit(1);
                        _response.write("Get user with id: " + id);
                        // let result: Mongo.WithId<Mongo.Document> | null = await mongo.findOne({ _id: id });
                        if (result != null) {
                            // let resultString: string = result.toString();
                            let resultString = result.toString();
                            _response.write(resultString);
                            // _response.write("score: " + result["score"] + " name: " + result["name"] + " game: " + result["game"]);
                        }
                        break;
                    case "update":
                        _response.write("Set user with id: " + id);
                        if (name != undefined && score != undefined) {
                            await mongo.updateOne({ _id: id }, { $set: { game: game, name: name, score: parseInt(score) } }, { upsert: true });
                            _response.write("Update successful");
                        }
                        else {
                            _response.write("Update failed");
                        }
                        break;
                    case "delete":
                        _response.write("Delete user with id: " + id);
                        await mongo.deleteOne({ _id: id });
                        _response.write("Delete successful");
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
                // if (command == "get") {
                //     let result: Mongo.WithId<Mongo.Document> | null = await mongo.findOne({ _id: id });
                //     if (result != null)
                //         _response.write(result.toString());
                // } else {
                //     await mongo.updateOne(
                //         { _id: id },
                //         // { $set: { [object]: command } },
                //         { upsert: true }
                //     );
                // _response.write("ID: " + id + "\nChanged value of Object: " + object + "\nto: " + command);
                // }
            }
        }
        _response.end();
    }
})(Oasis = exports.Oasis || (exports.Oasis = {}));
//# sourceMappingURL=server.js.map