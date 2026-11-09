import {App, PluginSettingTab, SettingDefinitionAction, SettingDefinitionItem} from 'obsidian';
import FolderIcon from "./FolderIcon";
import {FolderConfiguration} from './FolderConfiguration';
import {AddEditFolderIconModal} from './AddEditFolderIconModal';


export class FolderIconSettingsTab extends PluginSettingTab {
    plugin: FolderIcon;

    constructor(app: App, plugin: FolderIcon) {
        super(app, plugin);
        this.plugin = plugin;
        this.icon = 'image';
    }

    private async saveSettings(): Promise<void> {
        this.update();
        await this.plugin.saveSettings();
    }

    private async saveAndUpdate(): Promise<void> {
        await this.saveSettings()
        await this.plugin.updateStyle();
    }

    private openModal(idx?: number) {
        const selected: FolderConfiguration | undefined =
            idx === undefined ? undefined : this.plugin.settings.icons[idx];
        new AddEditFolderIconModal(this.app, this.plugin.settings.icons, selected, async (folderPath: string, iconPath: string): Promise<void> => {
            if (selected) {
                selected.folderPath = folderPath;
                selected.iconPath = iconPath;
            } else {
                this.plugin.settings.icons.push({
                    folderPath: folderPath,
                    iconPath: iconPath
                });
            }
            await this.saveAndUpdate();
        }).open();
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            {
                type: 'list',
                heading: 'Folders',
                emptyState: 'No folders configured',
                items: this.plugin.settings.icons.map((item: FolderConfiguration, index: number): SettingDefinitionAction => ({
                    name: `${item.folderPath} → ${item.iconPath}`,
                    action: (): void => this.openModal(index),
                    searchable: true
                })),
                onDelete: (index: number): void => {
                    this.plugin.settings.icons.splice(index, 1);
                    this.saveAndUpdate().catch(console.error);
                },
                onReorder: (from: number, to: number): void => {
                    const [item] = this.plugin.settings.icons.splice(from, 1);
                    if (item) {
                        this.plugin.settings.icons.splice(to,  0, item);
                        this.saveSettings().catch(console.error);
                    }
                },
                addItem: {
                    name: 'Add folder',
                    action: (): void => this.openModal()
                }
            }
        ];
    }
}
