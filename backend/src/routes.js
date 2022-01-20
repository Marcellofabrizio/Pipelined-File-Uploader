const url = require("url");
const UploadHandler = require("./uploadHandler.js");
const { pipelineAsync } = require("./utils.js");
const { logger } = require("./utils.js");

class Routes {
  #io;
  constructor(io) {
    this.#io = io;
  }

  async post(request, response) {
    const { headers } = request;

    const {
      query: { socketId },
    } = url.parse(request.url, true);

    const redirectTo = headers.origin;

    const uploadHandler = new UploadHandler(this.#io, socketId);

    const onFinish = (response, redirectTo) => () => {
      response.writeHead(303, {
        Connetion: "close",
        Location: `${redirectTo}?msg=File uploaded`,
      });

      response.end();
    };

    const busboy = uploadHandler.registerEvent(
      headers,
      onFinish(response, redirectTo)
    );

    await pipelineAsync(request, busboy);

    logger.info("Request finished with success");
  }
}

module.exports = Routes;
