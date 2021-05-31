const getConnection = require("typeorm").getConnection;

module.export = async () => {
  const connection = getConnection();
  await connection.dropDatabase();
  await connection.close();
}