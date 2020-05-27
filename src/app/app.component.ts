import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'BeatKhana!';
    public constructor(public titleService: Title, public http: HttpClient, public route: ActivatedRoute) { }

    public setTitle(newTitle: string) {
        this.titleService.setTitle(newTitle);
    }
}
