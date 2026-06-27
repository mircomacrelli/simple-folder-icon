import {App, PluginSettingTab, SettingDefinitionItem} from 'obsidian';
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

    private async saveAndUpdate(): Promise<void> {
        this.update();
        await this.plugin.saveSettings();
        await this.plugin.updateAllIcons();
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            {
                type: 'list',
                heading: 'Folders',
                emptyState: 'No folders configured',
                items: this.plugin.settings.icons.map((item: FolderConfiguration) => ({
                    name: `${item.folderPath} → ${item.iconPath}`,
                    searchable: true
                })),
                onDelete: async (index: number): Promise<void> => {
                    this.plugin.settings.icons.splice(index, 1);
                    await this.saveAndUpdate();
                },
                onReorder: async (from: number, to: number): Promise<void> => {
                    const [item] = this.plugin.settings.icons.splice(from, 1);
                    if (item) {
                        this.plugin.settings.icons.splice(to,  0, item);
                        await this.plugin.saveSettings();
                    }
                },
                addItem: {
                    name: 'Add folder',
                    action: () => {
                        new AddEditFolderIconModal(this.app, async (folderPath: string, iconPath: string) => {
                            this.plugin.settings.icons.push({
                                folderPath: folderPath,
                                iconPath: iconPath
                            });
                            await this.saveAndUpdate();
                        }).open();
                    }
                }
            }
        ];
    }
}
