import type { Context } from "../context";

export class TrackAndTraceService {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    track(input: any): any {
        // endpoint: /
        console.log("Calling track with", input);
        return {} as any;
    }

    bulkTrackingDataFiles(input: any): any {
        // endpoint: /
        console.log("Calling bulkTrackingDataFiles with", input);
        return {} as any;
    }
}
