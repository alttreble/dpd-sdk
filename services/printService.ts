import type { Context } from "../context";

export class PrintService {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    print(input: any): any {
        // endpoint: /
        console.log("Calling print with", input);
        return {} as any;
    }

    extendedPrint(input: any): any {
        // endpoint: /
        console.log("Calling extendedPrint with", input);
        return {} as any;
    }

    labelInfo(input: any): any {
        // endpoint: /
        console.log("Calling labelInfo with", input);
        return {} as any;
    }

    printVoucher(input: any): any {
        // endpoint: /
        console.log("Calling printVoucher with", input);
        return {} as any;
    }
}
