import {Plugin, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, STYLE_EL_ID} from "./constants";
import {FolderIconSettings} from "./FolderIconSettings";
import {FolderIconSettingsTab} from "./FolderIconSettingsTab";


export default class FolderIcon extends Plugin {
    private styleEl: HTMLElement | null = null;

    settings: FolderIconSettings = DEFAULT_SETTINGS;

    async onload(): Promise<void> {
        await this.loadSettings();

        this.addSettingTab(new FolderIconSettingsTab(this.app, this));

        this.app.workspace.onLayoutReady(async (): Promise<void> => {
            this.createStyleEl();
            await this.updateStyle();
        });
    }
    onunload(): void {
        if (this.styleEl) {
            this.styleEl.remove();
        }
    }

    private async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as FolderIconSettings);
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    private createStyleEl(): void {
        if (!this.styleEl) {
            // eslint-disable-next-line obsidianmd/no-forbidden-elements
            this.styleEl = activeDocument.head.createEl('style', {attr: {id: STYLE_EL_ID}});
        }
    }

    async updateStyle(): Promise<void> {
        if (this.styleEl) {
            const iconsMap: Map<string, string> = new Map<string, string>();
            for (const setting of this.settings.icons) {
                const file: TFile | null = this.app.metadataCache.getFirstLinkpathDest(setting.iconPath, '');
                if (file) {
                    iconsMap.set(setting.folderPath, this.app.vault.getResourcePath(file));
                }
            }
            const cssRules: string[] = [];
            for (const [folder, icon] of iconsMap) {
                cssRules.push(`
.nav-folder-title[data-path='${folder}'] .nav-folder-title-content::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    vertical-align: top;
    background-color: currentColor;
    mask-image: url('${icon}');
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
}`);
            }
            this.styleEl.textContent = cssRules.join('\n');
        }
    }
}
