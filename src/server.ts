import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";

export namespace Oasis {
    let port: number | string = process.env.PORT == undefined ? 5001 : process.env.PORT;
    let databaseURL: string = "mongodb+srv://admin:<l4mOCsrXCosic7tx>@highscores.808ei.mongodb.net/?retryWrites=true&w=majority";
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

            let id: string | undefined = url.query["id"]?.toString();
            let command: string | undefined = url.query["action"]?.toString();
            let name: string | undefined = url.query["name"]?.toString();
            let score: string | undefined = url.query["score"]?.toString();

            if (command != undefined  && id != undefined) {
                switch (command) {
                    case "get":
                        _response.write("Get user with id: " + id);
                        let result: Mongo.WithId<Mongo.Document> | null = await mongo.findOne({ _id: id });
                        if (result != null) {
                            _response.write(JSON.stringify(result));
                        }
                        break;

                    case "update":
                        _response.write("Set user with id: " + id);
                        if (name != undefined && score != undefined) {
                            await mongo.updateOne({ _id: id }, { $set: { name: name, score: parseInt(score) } });
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
                            await mongo.insertOne({ id: id, name: name, score: parseInt(score) });
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