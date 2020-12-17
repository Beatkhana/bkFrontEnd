import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-ta',
    templateUrl: './ta.component.html',
    styleUrls: ['./ta.component.scss']
})
export class TaComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
        let node = document.createElement('script');
        node.src = '/assets/ta/bundle.js';
        node.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(node);
    }

}
