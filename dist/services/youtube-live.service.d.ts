import type { IMessageBus } from '../core/ports';
import type { ChatFilter } from './chat-filter';
export type LiveStatus = {
    active: false;
} | {
    active: true;
    liveId: string;
    startedAt: string;
};
export declare class YouTubeLiveService {
    private readonly messageBus;
    private readonly filter;
    private activeClient;
    private currentLiveId;
    private startedAt;
    constructor(messageBus: IMessageBus, filter: ChatFilter);
    startLive(urlOrId: string): Promise<{
        success: true;
        liveId: string;
    } | {
        success: false;
        error: string;
    }>;
    stopLive(): void;
    getStatus(): LiveStatus;
}
//# sourceMappingURL=youtube-live.service.d.ts.map