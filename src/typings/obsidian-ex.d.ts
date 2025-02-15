import { Extension } from "@codemirror/state";
import type { DatacoreApi } from "api/api";
import { CanvasMetadataIndex } from "index/types/json/canvas";
import "obsidian";
import { App } from "obsidian";
import * as hooks from "preact/hooks";

/** @hidden */
declare module "obsidian" {
    export interface View extends Component {
        getState(): any;
    }
    interface WorkspaceLeaf {
        serialize(): {
            id: string;
            type: "leaf";
            state: {
                type: string;
                state: any;
            };
        };
        tabHeaderEl: HTMLElement;
        tabHeaderInnerTitleEl: HTMLElement;
    }
    interface View {
        getState(): any;
    }
    interface ItemView {
        titleEl: HTMLElement;
        getState(): any;
    }

    interface InternalPlugin<T> {
        id: string;
        name: string;
        description: string;
        instance: T;
    }
    export interface PagePreviewPlugin {
        onLinkHover: (
            view: View,
            hovered: HTMLElement,
            hoveredPath: string,
            sourcePath: string,
            _unknown: unknown
        ) => void;
    }

    interface FileManager {
        linkUpdaters: {
            canvas: {
                canvas: {
                    index: {
                        index: CanvasMetadataIndex;
                    };
                };
            };
        };
    }
    interface Vault {
        getConfig: (conf: string) => any;
    }
    interface App {
        appId?: string;
        plugins: {
            enablePlugin: (id: string) => Promise<boolean>;
            disablePlugin: (id: string) => Promise<boolean>;
            enabledPlugins: Set<string>;
            plugins: {
                datacore?: {
                    api: DatacoreApi;
                };
                "datacore-addon-autocomplete"?: {
                    readonly extensions: Extension[];
                };
            };
        };
        internalPlugins: {
            getPluginById: <T>(id: string) => InternalPlugin<T>;
        };

        embedRegistry: {
            embedByExtension: {
                [key: string]: unknown;
                md: MarkdownRenderer;
            };
            getEmbedCreator: (arg: TFile) => new (
                arg2: {
                    app: App;
                    linktext: string;
                    sourcePath: string;
                    showInline: boolean;
                    depth: number;
                    containerEl: HTMLElement;
                    displayMode: boolean;
                },
                file: TFile,
                subpath?: string
            ) => FileView & { loadFile: (file: TFile) => void };
        };
    }
    interface WorkspaceLeaf {
        containerEl: HTMLElement;
        resizeHandleEl: HTMLElement;
        tabHeaderEl: HTMLElement;
        tabHeaderInnerIconEl: HTMLElement;
        tabHeaderInnerTitleEl: HTMLElement;
        tabHeaderStatusContainerEl: HTMLElement;
        tabHeaderStatusPinEl: HTMLElement;
        tabHeaderStatusLinkEl: HTMLElement;
        tabHeaderCloseEl: HTMLElement;
    }
}

declare global {
    interface Window {
        datacore?: DatacoreApi;
        app: App;
        CodeMirror: {
            defineMode: (mode: string, conf: (config: any) => any) => unknown;
            [key: string]: any;
        };
    }
}
