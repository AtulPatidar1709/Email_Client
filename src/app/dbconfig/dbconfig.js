const { mongoose } = require("mongoose");

export const connectDB = async () => {
  try {
    const connectionDataBase = await mongoose.connect(process.env.MONGO_URI);
    const connection = connectionDataBase.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected");
    });

    connection.on("error", (error) => {
      console.log("MongoDB not Connected" + error);
      process.exit(1);
    });

    // console.log(`MongoDB Connected: {conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
