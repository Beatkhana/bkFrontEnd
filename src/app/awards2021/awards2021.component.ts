import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

interface IAward {
    [key: string]: {
        label: string;
        image: string;
        winner: boolean;
        link?: string;
    }[];
}

@Component({
    selector: 'app-awards2021',
    templateUrl: './awards2021.component.html',
    styleUrls: ['./awards2021.component.scss'],
})
export class Awards2021Component implements OnInit {
    awards: IAward = {
        'Best 3D-Model Maker': [
            {
                label: 'iSmellFood',
                image: null,
                winner: true,
            },
            {
                label: 'BigKitty',
                image: null,
                winner: false,
            },
            {
                label: 'Raz0rBeam',
                image: null,
                winner: false,
            },
            {
                label: 'WindysonTV',
                image: null,
                winner: false,
            },
            {
                label: 'Mdot',
                image: null,
                winner: false,
            },
        ],
        'Best Beat Saber-Related Emote': [
            {
                label: 'animesucks',
                image: 'https://cdn.discordapp.com/attachments/743475524676091918/934697766083522621/900361076632322088.gif',
                winner: false,
            },
            {
                label: 'sealAcc',
                image: 'https://cdn.discordapp.com/attachments/743475524676091918/934697358254546964/ied-jQ7lzRVP4tLWnmChTeUp18EO7esPFwKuhwvSmZiu6LqrvfI-y7gXG9bXJ7wNPBKpCkUR_O9W_GQiG75IT1pLQe-bLIIY67pZhpc1E8vDqlRa2pOnuNjsEuSngNm5vOp4N96NlU1emEh8.png',
                winner: false,
            },
            {
                label: 'garshPls',
                image: 'https://cdn.discordapp.com/attachments/743475524676091918/934697866285420564/3x.gif',
                winner: true,
            },
            {
                label: 'HahaBall',
                image: 'https://cdn.discordapp.com/attachments/743475524676091918/934697526420996126/TCnKmZFxpRTa8YBL5_c9JMmg8r1ChKBdU7xvf2PI8zkj2SmUMv2D7z9yv16dkBCFTFkW3ECz6HJazoM17Cs9mzDHB6j7VkMZUZcen64aTvcwWr75thdzWReBmN2R9wLsI4GMyUrhXLyPqDy.png',
                winner: false,
            },
            {
                label: 'Sexy Jaroslav Beck',
                image: 'https://cdn.discordapp.com/attachments/743475524676091918/934697585770389564/VXQoZyfy6tIZW6MM8ElV0UsksMszncwCdNyveshDiKzSpmVAMUe_zYczlBMwKkvqKY8n8ClVLhjbHPWjou66sliIKohuyS4IIrsP61SELnkJPNCimS5G2I_0umHGPWqE-klBtxOcMTLhciF3.png',
                winner: false,
            },
        ],
        'Best Caster at Tournaments': [
            {
                label: 'Gio',
                image: null,
                winner: false,
            },
            {
                label: 'Magician',
                image: null,
                winner: true,
            },
            {
                label: 'Bantalope',
                image: null,
                winner: false,
            },
            {
                label: 'Ixsen',
                image: null,
                winner: false,
            },
            {
                label: 'Rocker',
                image: null,
                winner: false,
            },
        ],
        'Best Gimmick Account': [
            {
                label: 'beat saber beat saber',
                image: null,
                winner: false,
                link: 'https://twitter.com/beatsaberbs',
            },
            {
                label: 'Beat Saber Dad',
                image: null,
                winner: true,
                link: 'https://twitter.com/BeatSaberDad',
            },
            {
                label: 'Scoresaber Developer',
                image: null,
                winner: false,
                link: 'https://twitter.com/ScoresaberDev',
            },
            {
                label: 'No Context Beat Saber Comments',
                image: null,
                winner: false,
                link: 'https://twitter.com/NoContextBeatYT',
            },
            {
                label: 'Gaelican',
                image: null,
                winner: false,
                link: 'https://twitter.com/Gaelicanz',
            },
        ],
        'Best Hitbloq playlist': [
            {
                label: 'accacalac',
                image: 'https://i.imgur.com/6ymbqZP.png',
                winner: false,
                link: 'https://hitbloq.com/map_pool/accacalac',
            },
            {
                label: 'Rescored Saber',
                image: 'https://i.imgur.com/Ef990oL.png',
                winner: false,
                link: 'https://hitbloq.com/map_pool/scoresaberduh',
            },
            {
                label: 'Pauls',
                image: 'https://i.imgur.com/IOtRlot.png',
                winner: false,
                link: 'https://hitbloq.com/map_pool/paul',
            },
            {
                label: 'Midspeed',
                image: 'https://i.imgur.com/Vm3grJl.png',
                winner: true,
                link: 'https://hitbloq.com/map_pool/midspeed_acc',
            },
            {
                label: 'bbbear',
                image: 'https://i.imgur.com/gVE6PHn.png',
                winner: false,
                link: 'https://hitbloq.com/map_pool/bbbear',
            },
        ],
        'Best Map Cover Image': [
            {
                label: 'Villain Virus',
                image: 'https://lh4.googleusercontent.com/eYH5Rp3oKGUAwhsLQ3unZ0UMO8kdwqRwxiMkc-7Ov75hrYJUyN7DYos7P-2-7IzHJ-FuMDjqFLZO7ITy0Mo5tPnCbHSwTntg2DNw_A3nU8n9zcyXmu74nuQdflrKy-L7yx9UmWdmskuEjvvI',
                winner: true,
            },
            {
                label: 'collapse of ego',
                image: 'https://lh3.googleusercontent.com/Fv8Y1wLTpAJSz2mDp0HQraTBVw3f5AXCMfSMoZAPtizmhuMiGZia5IpE1xiOoZb7fRdrUAn7RBHb0hPzbYACQZY07GwFLE6RdhKiSnPP9IMwu3Kc6lMTJxJ1GxhQ41TwN4CKDWmGnHuughhu',
                winner: false,
            },
            {
                label: 'Extra Credit on the Extratone Test!',
                image: 'https://lh3.googleusercontent.com/xb4JQ2wK-YhVbc-Toxwf24M2BTa38sw0zduDAcKYwIqAE2HtD9iyJaDO2aDtoW3h362EsYrp8FXqRATG5F-8YyFAwjYtu4w3pqAJX19JBQAQ2tdVZFFhJ_7yEmb3bhqgJoIcF29pfadb3RRZ',
                winner: false,
            },
            {
                label: 'Go Insane!',
                image: 'https://lh4.googleusercontent.com/AxtVFiPIwSexpEzGm2xCPxpyks7JR3By7yFHPdpjceS0uGJD1z19k0vd__-TeDm6sFiBp3mAn3BcyAw6GmPLjCWt3elAkNR6ETwjtU4XzOrSBCAesGGdUYWLr5yChrdzwJJ9H741mPd_cjvM',
                winner: false,
            },
            {
                label: 'Magical Sanctuary',
                image: 'https://lh3.googleusercontent.com/Z5NO4U2y-tx3EPKfKhCdRf7Xf4o1i8uuJmQ5bhtnoM-bYMbDFV6KNf1UDtkIguKIL1F2Xo0uzrkovAn9W3rxmpbElrCAUubdycBb1quUBcN7ae0tgDuGMJgoVrDM4MVwO2XKxPiITWMKc17p',
                winner: false,
            },
        ],
        'Best Map that took hours, days, weeks to make': [
            {
                label: 'Somewhere Out There',
                image: 'https://as.cdn.beatsaver.com/42cbb3914e8656b85ec26d288d9a5953e3a96cd8.jpg',
                winner: false,
                link: 'https://beatsaver.com/maps/1e6ff',
            },
            {
                label: 'LeaF - Mope Mope',
                image: 'https://as.cdn.beatsaver.com/6c9d463c1cf556246cf60bfaef75fc4f8ea3053f.jpg',
                winner: false,
                link: 'https://beatsaver.com/maps/129bf',
            },
            {
                label: 'Codly - Lucy, The God Of Time',
                image: 'https://as.cdn.beatsaver.com/dd4a025f814b8570f2726939b1c5b000ed210ecf.jpg',
                winner: false,
                link: 'https://beatsaver.com/maps/15b16',
            },
            {
                label: 'Ghost Choir - Louie Zong',
                image: 'https://as.cdn.beatsaver.com/1d373506c0b2b82867411f18696a1ad53d4ea01d.jpg',
                winner: false,
                link: 'https://beatsaver.com/maps/1362d',
            },
            {
                label: 'Wait - M83',
                image: 'https://as.cdn.beatsaver.com/9edd059e7331b187dec1805e1e9d53e347b77f90.jpg',
                winner: false,
                link: 'https://beatsaver.com/maps/1b3b4',
            },
            {
                label: 'Look At The Sky - Porter Robinson',
                image: 'https://as.cdn.beatsaver.com/825dbd980eadceaba54c8e9d8e68f93a1b4cb029.jpg',
                winner: true,
                link: 'https://beatsaver.com/maps/1421c',
            },
        ],
        'Best Mapper': [
            {
                label: 'Joshabi',
                image: 'https://cdn.beatsaver.com/avatar/169894107517419520.png',
                winner: false,
                link: 'https://beatsaver.com/profile/4254180',
            },
            {
                label: 'cerret',
                image: 'https://cdn.beatsaver.com/avatar/241387804146270209.png',
                winner: true,
                link: 'https://beatsaver.com/profile/4284620',
            },
            {
                label: 'Nolanimations',
                image: 'https://cdn.beatsaver.com/avatar/273773715412746241.png',
                winner: false,
                link: 'https://beatsaver.com/profile/4235156',
            },
            {
                label: 'CoolingCloset',
                image: 'https://cdn.beatsaver.com/avatar/181291351315316736.png',
                winner: false,
                link: 'https://beatsaver.com/profile/4284243',
            },
            {
                label: 'FatBeanZoop',
                image: 'https://cdn.beatsaver.com/avatar/191451523845193728.png',
                winner: false,
                link: 'https://beatsaver.com/profile/4235145',
            },
            {
                label: 'Fvrwvrd',
                image: 'https://cdn.beatsaver.com/avatar/368193458894274561.png',
                winner: false,
                link: 'https://beatsaver.com/profile/4288863',
            },
            {
                label: 'HelloIAmDaan',
                image: 'https://cdn.beatsaver.com/avatar/581578919116013572.png',
                winner: false,
                link: 'https://beatsaver.com/profile/4284671',
            },
            {
                label: 'that_narwhal',
                image: 'https://cdn.beatsaver.com/avatar/336663714801385472.png',
                winner: false,
                link: 'https://beatsaver.com/profile/72110',
            },
        ],
        'Best Mascot': [
            {
                label: 'Paul',
                image: null,
                winner: false,
            },
            {
                label: 'Bill',
                image: null,
                winner: false,
            },
            {
                label: 'Akane',
                image: null,
                winner: false,
            },
            {
                label: 'Kanade',
                image: null,
                winner: false,
            },
            {
                label: 'ACC seal',
                image: null,
                winner: true,
            },
            {
                label: 'The Denmark one',
                image: null,
                winner: false,
            },
            {
                label: 'OakhamSam',
                image: null,
                winner: false,
            },
        ],
        'Best Mod-Developer': [
            {
                label: 'Kinsi',
                image: null,
                winner: true,
                link: 'https://github.com/kinsi55',
            },
            {
                label: 'Pixelboom',
                image: null,
                winner: false,
                link: 'https://github.com/rithik-b',
            },
            {
                label: 'Auros',
                image: null,
                winner: false,
                link: 'https://github.com/Auros',
            },
            {
                label: 'Eris',
                image: null,
                winner: false,
                link: 'https://github.com/ErisApps',
            },
            {
                label: 'Toni Macaroni',
                image: null,
                winner: false,
                link: 'https://github.com/ToniMacaroni',
            },
            {
                label: 'Aika',
                image: null,
                winner: false,
                link: 'https://github.com/uwuViolet',
            },
        ],
        'Best Streamer': [
            {
                label: 'Garsh',
                image: null,
                winner: true,
                link: 'https://www.twitch.tv/garsh_',
            },
            {
                label: 'Electrostats',
                image: null,
                winner: false,
                link: 'https://www.twitch.tv/electrostats',
            },
            {
                label: '420McNuggies',
                image: null,
                winner: false,
                link: 'https://www.twitch.tv/420mcnuggies',
            },
            {
                label: 'Tseska_',
                image: null,
                winner: false,
                link: 'https://www.twitch.tv/Tseska_',
            },
            {
                label: 'Sync_bs',
                image: null,
                winner: false,
                link: 'https://www.twitch.tv/sync_bs',
            },
            {
                label: 'Denyah',
                image: null,
                winner: false,
                link: 'https://www.twitch.tv/denyah_',
            },
        ],
        'Best Troll Mod': [
            {
                label: 'The mod that refuses to let you play the game if league of legends is installed.',
                image: null,
                winner: true,
            },
            {
                label: 'Nya',
                image: null,
                winner: false,
            },
            {
                label: 'Game crashes if you miss first note',
                image: null,
                winner: false,
            },
            {
                label: 'LeagueIsBadAndYouShouldBeSorry',
                image: null,
                winner: false,
            },
            {
                label: 'O Canada',
                image: null,
                winner: false,
            },
        ],
        'Best Tweet': [
            {
                label: 'coolguy1260',
                image: null,
                winner: true,
                link: 'https://twitter.com/coolguy1260/status/1377073677276082177',
            },
            {
                label: 'Acc Champ',
                image: null,
                winner: false,
                link: 'https://twitter.com/Acc_Champ/status/1466209289849212928',
            },
            {
                label: 'Gaelicanz',
                image: null,
                winner: false,
                link: 'https://twitter.com/Gaelicanz/status/1444367153281609729?s=20',
            },
            {
                label: 'Deynah',
                image: null,
                winner: false,
                link: 'https://twitter.com/Denyah_/status/1371885738074202112',
            },
            {
                label: 'Joetastic_',
                image: null,
                winner: false,
                link: 'https://twitter.com/Joetastic_/status/1468109811506028551',
            },
            {
                label: 'HarveyRacoon',
                image: null,
                winner: false,
                link: 'https://twitter.com/HarveyRacoon/status/1458484047005593600?s=20',
            },
            {
                label: 'Reaxt',
                image: null,
                winner: false,
                link: 'https://twitter.com/Reaxt1/status/1369777557097287685',
            },
        ],
        'Best YouTuber': [
            {
                label: 'DarkSwitchPro',
                image: null,
                winner: false,
                link: 'https://www.youtube.com/c/DarkSwitchPro',
            },
            {
                label: 'Furious',
                image: null,
                winner: false,
                link: 'https://www.youtube.com/c/FuriousVR',
            },
            {
                label: 'Cube Community',
                image: null,
                winner: true,
                link: 'https://www.youtube.com/c/CubeCommunity',
            },
            {
                label: 'LSToast',
                image: null,
                winner: false,
                link: 'https://www.youtube.com/c/LoganTheobald',
            },
            {
                label: 'Spledgey',
                image: null,
                winner: false,
                link: 'https://www.youtube.com/c/Spledgey',
            },
        ],
        'Country to most likely pop off in the next World Cup': [
            {
                label: 'Israel',
                image: null,
                winner: false,
            },
            {
                label: 'Denmark',
                image: null,
                winner: false,
            },
            {
                label: 'Australia',
                image: null,
                winner: true,
            },
            {
                label: 'Finland',
                image: null,
                winner: false,
            },
            {
                label: 'France',
                image: null,
                winner: false,
            },
            {
                label: 'Germany',
                image: null,
                winner: false,
            },
        ],
        'Most controversial ranked Map': [
            {
                label: 'Cold weather',
                image: 'https://as.cdn.beatsaver.com/a043595f41e8b23ce5db900218c4b13c74149bca.jpg',
                winner: true,
                link: 'https://beatsaver.com/maps/1a67e',
            },
            {
                label: 'Slime Incident',
                image: 'https://as.cdn.beatsaver.com/d13d74987c4095e5064b91d2963a96d06561962b.jpg',
                winner: false,
                link: 'https://beatsaver.com/maps/1a4f5',
            },
            {
                label: 'Funk Assembly',
                image: 'https://as.cdn.beatsaver.com/07aaf7ed2dc6bf3d735671094142f2bd4d2ad157.jpg',
                winner: false,
                link: 'https://beatsaver.com/maps/19632',
            },
            {
                label: 'DDImil - My Album Corps Out',
                image: 'https://as.cdn.beatsaver.com/7091e07305aab0e1e85f4c292c97750d138a9e4b.jpg',
                winner: false,
                link: 'https://beatsaver.com/maps/1a55e',
            },
        ],
        'Most exciting Tournament': [
            {
                label: 'BSWC 2021',
                image: null,
                winner: true,
            },
            {
                label: 'Hidden Sabers 2',
                image: null,
                winner: false,
            },
            {
                label: 'BSL Season 3',
                image: null,
                winner: false,
            },
            {
                label: 'RST 2021',
                image: null,
                winner: false,
            },
            {
                label: 'Rumble Royale 2021',
                image: null,
                winner: false,
            },
        ],
        'Most helpful Person at Tournaments': [
            {
                label: 'Gregi',
                image: null,
                winner: true,
            },
            {
                label: 'BakedaDough',
                image: null,
                winner: false,
            },
            {
                label: 'Sirspam',
                image: null,
                winner: false,
            },
            {
                label: 'DannyPoke',
                image: null,
                winner: false,
            },
            {
                label: 'JiveOff',
                image: null,
                winner: false,
            },
            {
                label: 'Spiza',
                image: null,
                winner: false,
            },
        ],
        'Most impressive Score set': [
            {
                label: "Bytesy's GH8ST Pass",
                image: null,
                winner: true,
                link: 'https://www.youtube.com/watch?v=dtfKNoCjl4c',
            },
            {
                label: 'Pulselane on Passive Manipulation - longest 115 streak',
                image: null,
                winner: false,
                link: 'https://drive.google.com/file/d/1f73i8yHxjXWtKp3nFiMcPGSnJgU1-c_r/view',
            },
            {
                label: 'Udons 95.99 on sacrament',
                image: null,
                winner: false,
                link: 'https://www.youtube.com/watch?v=0LubGPvRmlo',
            },
        ],
        'Most popular Clan': [
            {
                label: 'ACC',
                image: 'https://lh6.googleusercontent.com/M3aU60P_uluVw1cn7yBl-MTN9glZJorEGy_ARhYb-i2wA_dKwH0i8mTl9VOqjbc7A09p6ojkTkAQ-NYz3te9Z7WhhJqXbFAjrck8L2awhN2n2-Ed9NeFxMWQlgJto3YJHHqbV6uLBeN-kxit',
                winner: true,
            },
            {
                label: 'LMAO',
                image: 'https://lh4.googleusercontent.com/WT4I8WmpJQEfCmELgejfcQDkvsVtIVLtgtZyHlU3IpP_5y1MzXx7mj6yUuVTi0QJMWQeluEgyIprGH7qHt3Poyci4hhQmHc0axbzSHubQfc23IWK_H8GYI9u7p5imHOnOdFEfX6F1BETz2e7',
                winner: false,
            },
            {
                label: 'Ball Sack Gaming',
                image: 'https://lh6.googleusercontent.com/_POfKxsmPIKPHHG5SJMqlmbxa2h6NWdEHhltr80GOAYJVQnvRJqScdpqsW_uZHyzh2UDfflL1pOupLl8eBFzTQ24cMAq5ro_GyT6RwTCyz8nnDx2gs1Z7G72Az1wv5-FgIrH1qEFz1y_ZqUm',
                winner: false,
            },
            {
                label: 'WDG',
                image: 'https://lh6.googleusercontent.com/X-4g0ToF0WbOzUvIjaZzrjfezXucI8BLddHp6ltAT5DCR4PlU0bcWIgH-uIHKS8wCNn4TeWHHCe8OKxigv1RLkQHZZJJavnINx-iHwTDSGiPN4Uf2lgdZpe1GVGAcXTJnwbEJJGYfzQvEt5K',
                winner: false,
            },
            {
                label: 'WDN',
                image: 'https://lh5.googleusercontent.com/qbHKPvD4dfkMw2fTRYEfBI5xN0Mk6DgSllpJFXYS00mNoZ8deKEMOk2PjYNIrLls1dECU3hfai4XHq4KrTo-BDffDewLw_3M9x7QnCE0nt-wr68z-jqZQ0aPwbW-uM3HOh436bxrK6Z9eHZ0',
                winner: false,
            },
            {
                label: 'YEP',
                image: 'https://lh3.googleusercontent.com/xjhPF0qNpxEcVgwT_j4BOfFwUZVhiia2bWIZFZ_IdRSMPVjmRyG0RE4_M_PM4UsRZp-W0TBZZEqO_Oo-U4R3eTUdS52LseeHYXbnN7_U-GOZ7ofG4F8tdjZh5Ded92UwaD01Z5GpiXx3Tkxt',
                winner: false,
            },
            {
                label: 'OBCT',
                image: 'https://lh6.googleusercontent.com/e_p9R1U2WjHRwdVVSgCuXSDfL87BuKdFHNMu0VuZSCg_uyELEh1-mHebZSEHHhom3TOdF5pRnPbt2Sabiza65SzGCEtoJzw4hghk-Ol3pboxgkmD9q0TvmRcrwITMRFEWXjX0COQTevzEYpP',
                winner: false,
            },
        ],
        'Player who performed at their best': [
            {
                label: 'Cerret',
                image: 'https://cdn.scoresaber.com/avatars/76561198333869741.jpg',
                winner: true,
                link: 'https://scoresaber.com/u/76561198333869741',
            },
            {
                label: 'Garsh',
                image: 'https://cdn.scoresaber.com/avatars/76561198187936410.jpg',
                winner: false,
                link: 'https://scoresaber.com/u/76561198187936410',
            },
            {
                label: 'Tseska',
                image: 'https://cdn.scoresaber.com/avatars/76561198362923485.jpg',
                winner: false,
                link: 'https://scoresaber.com/u/76561198362923485',
            },
            {
                label: 'Rocker',
                image: 'https://cdn.scoresaber.com/avatars/76561198166289091.jpg',
                winner: false,
                link: 'https://scoresaber.com/u/76561198166289091',
            },
            {
                label: 'Gustav',
                image: 'https://cdn.scoresaber.com/avatars/76561198075605706.jpg',
                winner: false,
                link: 'https://scoresaber.com/u/76561198075605706',
            },
        ],
        'Player with the most promising future': [
            {
                label: 'Udon',
                image: 'https://cdn.scoresaber.com/avatars/76561199104169308.jpg',
                winner: true,
                link: 'https://scoresaber.com/u/76561199104169308',
            },
            {
                label: 'Kira',
                image: 'https://cdn.scoresaber.com/avatars/76561198027277296.jpg',
                winner: false,
                link: 'https://scoresaber.com/u/76561198027277296',
            },
            {
                label: 'Duckydesu',
                image: 'https://cdn.scoresaber.com/avatars/76561198316367811.jpg',
                winner: false,
                link: 'https://scoresaber.com/u/76561198316367811',
            },
            {
                label: 'Bizzy',
                image: 'https://cdn.scoresaber.com/avatars/oculus.png',
                winner: false,
                link: 'https://scoresaber.com/u/3225556157461414',
            },
        ],
        'Worst Gimmick Account': [
            {
                label: 'All of them.',
                image: null,
                winner: true,
            },
        ],
    };

    constructor(public sanitizer: DomSanitizer) {}

    ngOnInit(): void {}

    scroll(id: string) {
        let el = document.getElementById(id);
        el.scrollIntoView({
            behavior: 'smooth',
        });
    }

    linkSanitizer(link: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(link);
    }
}
