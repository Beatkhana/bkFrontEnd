import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs';
import { ITournament } from '../interfaces/tournament';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
    selector: 'app-tournaments',
    templateUrl: './tournaments.component.html',
    styleUrls: ['./tournaments.component.scss']
})
export class TournamentsComponent extends AppComponent implements OnInit {

    title = "BeatKhana!";
    private url = '/api/tournaments';
    public tournaments = [];
    loading = true;



    ngOnInit(): void {
        this.getTournaments()
            .subscribe(data => {
                this.tournaments = data;
                this.loading = false;
            });
        this.setTitle(this.title);
        console.log(this.user)
        // console.log(this.user)
    }

    public getTournaments(): Observable<ITournament[]> {
        return this.http.get<ITournament[]>(this.url);
    }

    openDialog() {
        this.dialog.open(newTournamentDialog, {
            // height: '400px',
            width: '60vw',
        });
    }

    archive(id: number) {
        console.log(id);
        // this.archiveTournament(id);
        // archiveTournamentDialog.archiveId(id);
        this.dialog.open(archiveTournamentDialog, {
            // height: '400px',
            width: '60vw',
            data: {id: id}
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

    constructor(private fb: FormBuilder, public http: HttpClient, private router: Router,) { 
        this.getUsers()
            .subscribe(data => {
                this.users = data;
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
            time: ['', [
                Validators.required
            ]],
            discord: ['', [
                Validators.required,
                Validators.pattern('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$')
            ]],
            owner: ['', [
                Validators.required
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

    get discord() {
        return this.tournamentForm.get('discord');
    }

    onSubmit() {
        console.log(this.tournamentForm.value);
        this.addTournament(this.tournamentForm.value)
            .subscribe(data => {
                if (data) {
                    // this.router.navigate(['']);
                    this.router.navigateByUrl('/archive', { skipLocationChange: true }).then(() => {
                        this.router.navigate(['']);
                    });
                    console.log(data);
                }
            });
    }

    getUsers(): Observable<any> {
        return this.http.get('/api/users');
    }

    addTournament(tournament: ITournament): Observable<ITournament> {
        return this.http.post<ITournament>('/api/tournament', tournament);
    }

    selectedFile: File;
    base64: string;

    onFileChanged(event) {
        this.selectedFile = event.target.files[0];
        this.tournamentForm.patchValue({imgName: this.selectedFile.name});

        let reader = new FileReader();
        reader.readAsDataURL(this.selectedFile);
        reader.onload = () => {
            this.tournamentForm.patchValue({image: reader.result});
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

    constructor(private fb: FormBuilder, public http: HttpClient, private router: Router,@Inject(MAT_DIALOG_DATA) public data: any) { }

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

    // archiveId(id) {
    //     this.tournamentId = id;
    //     this.archiveForm.patchValue({id: id});
    // }


    onSubmit() {
        console.log(this.archiveForm.value);
        this.addTournament(this.archiveForm.value)
            .subscribe(data => {
                if (data) {
                    // this.router.navigate(['']);
                    this.router.navigateByUrl('/archive', { skipLocationChange: true }).then(() => {
                        this.router.navigate(['']);
                    });
                    console.log(data);
                }
            });
    }

    public addTournament(data: any): Observable<ITournament[]> {
        return this.http.put<ITournament[]>('/api/archiveTournament', data);
    }
    
}
