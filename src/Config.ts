// Url of the remote server
const BASE_URL = "http://localhost:5000";

export const Endpoints = {
    config: {
        get: BASE_URL + "/api/get_config",
        update: BASE_URL + "/api/update_config"
    },
    tests: {
        get: BASE_URL + "/api/get_tests",
        start: BASE_URL + "/api/start_test"
    }
}