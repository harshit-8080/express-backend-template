import app from "./app";
import logger from "./config/logger";
import config from "config";

const startServer = async (): Promise<void> => {
    const PORT: number = config.get("server.port");
    try {
        app.listen(PORT, () => {
            logger.info(`Listening on port ${PORT}`);
        });
    } catch (err: any) {
        if (err instanceof Error) {
            logger.error(err.message, err, {});
        }
    }
};

void startServer();
