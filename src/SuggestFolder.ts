import {AbstractInputSuggest, App, TFolder} from "obsidian";

export class SuggestFolder extends AbstractInputSuggest<TFolder> {
    private readonly allFolders: TFolder[];

    constructor(app: App, textInputEl: HTMLInputElement | HTMLDivElement) {
        super(app, textInputEl);
        this.allFolders = this.app.vault.getAllFolders(false);
    }

    protected getSuggestions(query: string): TFolder[] | Promise<TFolder[]> {
        const lowerCaseQuery: string = query.toLowerCase();
        return this.allFolders.filter((folder: TFolder): boolean =>
            folder.path.toLowerCase().contains(lowerCaseQuery));
    }

    renderSuggestion(value: TFolder, el: HTMLElement): void {
        el.setText(value.path);
    }

    selectSuggestion(value: TFolder, evt: MouseEvent | KeyboardEvent) {
        this.setValue(value.path);
        this.close();
    }
}