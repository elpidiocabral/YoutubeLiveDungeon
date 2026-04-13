import { type Application } from 'express';
import { type Server as HttpServer } from 'http';
export declare class ExpressServer {
    readonly app: Application;
    readonly httpServer: HttpServer;
    constructor();
    listen(): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=express.server.d.ts.map