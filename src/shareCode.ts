import * as vscode from 'vscode';
import * as opn from 'opn';
import GitRepository from './git';
import NodeModule from './npm';
import { isGitHub } from './util';
import Pastebin from './pastebin';

export default class ShareCode {
  /**
   * Open code or file in corresponding remote repository
   */
  public static async openRemoteRepository() {
    if (NodeModule.insideNodeModules()) {
      const module = new NodeModule();
      if (module.repository) {
        const activedFile = vscode.window.activeTextEditor!.document.fileName;
        const filepathInGit = activedFile.replace(module.moduleRoot, '');
        const suffix = GitRepository.createHighlightSuffix(isGitHub(module.repository));
        const url = GitRepository.createRemoteURL(module.repository, 'master', filepathInGit, suffix);

        ShareCode.openURL(url);
      } else {
        vscode.window.showErrorMessage('This project in node_modules do not have a `repository` field.');
      }
    } else if (GitRepository.ensureGitRepository()) {
      const repo = new GitRepository();
      if (repo.hasRemoteRepo()) {
        const url = await repo.createRemoteURL();

        ShareCode.openURL(url);
      } else {
        vscode.window.showErrorMessage('This repository is no configured push-distination, use `git remote add <name> <url>.`');
      }
    } else {
      vscode.window.showInformationMessage('Share Code only support git repository now.');
    }
  }

  public static async shareWithPastebin() {
    vscode.window.withProgress(
      {
        title: 'Upload to Pastebin.com...',
        location: vscode.ProgressLocation.Notification,
        cancellable: false,
      },
      () => Pastebin.post(),
    ).then((url) => {
      ShareCode.openURL(url);
    });
  }

  /**
   * Open a website via native
   * @param url Web URL
   */
  private static openURL(url: string) {
    if (url) opn(url);
  }
}
