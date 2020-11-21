import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { bracketMatch } from '../_models/bracket.model';

@Component({
    selector: 'app-overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements AfterViewInit {

    canvas;
    body = document.body;
    svgData;

    matchId: Number | string;
    stage: any;
    tourneyId: any;

    matchData: any;

    settings: any;
    viewSeason = '1';
    seasons: number[] = [];

    bracketData = [];

    constructor(private route: ActivatedRoute, private http: HttpClient) { }

    myWebSocket: WebSocketSubject<any> = webSocket(`${location.protocol == 'http:' ? 'ws' : 'wss'}://` + location.host + '/api/ws');

    async ngAfterViewInit(): Promise<void> {
        this.canvas = document.getElementById("fakeCanvas");
        this.route.params.subscribe(params => {
            this.matchId = params['matchId'];
            this.stage = params['stage'];
            this.tourneyId = params['tourneyId'];
        });

        if (!(this.stage == 'bracket' && this.matchId == 'display')) {
            // await this.draw();
            // await this.getMatchData();
        } else {
            // await this.setSettings();
            this.initSettings();
        }

        this.myWebSocket.subscribe(
            msg => {
                if(msg.bracketMatch) this.updateDrawnMatch(msg.bracketMatch);
                // if (msg.matchUpdate && msg.matchUpdate.id == this.matchId) this.update(msg.matchUpdate);
                // if (msg.bracketMatch && msg.bracketMatch.id == this.matchId) this.update(msg.bracketMatch);
                // if (msg.taPacket) this.handlePacket(msg.taPacket);
                // if (msg.bracketUpdate && this.bracketData.length > 0) {
                //     this.bracketData = msg.bracketUpdate;
                //     this.intervalIteration = 1;
                //     this.generateMatches(this.bracketData);
                // }
            },
            err => console.log('err: ', err),
            () => console.log('complete')
        );

        // console.log(this.router.url)
    }

    async initSettings() {
        const matchesData: any = await this.http.get(`/api/tournament/${this.tourneyId}/bracket`).toPromise();
        this.bracketData = matchesData;
        // if (matchesData.length > 0) {
        //     this.btnText = 'Regenerate Bracket';
        // }
        // const usr: any = await this.http.get(`/api/user`).toPromise();
        // this.user = usr != null ? usr[0] : null;
        // // console.log(this.user);
        // if (this.user != null && (this.user.roleIds.includes("1") || this.tournament.owner == this.user.discordId)) {
        //     this.isAuth = true;
        // }

        if (matchesData.length > 0) this.generateMatches(this.bracketData);
        this.intervalIteration = 1;
        // console.log(matchesData.filter(x => x.round == 0).length);
        // console.log(matchesData)
        // let matchElements = document.getElementsByClassName('matchReady');
        // for (let i = 0; i < matchElements.length; i++) {
        //     const element = matchElements[i];
        //     element.addEventListener("click", () => this.updateMatch(element.getAttribute('data-matchid')))
        // }
        // this.loading = false;
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

        // if (data.p1.id && data.p2.id) {
        //     matchElem.classList.add('matchReady');
        //     matchElem.addEventListener("click", () => this.updateMatch(matchElem.getAttribute('data-matchid')));
        // }
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

        // this.firstId = data[0].id;

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
                if (match.p1.avatar != null) {
                    if (match.p1.avatar.includes('api') || match.p1.avatar.includes('oculus')) {
                        match.p1.avatar = "https://new.scoresaber.com" + match.p1.avatar;
                    } else {
                        match.p1.avatar = `/${match.p1.avatar}` + (match.p1.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        match.p1.avatar = `https://cdn.discordapp.com/avatars/${match.p1.id}${match.p1.avatar}`
                    }
                }
                if (match.p2.avatar != null) {
                    if (match.p2.avatar.includes('api') || match.p2.avatar.includes('oculus')) {
                        match.p2.avatar = "https://new.scoresaber.com" + match.p2.avatar;
                    } else {
                        match.p2.avatar = `/${match.p2.avatar}` + (match.p2.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        match.p2.avatar = `https://cdn.discordapp.com/avatars/${match.p2.id}${match.p2.avatar}`
                    }
                }
                let svgMatch = this.createSvgMatch(j, match.p1.name, match.p2.name, match.p1.avatar, match.p2.avatar, match.p1.id, match.p2.id, i, match['matchNum'], round, singleMatchRound, match['id'], match.p1.score, match.p2.score, match['status'], false, match['bye']);
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
                if (match.p1.avatar != null) {
                    if (match.p1.avatar.includes('api') || match.p1.avatar.includes('oculus')) {
                        match.p1.avatar = "https://new.scoresaber.com" + match.p1.avatar;
                    } else {
                        match.p1.avatar = `/${match.p1.avatar}` + (match.p1.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        match.p1.avatar = `https://cdn.discordapp.com/avatars/${match.p1.id}${match.p1.avatar}`
                    }
                }
                if (match.p2.avatar != null) {
                    if (match.p2.avatar.includes('api') || match.p2.avatar.includes('oculus')) {
                        match.p2.avatar = "https://new.scoresaber.com" + match.p2.avatar;
                    } else {
                        match.p2.avatar = `/${match.p2.avatar}` + (match.p2.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        match.p2.avatar = `https://cdn.discordapp.com/avatars/${match.p2.id}${match.p2.avatar}`
                    }
                }
                let svgMatch = this.createSvgMatch(j, match.p1.name, match.p2.name, match.p1.avatar, match.p2.avatar, match.p1.id, match.p2.id, i, match['matchNum'], round, singleMatchRound, match['id'], match.p1.score, match.p2.score, match['status'], true, match['bye']);
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

    createSvgMatch(i, p1Name, p2Name, p1Avatar, p2Avatar, p1Id, p2Id, round, matchNum, roundElem, singleMatchRound, matchId, p1Score, p2Score, status, losers = false, bye = false) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        var multi = round != 0 ? (75 * (2 ** round)) : 75;
        var startPos = roundElem.length != 1 ? 0.5 * (2 ** round) * 75 : 0.5 * (2 ** singleMatchRound) * 75;
        if (losers) {
            var multi = round != 0 ? (75 * (2 ** Math.floor(round / 2))) : 75;
            var startPos = roundElem.length != 1 ? 0.5 * (2 ** Math.floor(round / 2)) * 75 : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 75;
        }
        group.setAttribute("transform", "translate(0, " + ((multi * i) + startPos) + ") scale(0.8)");
        group.setAttribute("data-matchId", matchId);
        group.id = matchId;
        // group.classList.add('match-' + i);
        group.classList.add('match');
        if (bye) {
            group.classList.add('hidden');
        }
        if (p1Id && p2Id) {
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

        // if (status == 'in_progress') {
        group.innerHTML += `
            <path class="matchPath ${noAnim}" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />
            <path class="matchPath in_progress" ${status != 'in_progress' ? 'style="display:none;"' : ''} id="livePath-${i}" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />
            <path class="matchPath ${noAnim} matchSplit" d="m 0 12.25 l 230 0" />`
        // } else {
        //     group.innerHTML += `
        //     <path class="matchPath ${noAnim}" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />
        //     <path class="matchPath ${noAnim} matchSplit" d="m 0 12.25 l 230 0" />`;
        // }

        if (p1Name == null && p1Id != null) p1Name = p1Id;
        // if (p1Name != null) {
        group.innerHTML += `
            <image x="17" y="-10"
            ${p1Avatar ? `href="${p1Avatar}"` : ''}            
            class="img p1" height="16" width="16" clip-path="url(#clipPath-${i}-1)" />
            <text x="37" y="5" width="147" height="12" class="pName p1" clip-path="url(#nameClip-${i}-1)">${p1Name || ''}</text>
            `;
        // }
        if (p1Name == null && p1Id != null) p1Name = null;
        if (p2Name == null && p2Id != null) p2Name = p2Id;
        // if (p2Name != null) {
        group.innerHTML += `
            <image x="17" y="18"
            ${p2Avatar ? `href="${p2Avatar}"` : ''}            
            class="img p2" height="16" width="16" clip-path="url(#clipPath-${i}-2)" />
            <text x="37" y="33" width="147" height="12" class="pName p2" clip-path="url(#nameClip-${i}-2)">${p2Name || ''}</text>
            `;
        // }
        if (p2Name == null && p2Id != null) p2Name = null;
        if (p1Score != 0 || p2Score != 0) {
            if (status == 'complete') {
                var p1Class = p1Score > p2Score ? 'winner' : 'loser';
                var p2Class = p1Score < p2Score ? 'winner' : 'loser';
            } else {
                var p1Class = '';
                var p2Class = '';
            }
            group.innerHTML += `
            <text x="180" y="5" width="147" height="12" class="pName pScore p1 ${p1Class}">${p1Score}</text>
            <text x="180" y="33" width="147" height="12" class="pName pScore p2 ${p2Class}">${p2Score}</text>
            `;
        } else {
            group.innerHTML += `
            <text x="180" y="5" width="147" height="12" class="pName pScore p1"></text>
            <text x="180" y="33" width="147" height="12" class="pName pScore p2"></text>
            `;
        }

        let firstRoundCount = this.bracketData.filter(x => x.round == 0).length;

        let maxRound = Math.max.apply(Math, this.bracketData.map(x => x.round));
        let minRound = Math.min.apply(Math, this.bracketData.map(x => x.round));

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
            p1Loser = this.calcLabel(false, firstRoundCount, maxRound - 2, matchNum, minRound);
        }

        if ((p1Name == null || p1Name == '') && losers && p1Loser != undefined) {
            group.innerHTML += `<text x="37" y="5" width="147" height="12" class="loserPlaceHolder">Loser of ${p1Loser}</text>`;
        }

        if (losers && (p2Name == null || p2Name == "") && p2Loser != undefined) {
            group.innerHTML += `<text x="37" y="33" width="147" height="12" class="loserPlaceHolder">Loser of ${p2Loser}</text>`;
        }

        let labelId = this.calcLabel(losers, firstRoundCount, round, matchNum, minRound);

        if (round == maxRound && !losers && p1Name == null && minRound < 0) {
            let labelId = this.calcLabel(losers, firstRoundCount, round - 1, matchNum, minRound);
            group.innerHTML += `<text x="37" y="33" width="147" height="12" class="loserPlaceHolder" style="font-size: 12px;">Loser of ${labelId} (If neccessary)</text>`;
        }

        if (round == maxRound - 1 && !losers && p1Name == null && minRound < 0) {
            group.innerHTML += `<text x="37" y="33" width="147" height="12" class="loserPlaceHolder" style="font-size: 12px;">Winner of Losers Bracket</text>`;
        }

        group.innerHTML += `<text x="3" y="16" width="147" height="12" class="matchLabel">${labelId}</text>`;
        return group;
    }

    private calcLabel(losers: boolean, firstRoundCount: number, round: number, matchNum: number, minRound: number) {
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
