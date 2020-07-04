import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { AppComponent } from '../app.component';
import { ITournament } from '../interfaces/tournament';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { map, startWith } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';


@Component({
    selector: 'app-tournament',
    templateUrl: './tournament.component.html',
    styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent extends AppComponent implements OnInit {

    title = "BeatKhana!";
    private url = '/api/tournament';
    public tournaments = [];
    private tourneyId: string;
    loading = true;

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.tourneyId = params.get('id');
            console.log(this.tourneyId);
            this.getTournaments()
                .subscribe(data => {
                    this.tournaments = data;
                    console.log(this.tournaments)
                    this.loading = false;
                    this.setTitle(this.tournaments[0].name + ' | ' + this.title);
                });
        });

        // console.log(this.user);
    }

    public getTournaments(): Observable<ITournament[]> {
        return this.http.get<ITournament[]>(this.url + '/' + this.tourneyId);
    }

    openEdit() {
        const dialog = this.dialog.open(editTournament, {
            // height: '400px',
            width: '60vw',
            data: { tournament: this.tournaments[0] }
        });

        dialog.afterClosed().subscribe(
            data => {
                if (data) {
                    console.log("Dialog output:", data);
                    this.tournaments[0] = { ...this.tournaments[0], ...data };
                }

            }
        );
    }

    delete() {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
            // height: '400px',
            width: '400px',
            data: { 
                cancelText: 'Cancel',
                confirmText: 'Delete',
                message: 'Are you sure you want to delete, this cannot be undone',
                title: 'Delete Tournament?' 
            }
        });

        dialog.afterClosed().subscribe(
            data => {
                if (data) {
                    this.deleteTourney(this.tourneyId)
                        .subscribe(data => {
                            if (!data.error) {
                                this.router.navigate(['/']);
                            } else {
                                console.error(data.error);
                            }
                        })
                }

            }
        );

    }

    private deleteTourney(id): Observable<any> {
        return this.http.post('/api/tournament/delete/' + id, {});
    }

    receiveMessage($event) {
        console.log($event);
    }
}

@Component({
    selector: 'editTournament',
    templateUrl: './editTournament.html',
})
export class editTournament implements OnInit {
    tournamentForm: FormGroup;
    id: number;
    url = '/api/tournament/';
    users = [];

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<editTournament>,
    ) {
        this.getUsers()
            .subscribe(data => {
                this.users = data;
            });
    }

    ngOnInit() {
        this.id = this.data.tournament.id;
        this.url += this.id;
        // console.log(this.data);
        this.tournamentForm = this.fb.group({
            name: this.data.tournament.name,
            date: this.data.tournament.date,
            time: this.data.tournament.time,
            discord: this.data.tournament.discord,
            owner: this.data.tournament.owner,
            twitchLink: this.data.tournament.twitchLink,
            prize: this.data.tournament.prize,
            info: this.data.tournament.info
        });
    }

    get discord() {
        return this.tournamentForm.get('discord');
    }

    onSubmit() {
        console.log(this.tournamentForm.value);
        this.updateTournament(this.tournamentForm.value)
            .subscribe(data => {
                this.dialogRef.close(this.tournamentForm.value);
            });
    }

    getUsers(): Observable<any> {
        return this.http.get('/api/users');
    }

    public updateTournament(data: any): Observable<any> {
        console.log(this.url)
        console.log(data)
        return this.http.put(this.url, data);
    }
}
