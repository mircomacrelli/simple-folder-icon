import {
    AbstractInputSuggest,
    App,
    ButtonComponent,
    Modal,
    normalizePath,
    Notice,
    Setting, TAbstractFile,
    TextComponent,
    TFile,
    TFolder
} from 'obsidian';
import {SuggestFolder} from "./SuggestFolder";
import {SuggestSvg} from "./SuggestSvg";
import {FolderConfiguration} from "./FolderConfiguration";


export class AddEditFolderIconModal extends Modal {
    private readonly errorClass: string = 'sfi-input-error';

    private readonly onSubmit: (folderPath: string, iconPath: string) => Promise<void>;

    private readonly icons: FolderConfiguration[];

    private readonly selected: FolderConfiguration|undefined;

    constructor(app: App, icons: FolderConfiguration[], selected: FolderConfiguration|undefined, onSubmit: (folderPath: string, iconPath: string) => Promise<void>) {
        super(app);
        this.icons = icons;
        this.selected = selected;
        this.onSubmit = onSubmit;
    }

    private createTextField(name: string, description: string, value: string|undefined, SuggestClass: new (app: App, inputEl: HTMLInputElement) => AbstractInputSuggest<TFile|TFolder>): TextComponent {
        const setting = new Setting(this.contentEl).setName(name).setDesc(description);
        const input: TextComponent = new TextComponent(setting.controlEl);
        if (value !== undefined) {
            input.setValue(value);
        }
        input.onChange((value: string): void => {
            if (value.trim() !== '') {
                input.inputEl.removeClass(this.errorClass);
            }
        });
        new SuggestClass(this.app, input.inputEl);
        return input;
    }

    private isAlreadyDefined(folder: string) {
        for (const icon of this.icons) {
            if (this.selected !== icon && icon.folderPath === folder) {
                return true;
            }
        }
        return false;
    }

    onOpen(): Promise<void> | void {
        this.setTitle(this.selected === undefined ? 'Add folder': 'Edit folder');

        const folderInput: TextComponent =
            this.createTextField('Folder', 'Full path of the folder from the root of the vault',
                this.selected?.folderPath, SuggestFolder);
        const iconInput: TextComponent =
            this.createTextField('Icon', 'Name of the SVG image to use as an icon',
                this.selected?.iconPath, SuggestSvg);

        new Setting(this.contentEl)
            .addButton((button: ButtonComponent): ButtonComponent =>
                button.setButtonText('Cancel')
                      .onClick((): void => this.close()))
            .addButton((button: ButtonComponent): ButtonComponent =>
                button.setButtonText(this.selected === undefined ? 'Add' : 'Update')
                      .setCta()
                      .onClick(async (): Promise<void> => {
                          const emptyFields: string[] = [];
                          const missingFields: string[] = [];
                          let duplicateFolder: boolean = false;
                          let unsupportedExtension: boolean = false;

                          const rawFolderPath: string = folderInput.getValue().trim();
                          const folderPath: string = rawFolderPath === '' ? '' : normalizePath(rawFolderPath);
                          if (folderPath === '') {
                              folderInput.inputEl.addClass(this.errorClass);
                              emptyFields.push('Folder');
                          } else if (!(this.app.vault.getAbstractFileByPath(folderPath) instanceof TFolder)) {
                              folderInput.inputEl.addClass(this.errorClass);
                              missingFields.push('Folder');
                          } else if (this.isAlreadyDefined(folderPath)) {
                              folderInput.inputEl.addClass(this.errorClass);
                              duplicateFolder = true;
                          }

                          const iconPath: string = iconInput.getValue();
                          const iconFile: TAbstractFile|null = this.app.vault.getAbstractFileByPath(iconPath);
                          if (iconPath === '') {
                              iconInput.inputEl.addClass(this.errorClass);
                              emptyFields.push('Icon');
                          } else if (!(iconFile instanceof TFile)) {
                              iconInput.inputEl.addClass(this.errorClass);
                              missingFields.push('Icon');
                          } else if (iconFile.extension.toLowerCase() !== 'svg') {
                              unsupportedExtension = true;
                          }

                          if (emptyFields.length > 0) {
                              new Notice(`${emptyFields.join(' and ')} ${emptyFields.length > 1 ? 'are' : 'is'} required`);
                              return;
                          } else if (missingFields.length > 0) {
                              new Notice(`${missingFields.join(' and ')} ${missingFields.length > 1 ? 'do' : 'does'} not exist`);
                              return;
                          } else if (duplicateFolder) {
                              new Notice(`The folder ${folderPath} is already configured`);
                              return;
                          } else if (unsupportedExtension) {
                              new Notice(`The icon ${iconPath} does not have a valid extension`);
                              return;
                          }

                          await this.onSubmit(folderPath, iconPath);
                          this.close();
                      }));
    }
}