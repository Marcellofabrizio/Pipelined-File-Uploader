const http = require("http");
const socketIo = require("socket.io");
const { logger } = require("./utils.js");
const Routes = require("./routes.js");

const PORT = 3000;

const handler = (request, response) => {
  const defaultRoute = async (request, response) =>
    response.end("My webserver");

  const routes = new Routes(io);
  const chosen = routes[request.method.toLowerCase()] || defaultRoute;

  return chosen.apply(routes, [request, response]);
};

const server = http.createServer(handler);

const io = socketIo(server, {
  cors: {
    origin: "*",
    credentials: false,
  },
});

io.on("connection", (socket) => {
  logger.info(`connetion at id: ${socket.id}`);
});

const startServer = () => {
  const { address, port } = server.address();
  logger.info(`app running at http://${address}:${port}`);
};

server.listen(PORT, startServer);
