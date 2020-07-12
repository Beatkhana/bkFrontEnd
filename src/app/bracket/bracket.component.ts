import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-bracket',
    templateUrl: './bracket.component.html',
    styleUrls: ['./bracket.component.scss']
})
export class BracketComponent extends AppComponent implements OnInit {

    private url = '/api/tournament';
    @Input() tournament;
    public tourneyId: string;
    loading = false;

    ngOnInit(): void {
    }

}
