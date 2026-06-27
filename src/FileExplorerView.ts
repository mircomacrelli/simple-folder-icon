import {View} from "obsidian";
import {FileExplorerItem} from "./FileExplorerItem";

export interface FileExplorerView extends View {
    fileItems: Record<string, FileExplorerItem>;
}