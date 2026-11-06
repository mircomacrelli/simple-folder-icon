import {Plugin, TFile} from 'obsidian';
import {DEFAULT_SETTINGS} from "./constants";
import {FolderIconSettings} from "./FolderIconSettings";
import {FolderIconSettingsTab} from "./FolderIconSettingsTab";


export default class FolderIcon extends Plugin {
    private styleSheet: CSSStyleSheet | null = null;

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
        if (this.styleSheet) {
            activeDocument.adoptedStyleSheets = activeDocument.adoptedStyleSheets.filter(
                (sheet: CSSStyleSheet): boolean => sheet !== this.styleSheet
            );
        }
    }

    private async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as FolderIconSettings);
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    private createStyleEl(): void {
        if (!this.styleSheet) {
            this.styleSheet = new CSSStyleSheet();
            activeDocument.adoptedStyleSheets = [...activeDocument.adoptedStyleSheets, this.styleSheet];
        }
    }

    async updateStyle(): Promise<void> {
        if (this.styleSheet) {
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
.nav-folder-title[data-path='${CSS.escape(folder)}'] .nav-folder-title-content::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    vertical-align: top;
    background-color: currentColor;
    mask-image: url('${CSS.escape(icon)}');
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
}`);
            }
            this.styleSheet.replaceSync(cssRules.join('\n'));
        }
    }
}
