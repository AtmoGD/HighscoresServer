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
            let name: string | undefined = url.query["name"]?.toString();
            let score: string | undefined = url.query["score"]?.toString();
            let amount: string | undefined = url.query["amount"]?.toString();

            if (command != undefined) {
                switch (command) {
                    case "get":
                        const cursor = mongo.find<SingleScoreName>({ game: game }).sort({ score: -1 }).limit(parseInt(amount ? amount : "10"));
                        let result: SingleScoreName[] = await cursor.toArray();

                        result.forEach(element => {
                            _response.write(element.name + ": " + element.score + "<br>");
                            _response.write("<br>");
                        });

                        result.forEach(element => {
                            _response.write(element);
                        });

                        _response.write(JSON.parse(result.toString()));
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
            }
        }
        _response.end();
    }
}