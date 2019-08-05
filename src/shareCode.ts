import * as vscode from 'vscode';
import { git } from './gitHelper';
// import { getPastebinURL } from './pastebin';

const opn = require('opn');

interface ServiceQuickPick extends vscode.QuickPickItem {
}

export class ShareCode {
  public async openRemoteRepository() {
    if (git.GitRepository.detectGitRepository()) {
      const repo = new git.GitRepository();
      if (repo.hasRemote()) {
        const url = await repo.genRemoteURLWithSelection(this.getSelection());
        this.openURL(url);
      } else {
        vscode.window.showErrorMessage('This repository is no configured push distination, git remote add <name> <url>');
      }
    } else {
      vscode.window.showOpenDialog({});
      this.shareWithPastebin();
    }
  }
  public shareWithPastebin() {
    // getPastebinURL().then((url: string) => this.openURL(url));
  }

  private getSelection(): vscode.Selection {
    let textEditor: vscode.TextEditor;
    textEditor = (vscode.window.activeTextEditor as vscode.TextEditor);
    
    return textEditor.selection;
  }

  private openURL(url: string) {
    opn(url);
  }
}