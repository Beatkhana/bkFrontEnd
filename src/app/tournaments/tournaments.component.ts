import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { ITournament } from '../models/tournament';
import { NotificationService } from '../services/toast.service';

@Component({
    selector: 'app-tournaments',
    templateUrl: './tournaments.component.html',
    styleUrls: ['./tournaments.component.scss'],
})
export class TournamentsComponent extends AppComponent implements OnInit {
    title = 'BeatKhana!';
    private url = '/api/tournaments';
    public tournaments: ITournament.Tournament[] = [];
    loading = true;

    linkOptions = {
        target: {
            url: '_blank',
        },
    };

    ngOnInit(): void {
        this.getTournaments().subscribe((data) => {
            data.sort(function (a, b) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
            this.tournaments = data;
            this.loading = false;
        });
        this.setTitle(this.title);
        this.metaTags.defineTags(
            '/',
            'BeatKhana!',
            'The one stop spot for all Beat Saber tournament information!',
            'assets/images/icon/BeatKhana Logo RGB.png'
        );
    }

    public getTournaments(): Observable<ITournament.Tournament[]> {
        return this.http.get<ITournament.Tournament[]>(this.url);
    }

    openDialog() {
        const dialog = this.dialog.open(newTournamentDialog, {
            minWidth: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
        });

        dialog.afterClosed().subscribe((data) => {
            if (data) {
                this.getTournaments().subscribe((data) => {
                    data.sort(function (a, b) {
                        return (
                            new Date(a.date).getTime() -
                            new Date(b.date).getTime()
                        );
                    });
                    this.tournaments = data;
                    this.loading = false;
                });
            }
        });
    }

    archive(id: String) {
        this.dialog.open(archiveTournamentDialog, {
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: { id: id },
        });
    }

    public archiveTournament(id: number): Observable<ITournament.Tournament[]> {
        return this.http.put<ITournament.Tournament[]>(
            '/api/archiveTournament',
            { id: id }
        );
    }

    public hasRole(roleId: number) {
        return this.user.roles.map((x) => x.roleId).includes(roleId);
    }
}

@Component({
    selector: 'newTournamentDialog',
    templateUrl: './newTournamentDialog.html',
})
export class newTournamentDialog implements OnInit {
    tournamentForm: FormGroup;

    users = [];
    isSubmitted = false;

    filteredOptions: Observable<any>;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        private router: Router,
        private dialogRef: MatDialogRef<newTournamentDialog>,
        private notif: NotificationService
    ) {
        this.getUsers().subscribe((data) => {
            this.users = data;
            this.filteredOptions = this.tournamentForm.valueChanges.pipe(
                startWith(''),
                map((value) =>
                    typeof value === 'string' ? value : value.owner
                ),
                map((owner) =>
                    owner ? this._filter(owner) : this.users.slice()
                )
            );
        });
    }

    ngOnInit() {
        this.tournamentForm = this.fb.group({
            name: ['', [Validators.required]],
            date: ['', [Validators.required]],
            endDate: ['', [Validators.required]],
            discord: [
                '',
                [
                    Validators.required,
                    Validators.pattern(
                        '^(http://www.|https://www.|http://|https://)?[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{2,5}(:[0-9]{1,5})?(/.*)?$'
                    ),
                ],
            ],
            owner: ['', [Validators.required, this.requireMatch.bind(this)]],
            twitchLink: ['', [Validators.required]],
            prize: '',
            info: '',
            image: ['', [Validators.required]],
            imgName: ['', [Validators.required]],
            is_mini: false,
        });
    }

    private _filter(name: string) {
        const filterValue = name.toLowerCase();

        return this.users.filter(
            (option) => option.name.toLowerCase().indexOf(filterValue) === 0
        );
    }

    displayFn(id): string {
        let user = this.users.find((x) => x.discordId == id);
        return user && user.name ? user.name : '';
    }

    private requireMatch(control: FormControl): ValidationErrors | null {
        const selection: any = control.value;
        if (!this.users.some((x) => x.discordId == selection)) {
            return { requireMatch: true };
        }
        return null;
    }

    get discord() {
        return this.tournamentForm.get('discord');
    }

    get twitch() {
        return this.tournamentForm.get('twitchLink');
    }

    public formatDate(date) {
        var d = new Date(date),
            month = '' + d.getMonth(),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        // return [year, month, day].join('-');
        return new Date(Date.UTC(year, parseInt(month), parseInt(day)));
    }

    onSubmit() {
        this.isSubmitted = true;
        this.tournamentForm.value.is_mini = +this.tournamentForm.value.is_mini;
        // this.tournamentForm.value.date = this.formatDate(this.tournamentForm.value.date.toString())
        // this.tournamentForm.value.endDate = this.formatDate(this.tournamentForm.value.endDate.toString())

        this.addTournament(this.tournamentForm.value).subscribe(
            (data) => {
                this.notif.showSuccess('', 'Successfully created tournament');
                this.dialogRef.close(true);
            },
            (error) => {
                this.notif.showError('', 'Error creating tournament');
                console.error('Error: ', error);
                this.dialogRef.close(false);
            }
        );
    }

    getUsers(): Observable<any> {
        return this.http.get('/api/users');
    }

    addTournament(tournament: ITournament.Tournament): Observable<any> {
        return this.http.post<any>('/api/tournament', tournament);
    }

    selectedFile: File;
    base64: string;

    onFileChanged(event) {
        this.selectedFile = event.target.files[0];
        this.tournamentForm.patchValue({ imgName: this.selectedFile.name });

        let reader = new FileReader();
        reader.readAsDataURL(this.selectedFile);
        reader.onload = () => {
            this.tournamentForm.patchValue({ image: reader.result });
        };
    }
}

@Component({
    selector: 'archiveTournamentDialog',
    templateUrl: './archiveTournamentDialog.html',
})
export class archiveTournamentDialog implements OnInit {
    archiveForm: FormGroup;
    tournamentId: number;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private notif: NotificationService
    ) {}

    ngOnInit() {
        this.archiveForm = this.fb.group({
            first: ['', [Validators.required]],
            second: ['', [Validators.required]],
            third: ['', [Validators.required]],
            id: this.data.id,
        });
    }

    async onSubmit() {
        try {
            await this.http
                .put<any>('/api/archiveTournament', this.archiveForm.value)
                .toPromise();
            this.notif.showSuccess('', 'Successfully archived tournament');
            this.router
                .navigateByUrl('/archive', { skipLocationChange: true })
                .then(() => {
                    this.router.navigate(['']);
                });
        } catch (error) {
            console.error('Error: ', error);
            this.notif.showError('', 'Error archiving tournament');
        }
    }
}
