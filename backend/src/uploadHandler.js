const Busboy = require("busboy");
const { createWriteStream } = require("fs");
const { join } = require("path");
const { logger, pipelineAsync } = require("./utils.js");

const ON_UPLOAD_EVENT = "file-uploaded";

class UploadHandler {
  #io;
  #socketId;

  constructor(io, socketId) {
    this.#io = io;
    this.#socketId = socketId;
  }

  registerEvent(headers, onFinish) {
    const busboy = Busboy({ headers });

    busboy.on("file", this.#onfile.bind(this));

    busboy.on("finish", onFinish);

    return busboy;
  }

  #handleIncomingFile(filename) {
    async function* handleData(data) {
      for await (const item of data) {
        const size = item.length;
        logger.info(`File ${filename} got ${size} bytes to ${this.#socketId}`);

        this.#io.to(this.#socketId).emit(ON_UPLOAD_EVENT, size);

        yield item;
      }
    }

    return handleData.bind(this);
  }

  async #onfile(fieldname, file, fileInfo) {
    const saveToFile = join(__dirname, "../", "downloads", fileInfo.filename);
    logger.info("Uploading " + fileInfo.filename + "...");

    // pipeline recebe de parâmetros um objeto Stream e funções callbacks
    // para executar como etapas. File é um objeto FileStream, uma instância
    // de Stream
    await pipelineAsync(
      file,
      this.#handleIncomingFile.apply(this, [fileInfo.filename]),
      createWriteStream(saveToFile)
    );

    logger.info("Finished uploading " + fileInfo.filename);
  }
}

module.exports = UploadHandler;
