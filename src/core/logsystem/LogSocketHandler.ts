
import { io, Socket } from "socket.io-client";
import { LogMessage, fromRaw } from "./LogMessage";
import { log } from "console";
import {Endpoints} from "@/Config"

/**
 * Handler for the logging-websocket
 */

// Status the the websocket can have
export enum Status {
    CONNECTED,
    RECONNECTING
}

// Event: a new log is retreived
type RetreiveCallback = (log: LogMessage) => void;
// Event: all logs should be reset
type ResetCallback = () => void;
// Event: The connection status is updated
type StatusUpdateCallback = (status: Status) => void;
// Event: An invalid log is retreived
type InvalidLogCallback = () => void;
// Event: An error occurred
type ErrorCallback = () => void;

export class LogSocketHandler {

    // Callbacks for various events
    private logCB: RetreiveCallback = undefined as any;
    private resetCB: ResetCallback = undefined as any;
    private statusCB: StatusUpdateCallback = undefined as any;
    private invalidLogCB: InvalidLogCallback = undefined as any;
    private errorCB: ErrorCallback = undefined as any;

    // Actual socketio-socket for data transfer
    private socket: Socket = undefined as any;

    setup(logCB: RetreiveCallback, resetCB: ResetCallback, statusCB: StatusUpdateCallback, invalidLogCB: InvalidLogCallback, errorCB: ErrorCallback) {
        this.logCB = logCB;
        this.resetCB = resetCB;
        this.statusCB = statusCB;
        this.invalidLogCB = invalidLogCB;
        this.errorCB = errorCB;

        // Starts the connection
        this.socket = io(Endpoints.logs, {
            transports: ["websocket"],
            reconnectionDelay: 1000,
        });

        // Registers the different event listeners

        // Event: Connection established
        this.socket.on("connect", this.onConnect.bind(this));
        // Event: Server closed connection
        this.socket.on("disconnect", this.onDisconnect.bind(this));
        // Event: Connecton lost
        this.socket.on("connect_error", this.onError.bind(this));
        // Event: Inital packet
        this.socket.on("inital", this.onDataInital.bind(this));
        // Event: Log packet
        this.socket.on("log", this.onDataLog.bind(this));
    }

    // Event: When the socket connects
    private onConnect() {
        this.statusCB(Status.CONNECTED);
    }

    // Event: When the server disconnects
    private onDisconnect() {
        this.statusCB(Status.RECONNECTING);
    }

    // Event: When the connection creates and error
    private onError() {
        this.errorCB();
        this.statusCB(Status.RECONNECTING);
    }

    // Event: When a data initialisation packet is retreived
    private onDataInital(x: object) {
        // Sends reset
        this.resetCB();
        
        // Checks validity
        if(!Array.isArray(x)){
            this.invalidLogCB();
            return;
        }

        // Maps all logs
        var mapped = x.map(fromRaw);

        // Validates them
        if(mapped.some(x=> x===false)){
            this.invalidLogCB();
            return;
        }

        // Sends the update
        (mapped as LogMessage[]).forEach(this.logCB);
    }

    // Event: When a data-update packet is retreived
    private onDataLog(x: object) {
        // Validates the data
        var res = fromRaw(x);

        if(res == false){
            this.invalidLogCB();
            return;
        }

        // Forwards the log
        this.logCB(res);
    }

    // Used to kill the socket and end the connection
    public end() {
        this.socket.close();
    }

}