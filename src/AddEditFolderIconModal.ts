import {App, ButtonComponent, Modal, Setting, TextComponent} from 'obsidian';


export class AddEditFolderIconModal extends Modal {
    private readonly onSubmit: (folderPath: string, iconPath: string) => Promise<void>;

    constructor(app: App, onSubmit: (folderPath: string, iconPath: string) => Promise<void>) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen(): Promise<void> | void {
        this.setTitle('Add folder');

        let folderPath: string = '';
        let iconPath: string = '';

        new Setting(this.contentEl)
            .setName('Folder')
            .setDesc('Full path of the folder from the root of the vault')
            .addText((text: TextComponent): TextComponent =>
                text.onChange((value: string): void => {
                    folderPath = value.trim();
                }));

        new Setting(this.contentEl)
            .setName('Icon')
            .setDesc('Name of the SVG image to use as an icon')
            .addText((text: TextComponent): TextComponent =>
                text.onChange((value: string): void => {
                    iconPath = value.trim();
                }));

        new Setting(this.contentEl)
            .addButton((button: ButtonComponent): ButtonComponent =>
                button.setButtonText('Cancel')
                      .onClick((): void => this.close()))
            .addButton((button: ButtonComponent): ButtonComponent =>
                button.setButtonText('Add')
                      .setCta()
                      .onClick(async (): Promise<void> => {
                          if (folderPath !== '' && iconPath !== '') {
                              await this.onSubmit(folderPath, iconPath);
                              this.close();
                          }
                      }));
    }
}