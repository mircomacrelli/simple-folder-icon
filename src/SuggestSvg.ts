import {AbstractInputSuggest, App, TFile} from "obsidian";

export class SuggestSvg extends AbstractInputSuggest<TFile> {
    private readonly allSvg: TFile[];

    constructor(app: App, textInputEl: HTMLInputElement | HTMLDivElement) {
        super(app, textInputEl);
        this.allSvg = this.app.vault.getFiles().filter((file: TFile): boolean =>
            file.extension.toLowerCase() === 'svg');
    }

    protected getSuggestions(query: string): TFile[] | Promise<TFile[]> {
        return this.allSvg.filter((file: TFile): boolean =>
            file.path.toLowerCase().contains(query.toLowerCase()));
    }

    renderSuggestion(value: TFile, el: HTMLElement): void {
        el.setText(value.path);
    }

    selectSuggestion(value: TFile, evt: MouseEvent | KeyboardEvent) {
        this.setValue(value.path);
        this.close();
    }
}