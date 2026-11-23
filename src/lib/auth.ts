import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";


const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db('rentora');

export const auth = betterAuth({
      emailAndPassword: { 
    enabled: true, 
  }, 
  user:{
    additionalFields: {
        role:{
            type:["admin","owner","customer"],
            input:false,
            defaultValue:"customer"
        }
        
    }
  },
  database: mongodbAdapter(db, {
    client,
  }),
});