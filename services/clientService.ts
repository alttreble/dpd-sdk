import type { Context } from "../context";

export class ClientService {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    getClient(input: any): any {
        // endpoint: /
        console.log("Calling getClient with", input);
        return {} as any;
    }

    getContractClients(input: any): any {
        // endpoint: /
        console.log("Calling getContractClients with", input);
        return {} as any;
    }

    createContact(input: any): any {
        // endpoint: /
        console.log("Calling createContact with", input);
        return {} as any;
    }

    getContactByExternalId(input: any): any {
        // endpoint: /
        console.log("Calling getContactByExternalId with", input);
        return {} as any;
    }

    getOwnClientId(input: any): any {
        // endpoint: /
        console.log("Calling getOwnClientId with", input);
        return {} as any;
    }

    contractInfo(input: any): any {
        // endpoint: /
        console.log("Calling contractInfo with", input);
        return {} as any;
    }
}
