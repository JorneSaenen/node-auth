import mongo from "mongodb";

const { MongoClient } = mongo;

const url = encodeURI(process.env.MONGO_URL);

export const client = new MongoClient(url, { useNewUrlParser: true });

export const connectDb = async () => {
  try {
    await client.connect();
    // Confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("🗄️  Connected to DB successfully!");
  } catch (error) {
    console.error(error);
    // if there is a problem, close the connection to db
    await client.close();
  }
};
