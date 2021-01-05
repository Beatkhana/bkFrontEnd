import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-awards2020',
    templateUrl: './awards2020.component.html',
    styleUrls: ['./awards2020.component.scss']
})
export class Awards2020Component implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    scroll(el: HTMLElement) {
        el.scrollIntoView({
            behavior: 'smooth'
        });
    }

}
