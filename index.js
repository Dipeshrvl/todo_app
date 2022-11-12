const app = require("./app");
const port = 5000 | process.env.port
app.listen(port, () => {
  console.log("Listening at post 4000");
});
