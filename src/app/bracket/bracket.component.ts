import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../services/toast.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { bracketMatch } from '../_models/bracket.model';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-bracket',
    templateUrl: './bracket.component.html',
    styleUrls: ['./bracket.component.scss']
})
export class BracketComponent extends AppComponent implements OnInit {

    private url = '/api/tournament';
    @Input() tournament;
    public tourneyId: string;

    ws: WebSocketSubject<any> = webSocket(`${location.protocol == 'http:' ? 'ws' : 'wss'}://` + location.host + '/api/ws');

    bracketData = [];
    loading = true;

    isAuth = false;
    btnText = 'Generate Bracket';

    interval;

    ngOnInit(): void {
        this.initSettings();
        let node = document.createElement('script');
        node.src = 'https://embed.twitch.tv/embed/v1.js';
        node.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(node);
        this.ws.subscribe(
            msg => {
                if (msg.bracketMatch) this.updateDrawnMatch(msg.bracketMatch);
            },
            err => console.log(err)
        );
    }

    ngOnDestroy() {
        clearInterval(this.interval);
        this.ws.complete();
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

        if (matchesData.length > 0) BracketComponent.generateMatches(this.bracketData, this.intervalIteration);
        this.intervalIteration = 1;
        // console.log(matchesData.filter(x => x.round == 0).length);
        // console.log(matchesData)
        let matchElements = document.getElementsByClassName('match');
        for (let i = 0; i < matchElements.length; i++) {
            const element = matchElements[i];
            element.addEventListener("click", () => this.updateMatch(element.getAttribute('data-matchid')))
        }
        this.loading = false;
    }

    async updateBracket() {
        const matchesData: any = await this.http.get(`/api/tournament/${this.tournament.tournamentId}/bracket`).toPromise();
        this.bracketData = matchesData;

        if (matchesData.length > 0) BracketComponent.generateMatches(this.bracketData, this.intervalIteration);

        let matchElements = document.getElementsByClassName('match');
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
    }

    updateDrawnMatch(data: bracketMatch) {
        let matchElem = document.getElementById(data.id);
        // let tmpElement = {

        // }
        let index = this.bracketData.findIndex(x => x.id == data.id);
        this.bracketData[index] = { ...this.bracketData[index], ...data };
        matchElem.querySelector('.pName.p1').innerHTML = data.p1.name || data.p1.id;
        matchElem.querySelector('.pName.p2').innerHTML = data.p2.name || data.p2.id;
        if (data.status == 'in_progress') {
            (<SVGPathElement>matchElem.querySelector('.in_progress')).style.display = 'inline';
        } else {
            (<SVGPathElement>matchElem.querySelector('.in_progress')).style.display = 'none';
        }
        if (data.p1.score != data.p2.score && data.status == 'complete') {
            if (data.p1.score > data.p2.score) {
                matchElem.querySelector('.pScore.p1').classList.add('winner');
                matchElem.querySelector('.pScore.p2').classList.add('loser');
            } else {
                matchElem.querySelector('.pScore.p1').classList.add('loser');
                matchElem.querySelector('.pScore.p2').classList.add('winner');
            }
        }

        if (data.p1.score != 0 || (data.status == 'in_progress' || data.status == 'complete')) matchElem.querySelector('.pScore.p1').innerHTML = data.p1.score.toString();
        if (data.p2.score != 0 || (data.status == 'in_progress' || data.status == 'complete')) matchElem.querySelector('.pScore.p2').innerHTML = data.p2.score.toString();

        matchElem.querySelector('.img.p1').setAttribute('href', data.p1.avatar);
        matchElem.querySelector('.img.p2').setAttribute('href', data.p2.avatar);

        if (data.p1.id && data.p2.id) {
            matchElem.classList.add('matchReady');
            matchElem.addEventListener("click", () => this.updateMatch(matchElem.getAttribute('data-matchid')));
        }
    }

    // gMatches = [];

    matches = [];
    winnersMatches = [];
    losersMatches = [];

    intervalIteration = 0;

    static generateMatches(bracketMatches, intervalIteration) {
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

        // this.firstId = data[0].id;

        const svgMain = document.createElement('svg');
        svgMain.setAttribute('id', "bracket-svg");
        svgMain.classList.add('"bracket-svg"');

        var matches = {};

        for (let i = 0; i < bracketMatches.length; i++) {
            const element = bracketMatches[i];
            // matches
            if (!matches[element['round']]) {
                matches[element['round']] = [];
            }

            matches[element['round']].push(element);
            // this.gMatches.push(element);
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

        const height = losersMatches.length > 0 ? winnersMatches[0].length * 60 + losersMatches[0].length * 60 + 200 : winnersMatches[0].length * 60 + 200;
        const width = losersMatches.length > 0 ? losersMatches.length * 200 + 150 : winnersMatches.length * 200 + 150;

        svgMain.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svgMain.setAttribute("width", `${width}`);
        svgMain.setAttribute("height", `${height}`);
        svgMain.style.minWidth = width + 220 + 'px';

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
            gRound.setAttribute("transform", "translate(" + (i * 220 - 100) + ", 30)");
            // gRound.setAttribute("data-matchId", match['id']);
            gRound.classList.add('round-' + i);

            for (let j = 0; j < round.length; j++) {
                const match = round[j];
                let svgMatch = BracketComponent.createSvgMatch(j, match, bracketMatches, round, singleMatchRound, intervalIteration, false);
                gRound.appendChild(svgMatch);
            }
            svgMain.appendChild(gRound);
        }

        for (let i = 0; i < losersMatches.length; i++) {
            const round = losersMatches[i];
            const gRound = document.createElementNS("http://www.w3.org/2000/svg", "g");
            gRound.setAttribute("transform", "translate(" + (i * 220 - 100) + ", " + (winnersMatches[0].length * 60 + 150) + ")");
            gRound.classList.add('round-' + i);

            for (let j = 0; j < round.length; j++) {
                const match: bracketMatch = round[j];
                let svgMatch = BracketComponent.createSvgMatch(j, match, bracketMatches, round, singleMatchRound, intervalIteration, true);
                gRound.appendChild(svgMatch);
            }
            svgMain.appendChild(gRound);
        }

        const gLines = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gLines.classList.add('lines');
        const gHeaders = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gHeaders.classList.add('headers');
        // console.log(bracketMatches)
        for (let i = 0; i < winnersMatches.length - 1; i++) {
            const round = matches[i];

            for (let j = 0; j < round.length; j++) {
                const match = round[j];
                var multi = i != 0 ? (60 * (2 ** i)) : 60;
                // var startPos = 0.5 * (2 ** i) * 60;
                var startPos = round.length != 1 ? 0.5 * (2 ** i) * 60 + 30 : 0.5 * (2 ** singleMatchRound) * 60 + 30;

                let curY = (multi * j) + startPos + 10;
                let curX = (i * 220 - 100) + 184;

                var multi2 = (i + 1) != 0 ? (60 * (2 ** (i + 1))) : 60;
                var startPos2 = round.length != 1 ? 0.5 * (2 ** (i + 1)) * 60 + 30 : 0.5 * (2 ** singleMatchRound) * 60 + 30;

                let nextY = (multi2 * Math.floor(j / 2)) + startPos2 + 10;
                let nextX = ((i + 1) * 220 - 100);

                let xDist = nextX - curX;
                let yDist = nextY - curY;
                let matchLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
                matchLine.setAttribute('d', `M${curX} ${curY} l${xDist / 4} 0 l${xDist / 2} ${yDist} l${xDist / 4} 0`);
                matchLine.setAttribute('stroke-width', "1px");
                matchLine.classList.add("matchLine");
                if (match['bye'] || (winnersMatches[i + 1][Math.floor(j / 2)] != undefined && winnersMatches[i + 1][Math.floor(j / 2)]['bye'])) {
                    matchLine.classList.add("hidden");
                }
                if (intervalIteration > 0) {
                    matchLine.classList.add('noAnim');
                }
                gLines.appendChild(matchLine);
            }

            const roundLabel = document.createElementNS("http://www.w3.org/2000/svg", "g");
            roundLabel.setAttribute("transform", "translate(" + (i * 220 - 100) + ", 0)");
            const labelRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            labelRect.setAttribute("width", '184');
            labelRect.setAttribute("height", '30');
            labelRect.classList.add('labelBox');
            labelRect.classList.add('matchPath');
            if (intervalIteration > 0) {
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
                const match: bracketMatch = round[j];
                var multi = i != 0 ? (60 * (2 ** Math.floor(i / 2))) : 60;
                // var startPos = 0.5 * (2 ** i) * 60;
                var startPos = round.length != 1 ? 0.5 * (2 ** Math.floor(i / 2)) * 60 + (winnersMatches[0].length * 60 + 150) : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 60 + (winnersMatches[0].length * 60 + 150);

                let curY = (multi * j) + startPos + 10;
                let curX = (i * 220 - 100) + 184;

                var multi2 = (i + 1) != 0 ? (60 * (2 ** (Math.floor(i / 2) + 1))) : 60;
                var startPos2 = round.length != 1 ? 0.5 * (2 ** (Math.floor(i / 2) + 1)) * 60 + +(winnersMatches[0].length * 60 + 150) : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 60 + (winnersMatches[0].length * 60 + 150);

                let nextY = (multi2 * Math.floor(j / 2)) + startPos2 + 10;
                let nextX = ((i + 1) * 220 - 100);

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
                if (intervalIteration > 0) {
                    matchLine.classList.add('noAnim');
                }
                gLines.appendChild(matchLine);
            }

            const roundLabel = document.createElementNS("http://www.w3.org/2000/svg", "g");
            roundLabel.setAttribute("transform", "translate(" + (i * 220 - 100) + ", " + (winnersMatches[0].length * 60 + 120) + ")");
            const labelRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            labelRect.setAttribute("width", '184');
            labelRect.setAttribute("height", '30');
            labelRect.classList.add('labelBox');
            labelRect.classList.add('matchPath');
            if (intervalIteration > 0) {
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

        document.querySelectorAll('.pName').forEach(elem => {
            elem.addEventListener('mouseover', function() {
                document.querySelectorAll(`.pName`).forEach((name) => {
                    if(name.innerHTML == elem.innerHTML) name.classList.add('highlight');
                });
            });
            elem.addEventListener('mouseout', function() {
                document.querySelectorAll(`.pName`).forEach((name) => {
                    if(name.innerHTML == elem.innerHTML) name.classList.remove('highlight');
                });
            });
        });
    }

    static createSvgMatch(i, bracketMatch: bracketMatch, bracketData: bracketMatch[], roundElem, singleMatchRound: number, intervalIteration = 0, losers = false) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        let firstRoundCount = bracketData.filter(x => x.round == 0).length;
        let round = bracketMatch.round;
        if (losers) round = bracketMatch.round * -1 - 1;

        var multi = round != 0 ? (60 * (2 ** round)) : 60;
        var startPos = roundElem.length != 1 ? 0.5 * (2 ** round) * 60 : 0.5 * (2 ** singleMatchRound) * 60;
        if (losers) {
            var multi = round != 0 ? (60 * (2 ** Math.floor(round / 2))) : 60;
            var startPos = roundElem.length != 1 ? 0.5 * (2 ** Math.floor(round / 2)) * 60 : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 60;
        }
        group.setAttribute("transform", "translate(0, " + ((multi * i) + startPos) + ") scale(0.8)");
        group.setAttribute("data-matchId", bracketMatch.id);
        group.id = bracketMatch.id;
        group.classList.add('match');
        if (bracketMatch.bye) {
            group.classList.add('hidden');
        }
        if (bracketMatch.p1.id && bracketMatch.p2.id) {
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
        nameClip1.innerHTML = '<rect x="37" y="-10" width="160" height="20"/>';
        group.appendChild(nameClip1);

        const nameClip2 = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        nameClip2.setAttribute("id", 'nameClip-' + i + '-2');
        nameClip2.innerHTML = '<rect x="37" y="20" width="160" height="20"/>';
        group.appendChild(nameClip2);

        var noAnim = "";
        if (intervalIteration > 0) {
            noAnim = "noAnim";
        }

        group.innerHTML += `
            <path class="matchPath ${noAnim}" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />
            <path class="matchPath in_progress" ${bracketMatch.status != 'in_progress' ? 'style="display:none;"' : ''} id="livePath-${i}" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />
            <path class="matchPath ${noAnim} matchSplit" d="m 0 12.25 l 230 0" />`;

        let p1Name: string = bracketMatch.p1.name;
        if (bracketMatch.p1.name == null && bracketMatch.p1.id != null) p1Name = bracketMatch.p1.id;

        group.innerHTML += `
            <image x="17" y="-10"
            ${bracketMatch.p1.avatar ? `href="https://cdn.discordapp.com/avatars/${bracketMatch.p1.id}${bracketMatch.p1.avatar}"` : ''}            
            class="img p1" height="16" width="16" clip-path="url(#clipPath-${i}-1)" />
            <text x="37" y="5" width="147" height="12" class="pName p1" clip-path="url(#nameClip-${i}-1)">${p1Name || ''}</text>
            `;
        if (bracketMatch.p1.name == null && bracketMatch.p1.id != null) bracketMatch.p1.name = null;
        let p2Name: string = bracketMatch.p2.name;
        if (bracketMatch.p2.name == null && bracketMatch.p2.id != null) p2Name = bracketMatch.p2.id;

        group.innerHTML += `
            <image x="17" y="18"
            ${bracketMatch.p2.avatar ? `href="https://cdn.discordapp.com/avatars/${bracketMatch.p2.id}${bracketMatch.p2.avatar}"` : ''}            
            class="img p2" height="16" width="16" clip-path="url(#clipPath-${i}-2)" />
            <text x="37" y="33" width="147" height="12" class="pName p2" clip-path="url(#nameClip-${i}-2)">${p2Name || ''}</text>
            `;
        if (bracketMatch.p2.name == null && bracketMatch.p2.id != null) bracketMatch.p2.name = null;
        if (bracketMatch.p1.score != 0 || bracketMatch.p2.score != 0) {
            let p1Class = "", p2Class = "";
            if (bracketMatch.status == 'complete') {
                p1Class = bracketMatch.p1.score > bracketMatch.p2.score ? 'winner' : 'loser';
                p2Class = bracketMatch.p1.score < bracketMatch.p2.score ? 'winner' : 'loser';
            }
            group.innerHTML += `
            <text x="200" y="5" width="147" height="12" class="pName pScore p1 ${p1Class}">${bracketMatch.p1.score}</text>
            <text x="200" y="33" width="147" height="12" class="pName pScore p2 ${p2Class}">${bracketMatch.p2.score}</text>
            `;
        } else {
            group.innerHTML += `
            <text x="200" y="5" width="147" height="12" class="pName pScore p1"></text>
            <text x="200" y="33" width="147" height="12" class="pName pScore p2"></text>
            `;
        }

        

        let maxRound = Math.max.apply(Math, bracketData.map(x => x.round));
        let minRound = Math.min.apply(Math, bracketData.map(x => x.round));

        let p1Loser: number;
        let p2Loser: number;

        if (round == 0) {
            p1Loser = (i + 1) * 2 - 1;
            p2Loser = (i + 1) * 2;
        } else if (round % 2 == 1) {
            if (((round + 1) % 3) % 2 == 0) {
                p1Loser = 0;
                let prevRound = firstRoundCount;
                let prevLoser = prevRound / 2;
                for (let j = 0; j < (Math.floor(round / 2) + 1); j++) {
                    p1Loser += prevRound;
                    p1Loser += prevLoser;
                    if (j % 2) prevLoser = Math.ceil(prevLoser / 2);
                    prevRound = Math.ceil(prevRound / 2);
                }
                p1Loser += prevRound;
                p1Loser -= i;
            } else {
                p1Loser = 1;
                let prevRound = firstRoundCount;
                let prevLoser = prevRound / 2;
                for (let j = 0; j < (Math.floor(round / 2) + 1); j++) {
                    p1Loser += prevRound;
                    p1Loser += prevLoser;
                    if (j % 2) prevLoser = Math.ceil(prevLoser / 2);
                    prevRound = Math.ceil(prevRound / 2);
                }
                if (i % 2 == 0) {
                    p1Loser += i + 1;
                } else {
                    p1Loser += i - 1;
                }
            }
        }

        if (losers && (round + 1) * -1 == minRound) {
            p1Loser = BracketComponent.calcLabel(false, firstRoundCount, maxRound - 2, bracketMatch.matchNum, minRound);
        }

        if ((bracketMatch.p1.id == null || bracketMatch.p1.name == '') && losers && p1Loser != undefined) {
            group.innerHTML += `<text x="37" y="5" width="147" height="12" class="loserPlaceHolder">Loser of ${p1Loser}</text>`;
        }

        if (losers && (bracketMatch.p2.id == null || bracketMatch.p2.name == "") && p2Loser != undefined) {
            group.innerHTML += `<text x="37" y="33" width="147" height="12" class="loserPlaceHolder">Loser of ${p2Loser}</text>`;
        }

        let labelId = BracketComponent.calcLabel(losers, firstRoundCount, round, bracketMatch.matchNum, minRound);

        if (round == maxRound && !losers && bracketMatch.p1.name == null && minRound < 0) {
            let labelId = BracketComponent.calcLabel(losers, firstRoundCount, round - 1, bracketMatch.matchNum, minRound);
            group.innerHTML += `<text x="37" y="33" width="147" height="12" class="loserPlaceHolder" style="font-size: 12px;">Loser of ${labelId} (If neccessary)</text>`;
        }

        if (round == maxRound - 1 && !losers && bracketMatch.p1.name == null && minRound < 0) {
            group.innerHTML += `<text x="37" y="33" width="147" height="12" class="loserPlaceHolder" style="font-size: 12px;">Winner of Losers Bracket</text>`;
        }

        group.innerHTML += `<text x="3" y="16" width="147" height="12" class="matchLabel">${labelId}</text>`;
        return group;
    }

    getBracket(): Observable<any> {
        return this.http.get(`/api/tournament/${this.tournament.tournamentId}/bracketTest`);
    }

    static calcLabel(losers: boolean, firstRoundCount: number, round: number, matchNum: number, minRound: number) {
        let labelId = 1;
        let prevRound = firstRoundCount;
        let prevLoser = firstRoundCount / 2;

        if (losers) {
            for (let i = 0; i < round; i++) {
                labelId += prevRound;
                labelId += prevLoser;
                if (i % 2) prevLoser = Math.ceil(prevLoser / 2);
                prevRound = Math.ceil(prevRound / 2);
            }
            labelId += prevRound;
            labelId += matchNum;
        } else if (!losers && minRound < 0) {
            for (let i = 0; i < round; i++) {
                labelId += prevRound;
                labelId += prevLoser;
                if (i % 2) prevLoser = Math.ceil(prevLoser / 2);
                prevRound = Math.ceil(prevRound / 2);
            }
            labelId += matchNum;
        } else {
            for (let i = 0; i < round; i++) {
                labelId += prevRound;
                prevRound = Math.ceil(prevRound / 2);
            }
            labelId += matchNum;
        }
        return labelId;
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


    async ngOnInit() {
        this.scoreForm = this.fb.group({
            p1Score: this.data.p1.score,
            p2Score: this.data.p2.score,
            status: 'update',
            matchId: this.data.id
        });

        setTimeout(() => {
            if (this.data.p1.name || this.data.p2.name) {
                var options1 = {
                    channel: this.data.p1.twitch,
                    theme: 'dark',
    
                };
                var player1 = new Twitch.Player("P1twitch", options1);
                player1.setVolume(0.5);
    
                var options2 = {
                    channel: this.data.p2.twitch,
                    theme: 'dark',
    
                };
                var player2 = new Twitch.Player("P2twitch", options2);
                player2.setVolume(0);
            }
        }, 1000);
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
                this.notif.showInfo('', 'Successfully updated score');
            }, error => {
                this.notif.showError('', 'Error updaing score');
                console.error("Error: ", error);
            });
        if (status == 'complete') this.dialogRef.close(false);
    }

    updateScore(data: any): Observable<any> {
        return this.http.put(`/api/tournament/${this.data.tournamentId}/bracket/${this.data.id}`, data);
    }

    async scheduleMatch() {
        try {
            await this.http.put(`/api/tournament/${this.data.tournamentId}/bracket/schedule/${this.data.id}`, { matchTime: new Date((<HTMLInputElement>document.getElementById("matchTime")).value) }).toPromise();
            this.notif.showSuccess('', 'Successfully Scheduled Match');
            this.dialogRef.close(false);
        } catch (error) {
            this.notif.showError('', 'Error Scheduling Match');
            this.dialogRef.close(false);
        }
    }
}

@Component({
    selector: 'generateBracketDialog',
    templateUrl: './generateBracketDialog.html',
    styleUrls: ['./bracket.component.scss']
})
export class generateBracketDialog implements OnInit {

    bracketGenForm: FormGroup;

    filteredOptions: any;

    users = [];
    hiddenUsers = [];
    userNameInput: FormControl = new FormControl();

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<generateBracketDialog>,
        private notif: NotificationService,
        private sanitizer: DomSanitizer
    ) { 
        this.getUsers()
            .subscribe(data => {
                data.sort((a,b) => {
                    return a.name > b.name
                });
                this.users = data;
                this.filteredOptions = this.users;
                // this.filteredOptions = this.userNameInput.valueChanges
                //     .pipe(
                //         startWith(''),
                //         map(val => this._filter(val))
                //     );
            });
    }

    updatePlayers(event) {
        let option = this.bracketGenForm.value.users.findIndex(x => x.id == event.option._parent.id);
        if (option > -1) {
            this.users.push(this.hiddenUsers.find(x => x.discordId == this.bracketGenForm.value.users[option].userId));
            this.hiddenUsers.splice(this.hiddenUsers.findIndex(x => x.discordId == this.bracketGenForm.value.users[option].userId))
            this.bracketGenForm.value.users[option].userId = event.option.value;
        } else {
            this.bracketGenForm.value.users.push({ userId: event.option.value, id: event.option._parent.id});
        }
        
        let usrIndex = this.users.findIndex(x => x.discordId == event.option.value); 
        if(usrIndex > -1) {
            this.hiddenUsers.push(this.users[usrIndex]);
            this.users.splice(usrIndex, 1);
            this.filteredOptions = this.users;
        }
    }

    lastVal = "";

    updateLastEvent(event) {
        this.lastVal = event;
    }

    updateFilter($val) {
        this.filteredOptions = this._filter($val);
    }


    ngOnInit() {
        this.bracketGenForm = this.fb.group({
            custom: false,
            manual: false,
            users: this.fb.array([]),
            players: null
        });
    }

    async onSubmit() {
        let players = this.bracketGenForm.value.players != null ? this.bracketGenForm.value.players.replace(' ', '').split('\n') : null;
        let users = this.bracketGenForm.value.users.length > 0 ? this.bracketGenForm.value.users.map(x => x.userId) : null;
        try {
            const bracketGen: any = await this.http.post(`/api/tournament/${this.data.tournamentId}/generateBracket`, { tournamentId: this.data.tournamentId, customPlayers: players, players: users }).toPromise();
            this.notif.showSuccess('', 'Successfully created bracket');
            this.dialogRef.close(false);
        } catch (error) {
            console.error("Error: ", error);
            this.notif.showError('', 'Error creating bracket');
            this.dialogRef.close(false);
        }
    }

    updateScore(data: any): Observable<any> {
        return this.http.put(`/api/tournament/${this.data.tournamentId}/bracket/${this.data.id}`, data);
    }

    private _filter(name: string) {
        const filterValue = name.toLowerCase();
        return this.users.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
    }

    getUsers(): Observable<any> {
        return this.http.get('/api/users');
    }

    displayFn(id): string {
        let user = this.users.find(x => x.discordId == id);
        return user && user.name ? user.name : '';
    }

}

