import { BigNum } from "@emurgo/cardano-serialization-lib-browser";

export interface TierFeature {
    "id": string;
    "name": string;
}
export interface Subscription {
    "end_date": string;
    "features": Array<TierFeature>;
    "id": string;
    "name": "Developer" | "Auditor";
    "price": BigNum,
    "profileId": string;
    "start_date": string;
    "status": "inactive" | "active" | "pending";
    "tierId": string;
}

export interface Tier {
    "duration": number;
    "enabled": boolean;
    "features": Array<TierFeature>;
    "id": string;
    "tierId"?: string;
    "name": "Developer" | "Auditor";
    "type": "developer" | "auditor";
    "usdPrice": number;
}