import {Plugin, TAbstractFile, TFile, TFolder, WorkspaceLeaf} from 'obsidian';
import {FileExplorerView} from "./FileExplorerView";
import {DEFAULT_SETTINGS, ICON_CONTAINER} from "./constants";
import {FolderIconSettings} from "./FolderIconSettings";
import {FolderConfiguration} from "./FolderConfiguration";
import {FolderIconSettingsTab} from "./FolderIconSettingsTab";
import {FileExplorerItem} from './FileExplorerItem';


export default class FolderIcon extends Plugin {
    private folderIcons: Map<string, HTMLElement> = new Map();

    settings: FolderIconSettings = DEFAULT_SETTINGS;

    async onload(): Promise<void> {
        await this.loadSettings();

        this.addSettingTab(new FolderIconSettingsTab(this.app, this));

        this.app.workspace.onLayoutReady(async (): Promise<void> => {
            await this.loadAllIcons();
            this.addFolderIcons();
        });

        this.app.workspace.on('active-leaf-change', (): void => {
            this.removeFolderIcons();
            this.addFolderIcons();
        });
    }

    private async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as FolderIconSettings);
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    async updateAllIcons(): Promise<void> {
        this.unloadAllIcons();
        await this.loadAllIcons();
        this.removeFolderIcons();
        this.addFolderIcons();
    }

    private unloadAllIcons(): void {
        this.folderIcons.clear();
    }

    private async loadAllIcons(): Promise<void> {
        const promises: Promise<void>[] =
            this.settings.icons.map((setting: FolderConfiguration): Promise<void> => this.loadIcon(setting));
        await Promise.all(promises);
    }

    private async loadIcon(config: FolderConfiguration): Promise<void> {
        const file: TFile | null = this.app.metadataCache.getFirstLinkpathDest(config.iconPath, '');
        if (file) {
            const content: string = await this.app.vault.read(file);
            const doc: Document = new DOMParser().parseFromString(content,'text/xml');
            const element = doc.firstElementChild as HTMLElement;
            if (element && element.tagName === 'svg') {
                this.folderIcons.set(config.folderPath, element);
            }
        }
    }

    private addFolderIcons(): void {
        if (this.folderIcons.size > 0) {
            const views: FileExplorerView[] = this.getViews();
            if (views.length > 0) {
                for (const view of views) {
                    for (const [path, item] of Object.entries(view.fileItems)) {
                        const svg: HTMLElement | undefined = this.folderIcons.get(path);
                        if (svg) {
                            const file: TAbstractFile | null = this.app.vault.getAbstractFileByPath(path);
                            if (file instanceof TFolder) {
                                const container: HTMLElement = item.selfEl ?? item.el;
                                if (container) {
                                    const child: Element | null = container.firstElementChild;
                                    if (child && !child.classList.contains(ICON_CONTAINER)) {
                                        const span: HTMLElement = createSpan({cls: ICON_CONTAINER});
                                        span.append(svg);
                                        container.prepend(span);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private removeFolderIcons(): void {
        for (const view of this.getViews()) {
            view.containerEl.findAll(`.${ICON_CONTAINER}`).forEach((span: HTMLElement): void => span.remove());
        }
    }

    private getViews(): FileExplorerView[] {
        return this.app.workspace.getLeavesOfType('file-explorer')
                   .map((leaf: WorkspaceLeaf): FileExplorerView => leaf.view as FileExplorerView)
                   .filter((view: FileExplorerView): Record<string, FileExplorerItem> => view && view.fileItems);
    }

    onunload(): void {
        this.removeFolderIcons();
        this.folderIcons.clear();
    }
}
