import mongoose from "mongoose";

export const testConnection = () => {
  return mongoose.connect(process.env.MONGODB_TEST_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
