export async function GET(req, res){
  const { MongoClient, ObjectId } = require('mongodb');

  const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(url);

  const dbName = 'forums'; // database name
  
  try {
      await client.connect();// Use connect method to connect to the server
      console.log('Connected successfully to server');
      const db = client.db(dbName); // mongodb connection to the database
      const collection = db.collection('commentsandreply');// Get the collection
      
      // Get the objectId from request query parameters
      const { objectId } = req.query;
      
      // Convert the objectId string to a MongoDB ObjectId
      const objectIdQuery = { _id: ObjectId(objectId) };

      // Query the collection with the objectId
      const findResult = await collection.find(objectIdQuery).toArray();
      
      console.log('FDGSOHGFDB =>', findResult); 
      
      // Return the result to the client 
      res.json(findResult);
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
  } finally {
      await client.close(); // Close the MongoDB client connection
  }
}

  