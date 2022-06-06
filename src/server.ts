import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";

export namespace HighscoreServer {

    interface SingleScoreName {
        name: string;
        score: number;
    }

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
                        // const cursor = mongo.find<SingleScoreName>(
                        //     { runtime: { $lt: 15 } },
                        //     {
                        //       sort: { title: 1 },
                        //       projection: { _id: 0, title: 1, imdb: 1 },
                        //     }
                        //   );
                        //   if ((await cursor.count()) === 0) {
                        //     console.warn("No documents found!");
                        //   }
                        //   await cursor.forEach(console.dir);

                        const cursor = mongo.find<SingleScoreName>({ game: game }).sort({ score: -1 }).limit(10);
                        let result: SingleScoreName[] = await cursor.toArray();

                        result.forEach(element => {
                            _response.write(element.name + ": " + element.score + "<br>");
                        });

                        // if ((await cursor.count()) === 0) {
                        //     console.warn("No documents found!");
                        // }
                        // await cursor.forEach(console.dir);
                        _response.write(JSON.stringify(result));
                        await cursor.forEach((el)=> {
                            _response.write("<p>Hello");
                            _response.write(JSON.stringify(el));
                        });


                        // let result = await mongo.find().sort({score:-1}).limit(1)
                        // let result = await mongo.find();
                        _response.write("Get user with id: " + id);
                        // // let result: Mongo.WithId<Mongo.Document> | null = await mongo.findOne({ _id: id });
                        // if (result != null) {
                        //     //     // let resultString: string = result.toString();
                        //     let resultString: string = JSON.stringify(result);
                        //     _response.write(resultString);
                        //     // _response.write("<br>");
                        //     // _response.write(result);
                        //     //     _response.write(result);
                        //     //     // _response.write("score: " + result["score"] + " name: " + result["name"] + " game: " + result["game"]);
                        // }
                        break;

                    case "update":
                        _response.write("Set user with id: " + id);
                        if (name != undefined && score != undefined) {
                            await mongo.updateOne(
                                { _id: id },
                                { $set: { game: game, name: name, score: parseInt(score) } },
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