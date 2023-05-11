
import Ajv from "ajv";

// Data-Validator-Instance
const ajv = new Ajv();

export enum RequestStatus {
    LOADING,
    ERROR,
    SUCCESS
}

// Function to load data from the backend
export async function loadJsonData<T>(url: string, schema: object) : Promise<T> {

    try {
        // Loads the data
        var raw = await fetch(url);

        if(!raw.ok)
            throw raw.statusText+" ("+raw.status+")";

        var asJson = await raw.json();

        // Validates retreived data
        const isDataValid = ajv.validate(schema, asJson);

        if (!isDataValid)
            throw "Retreived data is invalid"

        return asJson as T;
    } catch (e: any) {
        throw e.toString();
    }

}