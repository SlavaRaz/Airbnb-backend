export default {
  dbURL: process.env.MONGO_URL || 'mongodb+srv://team:1234@cluster0.bn4wz.mongodb.net/',
  dbName : process.env.DB_NAME || 'stay_db'
}
