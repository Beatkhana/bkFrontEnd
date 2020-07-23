import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-participants',
    templateUrl: './participants.component.html',
    styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {

    @Input() tournament;
    @Input() participants;

    constructor(public http: HttpClient,) { }

    ngOnInit(): void {
        this.setParticpants();
    }

    setParticpants() {
        this.getParticipants()
            .subscribe(data => {
                this.participants = data;
            })
    }

    getParticipants(): Observable<any> {
        return this.http.get(`/api/tournament/${this.tournament.tournamentId}/participants`);
    }

}
