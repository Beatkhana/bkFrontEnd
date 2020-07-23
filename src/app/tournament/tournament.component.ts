import { Component, OnInit, Inject, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { AppComponent } from '../app.component';
import { ITournament } from '../interfaces/tournament';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
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
    isParticipants = false;

    participants = [];
    isParticipant = true;
    participantData = {};

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.tourneyId = params.get('id');
            if (this.router.url.includes('map-pool')) {
                this.isMapPool = true;
                this.isBracket = false;
                this.isInfo = false;
                this.isParticipants = false;
            } else if (this.router.url.includes('bracket')) {
                this.isBracket = true;
                this.isMapPool = false;
                this.isInfo = false;
                this.isParticipants = false;
            } else if (this.router.url.includes('participants')) {
                this.isParticipants = true;
                this.isBracket = false;
                this.isMapPool = false;
                this.isInfo = false;
            } else {
                this.isMapPool = false;
                this.isBracket = false;
                this.isInfo = true;
                this.isParticipants = false;
            }
            // console.log(this.tourneyId);
            this.getTournaments()
                .subscribe(data => {
                    this.tournament = data[0];
                    if (this.tournament.public_signups == 1) {
                        this.setParticpants();
                    }
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
                this.isParticipants = false;
            } else if (this.router.url.includes('bracket')) {
                this.isBracket = true;
                this.isMapPool = false;
                this.isInfo = false;
                this.isParticipants = false;
            } else if (this.router.url.includes('participants')) {
                this.isParticipants = true;
                this.isBracket = false;
                this.isMapPool = false;
                this.isInfo = false;
            } else {
                this.isMapPool = false;
                this.isBracket = false;
                this.isInfo = true;
                this.isParticipants = false;
            }
        });
    }

    setParticpants() {
        this.getParticipants()
            .subscribe(data => {
                this.participants = data;
                if(this.user != null && !this.participants.some(x => x.discordId == this.user.discordId)){
                    this.isParticipant = false;
                }
            })
    }

    getParticipants(): Observable<any> {
        return this.http.get(`/api/tournament/${this.tournament.tournamentId}/participants`);
    }

    public getTournaments(): Observable<ITournament[]> {
        return this.http.get<ITournament[]>(this.url + '/' + this.tourneyId);
    }

    openEdit() {
        const dialog = this.dialog.open(editTournament, {
            // height: '400px',
            minWidth: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: { tournament: this.tournament }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    console.log("Dialog output:", data);
                    this.tournament = { ...this.tournament, ...data };
                    this.tournament.safeInfo = this.sanitizer.bypassSecurityTrustHtml(this.tournament.info);
                }
            });
    }

    tourneySettings() {
        const dialog = this.dialog.open(tournamentSettingsDialog, {
            // height: '400px',
            minWidth: '40vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: { tournament: this.tournament }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    // console.log("Dialog output:", data);
                    this.tournament = { ...this.tournament, ...data };
                    this.tournament.safeInfo = this.sanitizer.bypassSecurityTrustHtml(this.tournament.info);
                }
            });
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

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    this.deleteTourney(this.tourneyId)
                        .subscribe(data => {
                            if (!data.flag) {
                                this.notif.showSuccess('', 'Successfully deleted tournament');
                                this.router.navigate(['/']);
                            } else {
                                console.error("Error: ", data);
                                this.notif.showError('', 'Error deleting tournament');
                            }
                        })
                }
            });
    }

    signUp() {
        const dialog = this.dialog.open(signUpDialog, {
            // height: '400px',
            minWidth: '40vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: { tournament: this.tournament }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    this.isParticipant = true;
                }
            });
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

    filteredOptions: Observable<any>;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<editTournament>,
        private notif: NotificationService
    ) {

    }

    ngOnInit() {
        this.id = this.data.tournament.tournamentId;
        this.url += this.id;
        // console.log(this.data);
        this.tournamentForm = this.fb.group({
            name: this.data.tournament.name,
            date: this.data.tournament.date,
            endDate: this.data.tournament.endDate,
            discord: this.data.tournament.discord,
            owner: [this.data.tournament.owner, [Validators.required, this.requireMatch.bind(this)]],
            twitchLink: this.data.tournament.twitchLink,
            prize: this.data.tournament.prize,
            info: this.data.tournament.info
        });

        this.getUsers()
            .subscribe(data => {
                this.users = data;
                this.filteredOptions = this.tournamentForm.valueChanges
                    .pipe(
                        startWith(''),
                        map(value => typeof value === 'string' ? value : value.owner),
                        map(owner => owner ? this._filter(owner) : this.users.slice())
                    );
            });
    }

    private _filter(name: string) {
        const filterValue = name.toLowerCase();

        return this.users.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
    }

    get discord() {
        return this.tournamentForm.get('discord');
    }

    get twitch() {
        return this.tournamentForm.get('twitchLink');
    }

    displayFn(id): string {
        let user = this.users.find(x => x.discordId == id);
        return user && user.name ? user.name : '';
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
        this.updateTournament(this.tournamentForm.value)
            .subscribe(data => {
                if (!data.flag) {
                    this.notif.showSuccess('', 'Successfully updated tournament');
                } else {
                    console.error('Error', data.err)
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
        return this.http.put(this.url, data);
    }

    private requireMatch(control: FormControl): ValidationErrors | null {
        const selection: any = control.value;
        if (!this.users.some(x => x.discordId == selection)) {
            return { requireMatch: true };
        }
        return null;
    }
}

@Component({
    selector: 'tournamentSettingsDialog',
    templateUrl: './tournamentSettingsDialog.html',
})
export class tournamentSettingsDialog implements OnInit {

    settingsForm: FormGroup;
    id: number;
    url = '/api/tournament/';
    users = [];

    filteredOptions: Observable<any>;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<tournamentSettingsDialog>,
        private notif: NotificationService
    ) {

    }

    ngOnInit() {
        this.id = this.data.tournament.id;
        this.url += this.id;
        // console.log(this.data);
        this.settingsForm = this.fb.group({
            public_signups: !!this.data.tournament.public_signups,
            public: !!this.data.tournament.public,
            state: this.data.tournament.state,
            type: this.data.tournament.type,
            has_bracket: !!this.data.tournament.has_bracket,
            has_map_pool: !!this.data.tournament.has_map_pool,
        });
    }

    onSubmit() {
        let info = {
            tournamentId: this.data.tournament.tournamentId,
            settingsId: this.data.tournament.settingsId,
            settings: this.settingsForm.value
        }
        this.updateSettings(info)
            .subscribe(data => {
                if (!data.flag) {
                    this.notif.showSuccess('', 'Successfully updated tournament settings');
                } else {
                    console.error('Error', data.err)
                    this.notif.showError('', 'Error updating tournament settings');
                }
                this.dialogRef.close(this.settingsForm.value);
            }, error => {
                this.notif.showError('', 'Error updating tournament settings');
                console.error("Error: ", error);
                this.dialogRef.close(this.settingsForm.value);
            });
    }

    updateSettings(data: any): Observable<any> {
        return this.http.put(`/api/tournament/${data.tournamentId}/settings`, data);
    }
}

@Component({
    selector: 'signUpDialog',
    templateUrl: './signUpDialog.html',
})
export class signUpDialog implements OnInit {

    signUpForm: FormGroup;
    id: number;

    filteredOptions: Observable<any>;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<signUpDialog>,
        private notif: NotificationService
    ) {

    }

    ngOnInit() {
        this.id = this.data.tournament.tournamentId;
        this.signUpForm = this.fb.group({
            tournamentId: this.id,
            comment: ''
        });
    }

    onSubmit() {
        this.signUp(this.signUpForm.value)
            .subscribe(data => {
                if (!data.flag) {
                    this.notif.showInfo('', 'Successfully signed up');
                    this.dialogRef.close(true);
                } else {
                    console.error('Error', data.err)
                    this.notif.showError('', 'Error signing up');
                    this.dialogRef.close(false);
                }
            }, error => {
                this.notif.showError('', 'Error signing up');
                console.error("Error: ", error);
                this.dialogRef.close(false);
            });
    }

    signUp(data: any): Observable<any> {
        return this.http.post(`/api/tournament/${this.id}/signUp`, data);
    }
}
