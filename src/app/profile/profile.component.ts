import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends AppComponent implements OnInit {

    title = "Profile | BeatKhana!";
    private url = '/api/rankings';
    loading = true;

    ngOnInit(): void {
        this.setTitle(this.title);
    }

}
