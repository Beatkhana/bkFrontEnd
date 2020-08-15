import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../services/toast.service';

@Component({
    selector: 'app-bracket',
    templateUrl: './bracket.component.html',
    styleUrls: ['./bracket.component.scss']
})
export class BracketComponent extends AppComponent implements OnInit {

    private url = '/api/tournament';
    @Input() tournament;
    public tourneyId: string;

    bracketData = [];
    loading = true;

    isAuth = false;
    btnText = 'Generate Bracket';

    firstId = 0;

    ngOnInit(): void {
        this.initSettings();
        let node = document.createElement('script');
        node.src = 'https://embed.twitch.tv/embed/v1.js';
        node.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(node);
    }

    async initSettings() {
        const matchesData: any = await this.http.get(`/api/tournament/${this.tournament.tournamentId}/bracket`).toPromise();
        this.bracketData = matchesData;
        if (matchesData.length > 0) {
            this.btnText = 'Regenerate Bracket';
        }
        const usr: any = await this.http.get(`/api/user`).toPromise();
        this.user = usr != null ? usr[0] : null;
        // console.log(this.user);
        if (this.user != null && (this.user.roleIds.includes("1") || this.tournament.owner == this.user.discordId)) {
            this.isAuth = true;
        }

        if (matchesData.length > 0) this.generateMatches(this.bracketData);
        // console.log(matchesData)
        let matchElements = document.getElementsByClassName('matchReady');
        for (let i = 0; i < matchElements.length; i++) {
            const element = matchElements[i];
            element.addEventListener("click", () => this.updateMatch(element.getAttribute('data-matchid')))
        }
        this.loading = false;
        setInterval(() => {
            this.intervalIteration += 1;
            this.updateBracket();
        },10000)
    }

    async updateBracket() {
        // this.loading = true;
        const matchesData: any = await this.http.get(`/api/tournament/${this.tournament.tournamentId}/bracket`).toPromise();
        this.bracketData = matchesData;
        
        if (matchesData.length > 0) this.generateMatches(this.bracketData);

        let matchElements = document.getElementsByClassName('matchReady');
        for (let i = 0; i < matchElements.length; i++) {
            const element = matchElements[i];
            element.addEventListener("click", () => this.updateMatch(element.getAttribute('data-matchid')))
        }

        this.loading = false;
    }

    public logIn(): Observable<any> {
        return this.http.get('/api/user');
    }

    async genBracket() {
        const dialog = this.dialog.open(generateBracketDialog, {
            minWidth: '50vw',
            // width: '50vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: this.tournament
        });

        dialog.afterClosed()
            .subscribe(async data => {
                this.updateBracket();
                // if (data) {
                //     try {
                //         const bracketGen: any = await this.http.post(`/api/tournament/${this.tournament.tournamentId}/generateBracket`, { tournamentId: this.tournament.tournamentId, data: null }).toPromise();
                //         if (!bracketGen.flag) {
                //             this.notif.showSuccess('', 'Successfully created bracket');
                //             this.initSettings();
                //         } else {
                //             console.error("Error: ", data);
                //             this.notif.showError('', 'Error creating bracket');
                //         }
                //     } catch (error) {
                //         console.error("Error: ", data);
                //         this.notif.showError('', 'Error creating bracket');
                //     }
                // }
            });
    }

    updateMatch(id) {
        const dialog = this.dialog.open(updateMatchDialog, {
            minWidth: '60vw',
            width: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            panelClass: 'matchPanel',
            data: { ...this.bracketData.find(x => x.id == id), isAuth: this.isAuth }
        });
        dialog.afterClosed()
            .subscribe(async data => {
                this.intervalIteration = 1;
                this.updateBracket();
                // if (data) {
                // }
            });
    }

    gMatches = [];

    matches = [];
    winnersMatches = [];
    losersMatches = [];

    intervalIteration = 0;

    generateMatches(data) {
        const slider: any = document.querySelector('#svgContainer');
        let isDown = false;
        let startX;
        let scrollLeft;
        let startY;
        let scrollDown;

        slider.addEventListener('mousedown', (e: any) => {
            isDown = true;
            document.getElementById("bracket-svg").style.cursor = "grabbing";
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            startY = e.pageY - slider.offsetTop;
            scrollLeft = slider.scrollLeft;
            scrollDown = slider.scrollTop;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            document.getElementById("bracket-svg").style.cursor = "grab";
            slider.classList.remove('active');
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX); //scroll-fast
            const y = e.pageY - slider.offsetTop;
            const walk2 = (y - startY);
            slider.scrollLeft = scrollLeft - walk;
            slider.scrollTop = scrollDown - walk2;
            // console.log(walk);
        });

        this.firstId = data[0].id;

        const svgMain = document.createElement('svg');
        svgMain.setAttribute('id', "bracket-svg");
        svgMain.classList.add('"bracket-svg"');

        var matches = {};

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // matches
            if (!matches[element['round']]) {
                matches[element['round']] = [];
            }

            matches[element['round']].push(element);
            this.gMatches.push(element);
        }

        // console.log(matches);


        var singleMatchRound;

        const winnersMatches = [];
        const iterator = Object.keys(matches);
        for (const key of iterator) {
            if (+key >= 0) {
                winnersMatches.push(matches[key]);
            }
        }

        const losersMatches = [];
        for (const key of iterator) {
            if (+key < 0) {
                losersMatches.push(matches[key]);
            }
        }

        const height = losersMatches.length > 0 ? winnersMatches[0].length * 75 + losersMatches[0].length * 75 + 200 : winnersMatches[0].length * 75 + 200;
        const width = losersMatches.length > 0 ? losersMatches.length * 200 + 150 : winnersMatches.length * 200 + 150;

        svgMain.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svgMain.setAttribute("width", `${width}`);
        svgMain.setAttribute("height", `${height}`);
        svgMain.style.minWidth = width + 250 + 'px';

        document.getElementById('svgContainer').setAttribute("style", `height:${height}px`);

        // console.log(winnersMatches);
        // console.log(losersMatches);

        for (let i = 0; i < Object.keys(matches).length; i++) {
            const round = matches[i];
            if (round.length == 1) {
                singleMatchRound = i;
                break;
            }
        }

        for (let i = 0; i < winnersMatches.length; i++) {
            const round = matches[i];
            const gRound = document.createElementNS("http://www.w3.org/2000/svg", "g");
            gRound.setAttribute("transform", "translate(" + (i * 250 - 100) + ", 30)");
            // gRound.setAttribute("data-matchId", match['id']);
            gRound.classList.add('round-' + i);

            for (let j = 0; j < round.length; j++) {
                const match = round[j];
                let svgMatch = this.createSvgMatch(j, match['p1Name'], match['p2Name'], match['p1Avatar'], match['p2Avatar'], match['p1'], match['p2'], i, round, singleMatchRound, match['id'], match['p1Score'], match['p2Score'], match['status'], false, match['bye']);
                gRound.appendChild(svgMatch);
            }
            svgMain.appendChild(gRound);
        }

        for (let i = 0; i < losersMatches.length; i++) {
            const round = losersMatches[i];
            const gRound = document.createElementNS("http://www.w3.org/2000/svg", "g");
            gRound.setAttribute("transform", "translate(" + (i * 250 - 100) + ", " + (winnersMatches[0].length * 75 + 150) + ")");
            gRound.classList.add('round-' + i);

            for (let j = 0; j < round.length; j++) {
                const match = round[j];
                let svgMatch = this.createSvgMatch(j, match['p1Name'], match['p2Name'], match['p1Avatar'], match['p2Avatar'], match['p1'], match['p2'], i, round, singleMatchRound, match['id'], match['p1Score'], match['p2Score'], match['status'], true, match['bye']);
                gRound.appendChild(svgMatch);
            }
            svgMain.appendChild(gRound);
        }

        const gLines = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gLines.classList.add('lines');
        const gHeaders = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gHeaders.classList.add('headers');
        for (let i = 0; i < winnersMatches.length - 1; i++) {
            const round = matches[i];

            for (let j = 0; j < round.length; j++) {
                const match = round[j];
                var multi = i != 0 ? (75 * (2 ** i)) : 75;
                // var startPos = 0.5 * (2 ** i) * 75;
                var startPos = round.length != 1 ? 0.5 * (2 ** i) * 75 + 30 : 0.5 * (2 ** singleMatchRound) * 75 + 30;

                let curY = (multi * j) + startPos + 10;
                let curX = (i * 250 - 100) + 184;

                var multi2 = (i + 1) != 0 ? (75 * (2 ** (i + 1))) : 75;
                var startPos2 = round.length != 1 ? 0.5 * (2 ** (i + 1)) * 75 + 30 : 0.5 * (2 ** singleMatchRound) * 75 + 30;

                let nextY = (multi2 * Math.floor(j / 2)) + startPos2 + 10;
                let nextX = ((i + 1) * 250 - 100);

                let xDist = nextX - curX;
                let yDist = nextY - curY;
                let matchLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
                matchLine.setAttribute('d', `M${curX} ${curY} l${xDist / 4} 0 l${xDist / 2} ${yDist} l${xDist / 4} 0`);
                matchLine.setAttribute('stroke-width', "1px");
                matchLine.classList.add("matchLine");
                if (match['bye'] || (winnersMatches[i + 1][Math.floor(j / 2)] != undefined && winnersMatches[i + 1][Math.floor(j / 2)]['bye'])) {
                    matchLine.classList.add("hidden");
                }
                if (this.intervalIteration > 0) {
                    matchLine.classList.add('noAnim');
                }
                gLines.appendChild(matchLine);
            }

            const roundLabel = document.createElementNS("http://www.w3.org/2000/svg", "g");
            roundLabel.setAttribute("transform", "translate(" + (i * 250 - 100) + ", 0)");
            const labelRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            labelRect.setAttribute("width", '184');
            labelRect.setAttribute("height", '30');
            labelRect.classList.add('labelBox');
            labelRect.classList.add('matchPath');
            if (this.intervalIteration > 0) {
                labelRect.classList.add('noAnim');
            }
            roundLabel.appendChild(labelRect);
            const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            labelText.classList.add('labelText');
            labelText.setAttribute("x", '95');
            labelText.setAttribute("y", '21');
            labelText.setAttribute("height", '15');
            labelText.setAttribute("width", '190');
            labelText.setAttribute("text-anchor", "middle");
            labelText.innerHTML = "Round " + (i + 1);
            roundLabel.appendChild(labelText);
            gHeaders.appendChild(roundLabel);

        }

        for (let i = 0; i < losersMatches.length - 1; i++) {
            const round = losersMatches[i];

            for (let j = 0; j < round.length; j++) {
                const match = round[j];
                var multi = i != 0 ? (75 * (2 ** Math.floor(i / 2))) : 75;
                // var startPos = 0.5 * (2 ** i) * 75;
                var startPos = round.length != 1 ? 0.5 * (2 ** Math.floor(i / 2)) * 75 + (winnersMatches[0].length * 75 + 150) : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 75 + (winnersMatches[0].length * 75 + 150);

                let curY = (multi * j) + startPos + 10;
                let curX = (i * 250 - 100) + 184;

                var multi2 = (i + 1) != 0 ? (75 * (2 ** (Math.floor(i / 2) + 1))) : 75;
                var startPos2 = round.length != 1 ? 0.5 * (2 ** (Math.floor(i / 2) + 1)) * 75 + +(winnersMatches[0].length * 75 + 150) : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 75 + (winnersMatches[0].length * 75 + 150);

                let nextY = (multi2 * Math.floor(j / 2)) + startPos2 + 10;
                let nextX = ((i + 1) * 250 - 100);

                let xDist = nextX - curX;
                let yDist = nextY - curY;
                let matchLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
                if (i % 2 == 1) {
                    matchLine.setAttribute('d', `M${curX} ${curY} l${xDist / 4} 0 l${xDist / 2} ${yDist} l${xDist / 4} 0`);
                } else {
                    matchLine.setAttribute('d', `M${curX} ${curY} l${xDist} 0`);
                }
                matchLine.setAttribute('stroke-width', "1px");
                matchLine.classList.add("matchLine");
                if (match['bye'] || (losersMatches[i + 1][Math.floor(j / 2)] != undefined && losersMatches[i + 1][Math.floor(j / 2)]['bye'])) {
                    matchLine.classList.add("hidden");
                }
                if (this.intervalIteration > 0) {
                    matchLine.classList.add('noAnim');
                }
                gLines.appendChild(matchLine);
            }

            const roundLabel = document.createElementNS("http://www.w3.org/2000/svg", "g");
            roundLabel.setAttribute("transform", "translate(" + (i * 250 - 100) + ", " + (winnersMatches[0].length * 75 + 120) + ")");
            const labelRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            labelRect.setAttribute("width", '184');
            labelRect.setAttribute("height", '30');
            labelRect.classList.add('labelBox');
            labelRect.classList.add('matchPath');
            if (this.intervalIteration > 0) {
                labelRect.classList.add('noAnim');
            }
            roundLabel.appendChild(labelRect);
            const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            labelText.classList.add('labelText');
            labelText.setAttribute("x", '95');
            labelText.setAttribute("y", '21');
            labelText.setAttribute("height", '15');
            labelText.setAttribute("width", '190');
            labelText.setAttribute("text-anchor", "middle");
            labelText.innerHTML = "Losers Round " + (i + 1);
            roundLabel.appendChild(labelText);
            gHeaders.appendChild(roundLabel);

        }
        svgMain.appendChild(gHeaders);
        svgMain.appendChild(gLines);

        document.getElementById('svgContainer').innerHTML = svgMain.outerHTML;
    }

    createSvgMatch(i, p1Name, p2Name, p1Avatar, p2Avatar, p1Id, p2Id, round, roundElem, singleMatchRound, matchId, p1Score, p2Score, status, losers = false, bye = false) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        var multi = round != 0 ? (75 * (2 ** round)) : 75;
        var startPos = roundElem.length != 1 ? 0.5 * (2 ** round) * 75 : 0.5 * (2 ** singleMatchRound) * 75;
        if (losers) {
            var multi = round != 0 ? (75 * (2 ** Math.floor(round / 2))) : 75;
            var startPos = roundElem.length != 1 ? 0.5 * (2 ** Math.floor(round / 2)) * 75 : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 75;
        }
        group.setAttribute("transform", "translate(0, " + ((multi * i) + startPos) + ") scale(0.8)");
        group.setAttribute("data-matchId", matchId);
        group.classList.add('match-' + i);
        group.classList.add('match');
        if (bye) {
            group.classList.add('hidden');
        }
        if(p1Id && p2Id) {
            group.classList.add('matchReady');
        }

        const clip1 = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clip1.setAttribute("id", 'clipPath-' + i + '-1');
        clip1.innerHTML = ' <circle r="8" cx="25" cy="-2" />';
        group.appendChild(clip1);

        const clip2 = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clip2.setAttribute("id", 'clipPath-' + i + '-2');
        clip2.innerHTML = ' <circle r="8" cx="25" cy="26" />';
        group.appendChild(clip2);

        const nameClip1 = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        nameClip1.setAttribute("id", 'nameClip-' + i + '-1');
        nameClip1.innerHTML = '<rect x="37" y="-10" width="120" height="20"/>';
        group.appendChild(nameClip1);

        const nameClip2 = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        nameClip2.setAttribute("id", 'nameClip-' + i + '-2');
        nameClip2.innerHTML = '<rect x="37" y="20" width="120" height="20"/>';
        group.appendChild(nameClip2);

        var noAnim = "";
        if (this.intervalIteration > 0) {
            noAnim = "noAnim";
        }

        if (status == 'in_progress') {
            group.innerHTML += `
            <path class="matchPath ${noAnim}" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />
            <path class="matchPath in_progress" id="livePath-${i}" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />
            <path class="matchPath ${noAnim} matchSplit" d="m 0 12.25 l 230 0" />`
        } else {
            group.innerHTML += `
            <path class="matchPath ${noAnim}" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />
            <path class="matchPath ${noAnim} matchSplit" d="m 0 12.25 l 230 0" />`;
        }

        if(p1Name == null && p1Id != null) p1Name = p1Id;
        if (p1Name != null) {
            group.innerHTML += `
            <image x="17" y="-10"
            href="https://new.scoresaber.com${p1Avatar}"
            class="img" height="16" width="16" clip-path="url(#clipPath-${i}-1)" />
            <text x="37" y="5" width="147" height="12" class="pName" clip-path="url(#nameClip-${i}-1)">${p1Name}</text>
            `;
        }
        if(p2Name == null && p2Id != null) p2Name = p2Id;
        if (p2Name != null) {
            group.innerHTML += `
            <image x="17" y="18"
                href="https://new.scoresaber.com${p2Avatar}"
                class="img" height="16" width="16" clip-path="url(#clipPath-${i}-2)" />
            <text x="37" y="33" width="147" height="12" class="pName" clip-path="url(#nameClip-${i}-2)">${p2Name}</text>
            `;
        }
        // console.log(p1Score)
        if (p1Score != 0 || p2Score != 0) {
            if (status == 'complete') {
                var p1Class = p1Score > p2Score ? 'winner' : 'loser';
                var p2Class = p1Score < p2Score ? 'winner' : 'loser';
            } else {
                var p1Class = '';
                var p2Class = '';
            }
            group.innerHTML += `
            <text x="180" y="5" width="147" height="12" class="pName ${p1Class}">${p1Score}</text>
            <text x="180" y="33" width="147" height="12" class="pName ${p2Class}">${p2Score}</text>
            `;
        }

        let roundMatches = this.bracketData.filter(x => x.round == 0).length;
        if (round == 0) {
            var p1Loser = (i + 1) * 2 - 1;
            var p2Loser = (i + 1) * 2;
        } else if (round % 2 == 1) {
            if (((round + 1) % 3) % 2 == 0) {
                var p1Loser = 0;
                var x = roundMatches;
                for (let k = 0; k < (Math.floor(round / 2) + 1) + 1; k++) {
                    p1Loser += x;
                    x /= 2;
                }
                p1Loser -= i;
            } else {
                var p1Loser = 1;
                var x = roundMatches;
                for (let k = 0; k < (Math.floor(round / 2) + 1); k++) {
                    p1Loser += x;
                    x /= 2;
                }
                if (i % 2 == 0) {
                    p1Loser += i + 1;
                } else {
                    p1Loser += i - 1;
                }
            }
        }

        if (p1Name == null && losers && p1Loser != undefined) {
            group.innerHTML += `
            <text x="37" y="5" width="147" height="12" class="loserPlaceHolder">Loser of ${p1Loser}</text>
            `;
        }

        if (losers && p2Name == null && p2Loser != undefined) {
            group.innerHTML += `
            <text x="37" y="33" width="147" height="12" class="loserPlaceHolder">Loser of ${p2Loser}</text>
            `;
        }
        let labelId = matchId - this.firstId + 1;

        let maxRound = Math.max.apply(Math, this.bracketData.map(x => x.round));
        if (round == maxRound && !losers && p1Name == null && p1Loser != undefined) {
            group.innerHTML += `
            <text x="37" y="33" width="147" height="12" class="loserPlaceHolder" style="font-size: 12px;">Loser of ${labelId - 1} (If neccessary)</text>
            `;
        }

        // labelId = round * 

        group.innerHTML += `<text x="3" y="16" width="147" height="12" class="matchLabel">${labelId}</text>`;
        return group;
    }

    getBracket(): Observable<any> {
        return this.http.get(`/api/tournament/${this.tournament.tournamentId}/bracketTest`);
    }
}

declare let Twitch: any;
@Component({
    selector: 'updateMatchDialog',
    templateUrl: './updateMatchDialog.html',
    styleUrls: ['./bracket.component.scss']
})
export class updateMatchDialog implements OnInit {

    scoreForm: FormGroup;

    filteredOptions: Observable<any>;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<updateMatchDialog>,
        private notif: NotificationService
    ) {

    }

    status = 'update';


    ngOnInit() {
        // console.log(this.data)
        this.scoreForm = this.fb.group({
            p1Score: this.data.p1Score,
            p2Score: this.data.p2Score,
            status: 'update',
            matchId: this.data.id
        });

        if(this.data.p1Name || this.data.p2Name) {
            var options1 = {
                channel: this.data.p1Twitch,
                theme: 'dark',
    
            };
            var player1 = new Twitch.Player("P1twitch", options1);
            player1.setVolume(0.5);
    
            var options2 = {
                channel: this.data.p2Twitch,
                theme: 'dark',
    
            };
            var player2 = new Twitch.Player("P2twitch", options2);
            player2.setVolume(0);
        }
    }

    isTheatre = false;
    theatreBtn = 'Theatre Mode';

    theatre() {
        if (!this.isTheatre) this.dialogRef.updateSize("95vw");
        if (this.isTheatre) this.dialogRef.updateSize("60vw");
        this.isTheatre = !this.isTheatre;
        this.theatreBtn = this.isTheatre ? 'Regular Mode' : 'Theatre Mode';
    }

    onSubmit(status) {
        this.scoreForm.value.status = status;
        this.updateScore(this.scoreForm.value)
            .subscribe(data => {
                if (!data.flag) {
                    this.notif.showInfo('', 'Successfully updated score');
                    // this.dialogRef.close(this.scoreForm.value);
                } else {
                    console.error('Error', data.err)
                    this.notif.showError('', 'Error updaing score');
                    // this.dialogRef.close(false);
                }
            }, error => {
                this.notif.showError('', 'Error updaing score');
                console.error("Error: ", error);
                // this.dialogRef.close(false);
            });
    }

    updateScore(data: any): Observable<any> {
        return this.http.put(`/api/tournament/${this.data.tournamentId}/bracket/${this.data.id}`, data);
    }
}

@Component({
    selector: 'generateBracketDialog',
    templateUrl: './generateBracketDialog.html',
    styleUrls: ['./bracket.component.scss']
})
export class generateBracketDialog implements OnInit {

    bracketGenForm: FormGroup;

    filteredOptions: Observable<any>;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<generateBracketDialog>,
        private notif: NotificationService,
        private sanitizer: DomSanitizer
    ) { }


    ngOnInit() {
        // console.log(this.data)
        this.bracketGenForm = this.fb.group({
            custom: false,
            players: null
        });
    }

    async onSubmit() {
        let players = this.bracketGenForm.value.players != null ? this.bracketGenForm.value.players.replace(' ', '').split('\n') : null;
        try {
            const bracketGen: any = await this.http.post(`/api/tournament/${this.data.tournamentId}/generateBracket`, { tournamentId: this.data.tournamentId, data: players}).toPromise();
            if (!bracketGen.flag) {
                this.notif.showSuccess('', 'Successfully created bracket');
                this.dialogRef.close(false);
            } else {
                console.error("Error: ", bracketGen.err);
                this.notif.showError('', 'Error creating bracket');
                this.dialogRef.close(false);
            }
        } catch (error) {
            console.error("Error: ",  error);
            this.notif.showError('', 'Error creating bracket');
            this.dialogRef.close(false);
        }
    }

    updateScore(data: any): Observable<any> {
        return this.http.put(`/api/tournament/${this.data.tournamentId}/bracket/${this.data.id}`, data);
    }
}

