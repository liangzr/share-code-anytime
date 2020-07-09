import * as vscode from 'vscode';
import * as opn from 'opn';
import GitRepository from './git';

export default class ShareCode {
  /**
   * Open code or file in corresponding remote repository
   */
  public static async openRemoteRepository() {
    if (GitRepository.ensureGitRepository()) {
      const repo = new GitRepository();
      if (repo.hasRemoteRepo()) {
        const url = await repo.createRemoteURL(ShareCode.getSelection());

        if (url) {
          ShareCode.openURL(url);
        }
      } else {
        vscode.window.showErrorMessage('This repository is no configured push-distination, use `git remote add <name> <url>.`');
      }
    } else {
      vscode.window.showInformationMessage('Share Code only support git repository now.');
    }
  }

  /**
   * Get current user selection
   */
  private static getSelection(): vscode.Selection | undefined {
    return vscode.window.activeTextEditor!.selection;
  }

  /**
   * Open a website via native
   * @param url Web URL
   */
  private static openURL(url: string) {
    opn(url);
  }
}
