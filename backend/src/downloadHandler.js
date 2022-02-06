const Busboy = require("busboy");
const { createReadStream } = require("fs");
const { join } = require("path");
const { logger, pipelineAsync } = require("./utils.js");

const ON_DOWNLOAD_EVENT = "file-incoming";

class DownloadHandler {
  #io;
  #socketId;

  constructor(io, socketId) {
    this.#io = io;
    this.#socketId = socketId;
  }

  async downloadFile(response) {
    const rs = createReadStream(
      join(
        __dirname,
        "../",
        "downloads",
        "Art of Computer Programming - Volume 1 (Fundamental Algorithms).pdf"
      )
    );

    response.setHeader(
      "Content-Disposition",
      "attachment; ./Art of Computer Programming - Volume 1 (Fundamental Algorithms).pdf"
    );

    await pipelineAsync(rs, response);
  }
}

module.exports = DownloadHandler;
