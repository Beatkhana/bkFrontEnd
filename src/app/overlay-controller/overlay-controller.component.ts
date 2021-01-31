import { Component, OnInit } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Component({
    selector: 'app-overlay-controller',
    templateUrl: './overlay-controller.component.html',
    styleUrls: ['./overlay-controller.component.scss']
})
export class OverlayControllerComponent implements OnInit {

    constructor() { }

    bkWS: WebSocketSubject<any> = webSocket(`${location.protocol == 'http:' ? 'ws' : 'wss'}://` + location.host + '/api/ws');

    ngOnInit(): void {
        this.bkWS.subscribe(
            msg => {

            },
            err => console.log('err: ', err),
            () => console.log('complete')
        );
    }

    play() {
        this.bkWS.next({ "overlay": { "command": "play" } });
    }

    pause() {
        this.bkWS.next({ "overlay": { "command": "pause" } });
    }

    formatLabel(value: number) {
        return value*10;
    }

}
