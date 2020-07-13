import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { User } from '../models/user.model';
import { NotificationService } from '../services/toast.service';

@Component({
    selector: 'app-map-pool',
    templateUrl: './map-pool.component.html',
    styleUrls: ['./map-pool.component.scss']
})
export class MapPoolComponent implements OnInit {

    private url = '/api/tournament';
    @Input() tournament;
    public tourneyId: string;
    loading = true;

    isAuthorised = false;

    user: User = null;

    columnsToDisplay = ['image', 'songName', 'diff', 'bsaver', 'oneClick'];

    curPoolId = '0';
    poolsLen = 0;

    public constructor(
        public http: HttpClient,
        public dialog: MatDialog
    ) {
        // console.log(this.user);
        if (this.user == null) {
            this.updateUser();
        }
    }

    mapPools = [];

    ngOnInit(): void {
        this.getPools()
            .subscribe(data => {
                this.loading = false;
                this.mapPools = data;
                this.curPoolId = Object.keys(this.mapPools)[0];
                this.poolsLen = Object.keys(this.mapPools).length;
                console.log(data)
            });
    }

    updateUser() {
        this.logIn()
            .subscribe(data => {
                if (data) {
                    this.user = data[0];
                    if (this.user != null && (this.user['roleIds'].includes('1') || this.user.discordId == this.tournament.owner)) {
                        this.isAuthorised = true;
                    }
                }
            });
    }

    public logIn(): Observable<User[]> {
        // console.log('/api/discordAuth?code=' + code);
        return this.http.get<User[]>('/api/user');
    }

    openCreate() {
        const dialog = this.dialog.open(createPoolDialog, {
            // height: '400px',
            maxHeight: '60vh',
            width: '40vw',
            data: { tournament: this.tournament }
        });

        dialog.afterClosed()
            .subscribe(data => {
                this.loading = true;
                this.getPools()
                    .subscribe(data => {
                        this.loading = false;
                        this.mapPools = data;
                        this.curPoolId = Object.keys(this.mapPools)[0];
                        this.poolsLen = Object.keys(this.mapPools).length;
                        console.log(data)
                    });
            });
    }

    tabClick(tab) {
        let id = Object.keys(this.mapPools)[tab.index]
        this.curPoolId = id;
    }

    downloadPool() {
        let curSongs = this.mapPools[this.curPoolId].songs.map(e => { return { hash: e.hash } });
        let playlist = {
            playlistTitle: this.mapPools[this.curPoolId].poolName,
            playlistAuthor: 'BeatKhana!',
            playlistDescription: this.mapPools[this.curPoolId].description,
            image: this.mapPools[this.curPoolId].image,
            songs: curSongs
        }
        let data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playlist));
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playlist));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", this.mapPools[this.curPoolId].poolName + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

    }

    public getPools(): Observable<any[]> {
        return this.http.get<any[]>('api/map-pools/' + this.tournament.id);
    }

    addSong() {
        const dialog = this.dialog.open(addSongDialog, {
            // height: '400px',
            maxHeight: '60vh',
            width: '40vw',
            data: {
                tournament: this.tournament,
                mapPools: this.mapPools
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                this.loading = true;
                this.getPools()
                    .subscribe(data => {
                        this.loading = false;
                        this.mapPools = data;
                        this.curPoolId = Object.keys(this.mapPools)[0];
                        this.poolsLen = Object.keys(this.mapPools).length;
                        console.log(data)
                    });
            });
    }

}

@Component({
    selector: 'createPoolDialog',
    templateUrl: './createPoolDialog.html',
})
export class createPoolDialog implements OnInit {

    newPoolForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<createPoolDialog>,
        private notif: NotificationService
    ) { }

    ngOnInit() {
        this.newPoolForm = this.fb.group({
            tournamentId: this.data.tournament.id,
            poolName: ['', [
                Validators.required
            ]],
            image: ['', [
                Validators.required
            ]],
            description: '',
            live: 0
        });

    }

    selectedFile: File;
    base64: string;

    onFileChanged(event) {
        this.selectedFile = event.target.files[0];
        // this.newPoolForm.patchValue({imgName: this.selectedFile.name});

        let reader = new FileReader();
        reader.readAsDataURL(this.selectedFile);
        reader.onload = () => {
            this.newPoolForm.patchValue({ image: reader.result });
        };
    }

    onSubmit() {
        this.addPool(this.newPoolForm.value)
            .subscribe(data => {
                if (!data.flag) {
                    this.notif.showSuccess('', 'Successfully created map pool');
                } else {
                    this.notif.showError('', 'Error updating tournament');
                }
                this.dialogRef.close(this.newPoolForm.value);
            }, error => {
                this.notif.showError('', 'Error creating map pool');
                console.error("Error: ", error);
                this.dialogRef.close(this.newPoolForm.value);
            });
    }

    addPool(data: any): Observable<any> {
        return this.http.post('/api/tournament/addPool', data);
    }
}

@Component({
    selector: 'addSongDialog',
    templateUrl: './addSongDialog.html',
})
export class addSongDialog implements OnInit {

    newSongForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<createPoolDialog>,
        private notif: NotificationService
    ) { }

    ngOnInit() {
        this.newSongForm = this.fb.group({
            tournamentId: this.data.tournament.id,
            poolIds: [[], [
                Validators.minLength(1)
            ]],
            ssLink: ['', [
                Validators.required
            ]]
        });

    }

    onCheckChange(event) {
        console.log(event);
        console.log(this.newSongForm.value.poolIds);
        let poolId = event.source.value;
        if (event.checked && !this.newSongForm.value.poolIds.includes(poolId)) {
            this.newSongForm.value.poolIds.push(poolId);
        } else {
            this.newSongForm.value.poolIds.splice(this.newSongForm.value.poolIds.findIndex((e) => e === poolId), 1);
            // delete this.newSongForm.value.poolIds[];
        }
    }

    onSubmit() {
        console.log(this.newSongForm.value);
        this.addSong(this.newSongForm.value)
            .subscribe(data => {
                if (!data.flag) {
                    this.notif.showSuccess('', 'Successfully added song to pool/s');
                } else {
                    this.notif.showError('', 'Error adding song to pool/s');
                }
                this.dialogRef.close(this.newSongForm.value);
            }, error => {
                this.notif.showError('', 'Error adding song to pool/s');
                console.error("Error: ", error);
                this.dialogRef.close(this.newSongForm.value);
            });
    }

    addSong(data: any): Observable<any> {
        return this.http.post('/api/tournament/addSong', data);
    }
}