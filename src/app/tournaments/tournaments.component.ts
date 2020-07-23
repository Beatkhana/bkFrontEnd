import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs';
import { ITournament } from '../interfaces/tournament';
import { FormGroup, FormBuilder, Validators, FormControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '../services/toast.service';
import { map, startWith } from 'rxjs/operators';


@Component({
    selector: 'app-tournaments',
    templateUrl: './tournaments.component.html',
    styleUrls: ['./tournaments.component.scss'],
})
export class TournamentsComponent extends AppComponent implements OnInit {

    title = "BeatKhana!";
    private url = '/api/tournaments';
    public tournaments = [];
    loading = true;



    ngOnInit(): void {
        this.getTournaments()
            .subscribe(data => {
                data.sort(function (a, b) {
                    return <any>new Date(a.date) - <any>new Date(b.date);
                });
                this.tournaments = data;
                this.loading = false;
            });
        this.setTitle(this.title);
        this.metaTags.defineTags('/', 'BeatKhana!', 'The one stop spot for all Beat Saber tournament information!', 'assets/images/icon/BeatKhana Logo RGB.png')
    }

    public getTournaments(): Observable<ITournament[]> {
        return this.http.get<ITournament[]>(this.url);
    }

    openDialog() {
        const dialog = this.dialog.open(newTournamentDialog, {
            height: '50vw',
            maxHeight: '60vh',
            width: '60vw',
        });

        dialog.afterClosed()
            .subscribe(data => {
                if(data) {
                    this.getTournaments()
                        .subscribe(data => {
                            data.sort(function (a, b) {
                                return <any>new Date(a.date) - <any>new Date(b.date);
                            });
                            this.tournaments = data;
                            this.loading = false;
                        });
                }
            });
    }

    archive(id: number) {
        this.dialog.open(archiveTournamentDialog, {
            width: '60vw',
            data: { id: id }
        });
    }

    public archiveTournament(id: number): Observable<ITournament[]> {
        return this.http.put<ITournament[]>('/api/archiveTournament', { 'id': id });
    }

}

@Component({
    selector: 'newTournamentDialog',
    templateUrl: './newTournamentDialog.html',
})
export class newTournamentDialog implements OnInit {
    tournamentForm: FormGroup;

    users = [];

    filteredOptions: Observable<any>;

    constructor(private fb: FormBuilder, public http: HttpClient, private router: Router, private dialogRef: MatDialogRef<newTournamentDialog>, private notif: NotificationService) {
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

    ngOnInit() {
        this.tournamentForm = this.fb.group({
            name: ['', [
                Validators.required
            ]],
            date: ['', [
                Validators.required
            ]],
            endDate: ['', [
                Validators.required
            ]],
            discord: ['', [
                Validators.required,
                Validators.pattern('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$')
            ]],
            owner: ['', [
                Validators.required, this.requireMatch.bind(this)
            ]],
            twitchLink: ['', [
                Validators.required
            ]],
            prize: '',
            info: '',
            image: ['', [
                Validators.required
            ]],
            imgName: ['', [
                Validators.required
            ]]
        });
    }

    private _filter(name: string) {
        const filterValue = name.toLowerCase();

        return this.users.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
    }

    displayFn(id): string {
        let user = this.users.find(x => x.discordId == id);
        return user && user.name ? user.name : '';
    }

    private requireMatch(control: FormControl): ValidationErrors | null {
        const selection: any = control.value;
        if (!this.users.some(x => x.discordId == selection)) {
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

    onSubmit() {
        this.addTournament(this.tournamentForm.value)
            .subscribe(data => {
                if (data) {
                    if (!data.flag) {
                        this.notif.showSuccess('', 'Successfully created tournament');
                        this.dialogRef.close(true);
                    } else {
                        console.error("Error: ", data);
                        this.notif.showError('', 'Error creating tournament');
                        this.dialogRef.close(false);
                    }
                }
            }, error => {
                this.notif.showError('', 'Error creating tournament');
                console.error("Error: ", error);
                this.dialogRef.close(false);
            });
    }

    getUsers(): Observable<any> {
        return this.http.get('/api/users');
    }

    addTournament(tournament: ITournament): Observable<any> {
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

    constructor(private fb: FormBuilder, public http: HttpClient, private router: Router, @Inject(MAT_DIALOG_DATA) public data: any, private notif: NotificationService) { }

    ngOnInit() {
        this.archiveForm = this.fb.group({
            first: ['', [
                Validators.required
            ]],
            second: ['', [
                Validators.required
            ]],
            third: ['', [
                Validators.required
            ]],
            id: this.data.id
        })
    }

    onSubmit() {
        this.archiveTournament(this.archiveForm.value)
            .subscribe(data => {
                if (data) {
                    if (!data.flag) {
                        this.notif.showSuccess('', 'Successfully archived tournament');
                        this.router.navigateByUrl('/archive', { skipLocationChange: true }).then(() => {
                            this.router.navigate(['']);
                        });
                    } else {
                        console.error("Error: ", data);
                        this.notif.showError('', 'Error archiving tournament');
                    }
                }
            }, error => {
                this.notif.showError('', 'Error archiving tournament');
                console.error("Error: ", error);
            });
    }

    public archiveTournament(data: any): Observable<any> {
        return this.http.put<any>('/api/archiveTournament', data);
    }

}
