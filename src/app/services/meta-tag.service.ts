import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class MetaTagService {

    private urlMeta: string = "og:url";//
    private titleMeta: string = "og:title";//
    private descriptionMeta: string = "og:description";
    private imageMeta: string = "og:image";//
    private typeMeta: string = "og:type";//

    constructor(private titleService: Title, private metaService: Meta) { }

    public defineTags(url: string, title: string, description: string, image: string): void {
        var mainUrl = `https://beatkhana.com${url}`;
        var imageUrl = `https://beatkhana.com/${image}`;
        var tags = [
            new MetaTag(this.urlMeta, mainUrl, true),
            new MetaTag(this.titleMeta, title, true),
            new MetaTag(this.descriptionMeta, description, true),
            new MetaTag(this.imageMeta, imageUrl, true),
            new MetaTag(this.typeMeta, 'website', true),
        ];
        this.setTags(tags);
    }

    private setTags(tags: MetaTag[]): void {
        tags.forEach(siteTag => {
            const tag = siteTag.isFacebook ? this.metaService.getTag(`property='${siteTag.name}'`) : this.metaService.getTag(`name='${siteTag.name}'`);
            if (siteTag.isFacebook) {
                this.metaService.updateTag({ property: siteTag.name, content: siteTag.value });
            } else {
                this.metaService.updateTag({ name: siteTag.name, content: siteTag.value });
            }
        });
    }
}

export class MetaTag {
    name: string;
    value: string;
    isFacebook: boolean;

    constructor(name: string, value: string, isFacebook: boolean) {
        this.name = name;
        this.value = value;
        this.isFacebook = isFacebook;
    }
}

