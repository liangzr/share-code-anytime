// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ShareCode from './shareCode';
import { ensureEditorActived } from './util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const openRemoteRepository = vscode.commands.registerCommand('shareCode.openRemoteRepository', () => {
    if (ensureEditorActived()) {
      ShareCode.openRemoteRepository();
    }
  });

  const shareWithPastebin = vscode.commands.registerCommand('shareCode.shareWithPastebin', () => {
    if (ensureEditorActived()) {
      ShareCode.shareWithPastebin();
    }
  });

  context.subscriptions.push(openRemoteRepository);
  context.subscriptions.push(shareWithPastebin);
}

// this method is called when your extension is deactivated
export function deactivate() {}
