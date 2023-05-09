
import Ajv from "ajv";

// Data-Validator-Instance
const ajv = new Ajv();

// Function to load data from the backend
// TODO: Implement better dialog than alert for retrying...
export async function loadJsonData<T>(url: string, schema: object) : Promise<T> {

    try {
        // Loads the data
        var raw = await fetch(url);
        var asJson = await raw.json();

        // Validates retreived data
        const isDataValid = ajv.validate(schema, asJson);

        if (!isDataValid) {
            alert("Retreived data is invalid, retrying...");
            return loadJsonData(url, schema);
        }

        return asJson as T;
    } catch (e) {
        alert("Error retreiving data... retrying...");
        return loadJsonData(url, schema);
    }

}