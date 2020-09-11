import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
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
    curPoolLive = false;
    poolsLen = 0;

    public constructor(
        public http: HttpClient,
        public dialog: MatDialog,
        private notif: NotificationService,
        private sanitizer:DomSanitizer
    ) {
        if (this.user == null) {
            this.updateUser();
        }
    }

    mapPools = [];
    poolValues = [];

    ngOnInit(): void {
        this.getPools()
            .subscribe(data => {
                this.loading = false;
                this.mapPools = data;
                this.curPoolId = Object.keys(this.mapPools)[0];
                this.poolsLen = Object.keys(this.mapPools).length;
                this.poolValues = Object.values(this.mapPools);
            });
    }

    updateUser() {
        this.logIn()
            .subscribe(data => {
                if (data) {
                    this.user = data[0];
                    if (this.user != null && (this.user['roleIds'].includes('1') || this.user.discordId == this.tournament.owner)) {
                        this.isAuthorised = true;
                        this.columnsToDisplay.push('delete');
                    }
                }
            });
    }

    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    public logIn(): Observable<User[]> {
        // console.log('/api/discordAuth?code=' + code);
        return this.http.get<User[]>('/api/user');
    }

    delete(songId) {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
            // height: '400px',
            width: '400px',
            data: {
                cancelText: 'Cancel',
                confirmText: 'Delete',
                message: 'Are you sure you want to delete this song from this pool?',
                title: 'Delete Song?'
            }
        });

        dialog.afterClosed().subscribe(
            data => {
                if (data) {
                    let info = {
                        tournamentId: this.tournament.tournamentId,
                        id: songId
                    }
                    this.deleteSong(info)
                        .subscribe(data => {
                            if (!data.flag) {
                                this.notif.showSuccess('', 'Successfully deleted song from map pool');
                                this.loading = true;
                                this.getPools()
                                    .subscribe(data => {
                                        this.loading = false;
                                        this.mapPools = data;
                                        this.curPoolId = Object.keys(this.mapPools)[0];
                                        this.poolsLen = Object.keys(this.mapPools).length;
                                        // console.log(data)
                                    });
                            } else {
                                console.error("Error: ", data);
                                this.notif.showError('', 'Error deleting song from map pool');
                            }
                        });
                }
            }
        );
    }

    public deleteSong(data): Observable<any> {
        return this.http.post(`api/tournament/${this.tournament.tournamentId}/deleteSong`, data);
    }

    openCreate() {
        const dialog = this.dialog.open(createPoolDialog, {
            // height: '400px',
            minWidth: '40vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: {
                tournament: this.tournament,
                edit: false
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    this.loading = true;
                    this.getPools()
                        .subscribe(data => {
                            this.loading = false;
                            this.mapPools = data;
                            this.curPoolId = Object.keys(this.mapPools)[0];
                            this.poolsLen = Object.keys(this.mapPools).length;
                        });
                }
            });
    }

    tabClick(tab) {
        let id = Object.keys(this.mapPools)[tab.index];
        this.curPoolLive = !!this.mapPools[id].live;
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
        downloadAnchorNode.setAttribute("download", `${this.tournament.name}_` + this.mapPools[this.curPoolId].poolName + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

    }

    public getPools(): Observable<any[]> {
        return this.http.get<any[]>(`api/tournament/${this.tournament.tournamentId}/map-pools`);
    }

    addSong() {
        const dialog = this.dialog.open(addSongDialog, {
            minWidth: '40vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: {
                tournament: this.tournament,
                mapPools: this.mapPools
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    this.loading = true;
                    this.getPools()
                        .subscribe(data => {
                            this.loading = false;
                            this.mapPools = data;
                            this.curPoolId = Object.keys(this.mapPools)[0];
                            this.poolsLen = Object.keys(this.mapPools).length;
                        });
                }
            });
    }

    editPool() {
        const dialog = this.dialog.open(createPoolDialog, {
            // height: '400px',
            minWidth: '40vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: {
                tournament: this.tournament,
                mapPool: this.mapPools[this.curPoolId],
                edit: true
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    this.loading = true;
                    this.getPools()
                        .subscribe(data => {
                            this.loading = false;
                            this.mapPools = data;
                            this.curPoolId = Object.keys(this.mapPools)[0];
                            this.poolsLen = Object.keys(this.mapPools).length;
                            // console.log(data)
                        });
                }
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

    dialogTitle = "";
    buttonMessage = "";
    isSubmitted = false;

    ngOnInit() {
        if (this.data.edit) {
            this.dialogTitle = "Edit Map Pool";
            this.buttonMessage = "Update Map Pool";
            this.newPoolForm = this.fb.group({
                poolId: this.data.mapPool.id,
                poolName: [this.data.mapPool.poolName, [
                    Validators.required
                ]],
                image: [this.data.mapPool.image, [
                    Validators.required
                ]],
                description: this.data.mapPool.description,
                live: this.data.mapPool.live,
                is_qualifiers: this.data.mapPool.is_qualifiers
            });
        } else {
            this.dialogTitle = "Create Map Pool";
            this.buttonMessage = "Add Map Pool";
            this.newPoolForm = this.fb.group({
                tournamentId: this.data.tournament.tournamentId,
                poolName: ['', [
                    Validators.required
                ]],
                image: ['', [
                    Validators.required
                ]],
                description: '',
                live: 0,
                is_qualifiers: 0
            });
        }
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
        this.isSubmitted = true;
        if (this.data.edit) {
            this.newPoolForm.value.live = +this.newPoolForm.value.live;
            this.updatePool(this.newPoolForm.value)
                .subscribe(data => {
                    if (!data.flag) {
                        this.notif.showSuccess('', 'Successfully updated map pool');
                    } else {
                        console.error("Error: ", data);
                        this.notif.showError('', 'Error updating map pool');
                    }
                    this.dialogRef.close(true);
                }, error => {
                    this.notif.showError('', 'Error updating map pool');
                    console.error("Error: ", error);
                    this.dialogRef.close(true);
                });
        } else {
            this.addPool(this.newPoolForm.value)
                .subscribe(data => {
                    if (!data.flag) {
                        this.notif.showSuccess('', 'Successfully created map pool');
                    } else {
                        this.notif.showError('', 'Error creating map pool');
                    }
                    this.dialogRef.close(true);
                }, error => {
                    this.notif.showError('', 'Error creating map pool');
                    console.error("Error: ", error);
                    this.dialogRef.close(true);
                });
        }
    }

    addPool(data: any): Observable<any> {
        return this.http.post(`/api/tournament/${this.data.tournament.tournamentId}/addPool`, data);
    }

    updatePool(data: any): Observable<any> {
        return this.http.put(`/api/tournament/${this.data.tournament.tournamentId}/map-pools`, data);
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
    
    isSubmitted = false;
    beatsaver = false;

    ngOnInit() {
        this.newSongForm = this.fb.group({
            tournamentId: this.data.tournament.tournamentId,
            poolIds: [[], [
                Validators.minLength(1)
            ]],
            ssLink: ['', [
                Validators.required
            ]],
            diff: ''
        });

    }

    onCheckChange(event) {
        // console.log(event);
        // console.log(this.newSongForm.value.poolIds);
        let poolId = event.source.value;
        if (event.checked && !this.newSongForm.value.poolIds.includes(poolId)) {
            this.newSongForm.value.poolIds.push(poolId);
        } else {
            this.newSongForm.value.poolIds.splice(this.newSongForm.value.poolIds.findIndex((e) => e === poolId), 1);
            // delete this.newSongForm.value.poolIds[];
        }
    }

    updateVal() {
        this.beatsaver = this.newSongForm.value.ssLink.includes('beatsaver');
    }

    onSubmit() {
        this.isSubmitted = true;
        // console.log(this.newSongForm.value);
        this.addSong(this.newSongForm.value)
            .subscribe(data => {
                if (!data.flag) {
                    this.notif.showSuccess('', 'Successfully added song to pool/s');
                } else {
                    this.notif.showError('', 'Error adding song to pool/s');
                    console.log(data.err)
                }
                this.dialogRef.close(this.newSongForm.value);
            }, error => {
                this.notif.showError('', 'Error adding song to pool/s');
                console.error("Error: ", error);
                this.dialogRef.close(this.newSongForm.value);
            });
    }

    addSong(data: any): Observable<any> {
        return this.http.post(`/api/tournament/${this.data.tournament.tournamentId}/addSong${this.beatsaver ? 'ByKey' : ''}`, data);
    }
}