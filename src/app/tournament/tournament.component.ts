import { Component, OnInit, Inject, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { AppComponent } from '../app.component';
import { ITournament } from '../interfaces/tournament';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { map, startWith, switchMap } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../services/toast.service';


@Component({
    selector: 'app-tournament',
    templateUrl: './tournament.component.html',
    styleUrls: ['./tournament.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TournamentComponent extends AppComponent implements OnInit {

    title = "BeatKhana!";
    private url = '/api/tournament';
    public tournament;
    public tourneyId: string;
    loading = true;
    isInfo = true;
    isMapPool = false;
    isBracket = false;

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.tourneyId = params.get('id');
            if (this.router.url.includes('map-pool')) {
                this.isMapPool = true;
                this.isBracket = false;
                this.isInfo = false;
            } else if (this.router.url.includes('bracket')) {
                this.isBracket = true;
                this.isMapPool = false;
                this.isInfo = false;
            } else {
                this.isMapPool = false;
                this.isBracket = false;
                this.isInfo = true;
            }
            // console.log(this.tourneyId);
            this.getTournaments()
                .subscribe(data => {
                    this.tournament = data[0];
                    this.loading = false;
                    this.tournament.safeInfo = this.sanitizer.bypassSecurityTrustHtml(this.tournament.info);
                    this.setTitle(this.tournament.name + ' | ' + this.title);
                });
        });
        
        this.router.events.subscribe((val) => {
            if (this.router.url.includes('map-pool')) {
                this.isMapPool = true;
                this.isBracket = false;
                this.isInfo = false;
            } else if (this.router.url.includes('bracket')) {
                this.isBracket = true;
                this.isMapPool = false;
                this.isInfo = false;
            } else {
                this.isMapPool = false;
                this.isBracket = false;
                this.isInfo = true;
            }
        });
        // console.log(this.user);
    }

    public getTournaments(): Observable<ITournament[]> {
        return this.http.get<ITournament[]>(this.url + '/' + this.tourneyId);
    }

    openEdit() {
        const dialog = this.dialog.open(editTournament, {
            // height: '400px',
            maxHeight: '60vh',
            width: '80vw',
            data: { tournament: this.tournament }
        });

        dialog.afterClosed().subscribe(
            data => {
                if (data) {
                    // console.log("Dialog output:", data);
                    this.tournament = { ...this.tournament, ...data };
                    this.tournament.safeInfo = this.sanitizer.bypassSecurityTrustHtml(this.tournament.info);
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
        private notif: NotificationService
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
            endDate: this.data.tournament.endDate,
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

    public formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    onSubmit() {
        if (typeof this.tournamentForm.value.date.getMonth === 'function') {
            this.tournamentForm.value.date = this.formatDate(this.tournamentForm.value.date.toString());
        }
        if (typeof this.tournamentForm.value.endDate.getMonth === 'function') {
            this.tournamentForm.value.endDate = this.formatDate(this.tournamentForm.value.endDate.toString());
        }
        this.updateTournament(this.tournamentForm.value)
            .subscribe(data => {
                if (!data.flag) {
                    this.notif.showSuccess('', 'Successfully updated tournament');
                } else {
                    this.notif.showError('', 'Error updating tournament');
                }
                this.dialogRef.close(this.tournamentForm.value);
            }, error => {
                this.notif.showError('', 'Error updating tournament');
                console.error("Error: ", error);
                this.dialogRef.close(this.tournamentForm.value);
            });
    }

    getUsers(): Observable<any> {
        return this.http.get('/api/users');
    }

    public updateTournament(data: any): Observable<any> {
        return this.http.put(this.url, data, { observe: 'response' });
    }
}
