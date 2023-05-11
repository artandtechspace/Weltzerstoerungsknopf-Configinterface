import Ajv from "ajv";

import { LogType } from "./LogType"

// Data-Validator-Instance
const ajv = new Ajv();

export type LogMessage = {
    type: LogType,
    logger: string,
    func: string,
    msg: string,
    time: Date
}

export const LogMessageSchema = {
    "type": "object",
    "required": [
        "type",
        "logger",
        "func",
        "msg",
        "time"
    ],
    "properties": {
        "type": {
            "type": "string",
            "enum": Object.values(LogType)
        },
        "logger": {
            "type": "string",
            "maxLength": 20
        },
        "func": {
            "type": "string",
            "maxLength": 20
        },
        "msg": {
            "type": "string"
        },
        "time": {
            "title": "Time",
            "type": "array",
            "items": {
                "title": "Items",
                "type": "integer",
                "examples": [
                    2023
                ],
                "minItems": 9,
                "maxItems": 9,
            }
        }
    }
}

// Validates the given object as a retreived log-message, formats it and returns it
export function fromRaw(x: any) {
    // Validates retreived data
    const isDataValid = ajv.validate(LogMessageSchema, x);

    // Executes the invalid log callback
    if (!isDataValid)
        return false;

    // Mapps the time-data
    var timeRaw = x.time as number[];
    var timeDate = new Date(timeRaw[0], timeRaw[1],timeRaw[2], timeRaw[3],timeRaw[4], timeRaw[5]);

    return {
        ...x,
        time: timeDate
    } as LogMessage
}