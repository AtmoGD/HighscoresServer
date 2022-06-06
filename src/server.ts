import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";

export namespace Oasis {
    let port: number | string = process.env.PORT == undefined ? 5001 : process.env.PORT;
    let databaseURL: string = "mongodb+srv://game:eFiJnzx1Cz9apjLj@highscores.808ei.mongodb.net/?retryWrites=true&w=majority";
    let databaseName: string = "HighscoreDatabase";
    let collectionName: string = "SingleScoreName";
    let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(databaseURL);

    startServer(port);
    connectToDatabase(databaseURL);

    function startServer(_port: number | string | undefined): void {
        let server: Http.Server = Http.createServer();
        server.listen(port);
        server.addListener("request", handleRequest);

        console.log("listening on :" + port);
    }

    async function connectToDatabase(_url: string): Promise<void> {
        await mongoClient.connect();

        console.log("Database connection is established");
    }

    async function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): Promise<void> {
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");

        if (_request.url) {
            console.log(_request.url);

            let url: Url.UrlWithParsedQuery = Url.parse(_request.url, true);

            let mongo: Mongo.Collection = mongoClient.db(databaseName).collection(collectionName);

            let game: string | undefined = url.query["game"]?.toString();
            let command: string | undefined = url.query["command"]?.toString();
            let id: string | undefined = url.query["id"]?.toString();
            let name: string | undefined = url.query["name"]?.toString();
            let score: string | undefined = url.query["score"]?.toString();

            if (command != undefined && id != undefined) {
                switch (command) {
                    case "get":
                        let result = await mongo.find().sort({score:-1}).limit(1)
                        _response.write("Get user with id: " + id);
                        // let result: Mongo.WithId<Mongo.Document> | null = await mongo.findOne({ _id: id });
                        if (result != null) {
                            // let resultString: string = result.toString();
                            let resultString: string = result.toString();
                            _response.write(resultString);
                            _response.write("<br>");
                            _response.write(result);
                            _response.write(result);
                            // _response.write("score: " + result["score"] + " name: " + result["name"] + " game: " + result["game"]);
                        }
                        break;

                    case "update":
                        _response.write("Set user with id: " + id);
                        if (name != undefined && score != undefined) {
                            await mongo.updateOne(
                                { _id: id }, 
                                { $set: { game:game, name: name, score: parseInt(score) } }, 
                                { upsert: true }
                                );
                            _response.write("Update successful");
                        } else {
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
                        } else {
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
}