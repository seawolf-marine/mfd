import { Injectable } from '@angular/core';
import * as aircraftProfile from './Profiles/P51D.json';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import ExportDataParser from './ExportDataParser';
import { AircraftDevice, TrackedDevice, Line } from './TrackedDevice';
import * as commonData from './Profiles/Common.json';

@Injectable({
    providedIn: 'root',
})
export class DcsClientService {
    webSocket: WebSocket;
    dataParser: ExportDataParser;
    listeners: TrackedDevice[] = [];
    aircraftName = 'No Aircraft';

    constructor() {
        this.init();
    }

    protected subscriptions: ReplaySubject<number>[] = [];

    public init() {
        this.webSocket = new WebSocket('ws://localhost:3000');
        this.webSocket.onopen = (evt) => {
            console.log(evt);

            console.log('Opened Connection.');
            const requestLiveData = JSON.stringify({
                datatype: 'live_data',
                data: {}
            });
            console.log(requestLiveData);
            this.webSocket.send(requestLiveData);
        };

        this.dataParser = new ExportDataParser();
        this.dataParser.onDcsUpdate().subscribe(
            (update) => {
                const byteBuffer = new Uint16Array(update.data);

                for (const listener of this.listeners) {
                    if (listener.address === update.address) {
                        if (listener.callback) {
                            const output = listener.device.outputs[0];
                            // tslint:disable-next-line:no-bitwise
                            const value = (byteBuffer[0] & output.mask) >> output.shift_by;
                            listener.device.currentValue = value;
                            listener.callback(value);
                        }
                    }
                }
            }
        );
        this.webSocket.onmessage = (msg => {
          console.log(msg.data);
        });

        this.webSocket.onerror = (evt) => {
            console.log('err');
            console.log(evt);
        };

        window.setInterval(() => {
          if(this.webSocket.readyState === 1) {
            console.log('sending');
            this.webSocket.send('{"messageType":"heartbeat"}');
          }
        }, 1000);
    }

    registerListener(categoryName: string, parameter: string, changedCallback) {
        const source = categoryName === 'Altitude' ||
            categoryName === 'Heading' ||
            categoryName === 'Position' ||
            categoryName === 'Speed' ? commonData : aircraftProfile;

        const category = (source as any).default[categoryName];
        if (!category) {
            console.log(`Could not find category for ${categoryName}`);
            return;
        }

        const system = category[parameter] as AircraftDevice;
        if (!system) {
            console.error('Could not find sytem: ' + category + ' ' + parameter);
            return;
        }

        this.listeners.push({
            address: system.outputs[0].address,
            device: system,
            callback: changedCallback
        });
    }

    sendBoolAction(action: string) {
        const json = JSON.stringify({
            datatype: 'input_command',
            data: action
        });

        console.log(json);

        this.webSocket.send(json);
    }

    close() {
      this.webSocket.close();
      console.log('closing ws');
    }
}
