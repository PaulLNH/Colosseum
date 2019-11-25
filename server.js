const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
// const http = require("http");
// const httpServer = http.Server(app);

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});
