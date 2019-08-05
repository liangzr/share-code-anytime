import * as path from 'path';
import * as vscode from 'vscode';

import { prefixHttp, isGitHub } from './util';
import { runInWorkspace } from './shell';

const GIT_REGEX = {
  SSH: /^git@(.*?):(.*?).git$/i,
  HTTP: /^((http|https).*?).git$/i,
  REMOTE: /((git|http).*?\.git)/i,
  BRANCHS: /^##\s(.+?)[\s\n]/i,
  SPLIT_BRANCH: /\.{3}.*?\//i,
};

export namespace git {
  
  export class GitRepository {

    branch: string = 'master';
    remoteBranch: string | undefined;
    filePath: string = '';
    remote: string | undefined;

    constructor() {
      this.remote = this.getRemote();
      [this.branch, this.remoteBranch] = this.getBranch();
      this.filePath = this.getFilePath();
    }

    static detectGitRepository(): boolean {
      const repoStatus: string = runInWorkspace('git status');
      return repoStatus.indexOf('not a git repository') === -1;
    }
    
    public async genRemoteURLWithSelection(selection: vscode.Selection): Promise<string> {
      let highlightSuffix: string = '';

      if (!selection.isEmpty) {
        highlightSuffix += '#L' + (selection.start.line + 1) + '-';

        if (isGitHub(this.remote as string)) {
          highlightSuffix += 'L' + (selection.end.line + 1);
        } else {
          highlightSuffix += (selection.end.line + 1);
        }
      }
      
      let targetBranch = this.remoteBranch; 
      
      if (!this.remoteBranch) {
        targetBranch = await vscode.window.showQuickPick(['master', this.branch], {
          placeHolder: 'The current branch ' + this.branch + ' has no upstream branch, open it on master?'
        });
      }

      const repoURL = GitRepository.normalizeRepositoryURL(this.remote as string);

      return path.join(repoURL, 'blob', targetBranch as string, this.filePath) + highlightSuffix; 
    }
    
    public hasRemote() {
      return !!this.remote;
    }
    
    private static normalizeRepositoryURL(remote: string) {
      if (GIT_REGEX.SSH.test(remote)) {
        return prefixHttp(path.join(RegExp.$1, RegExp.$2));
      } else if (GIT_REGEX.HTTP.test(remote)) {
        return RegExp.$1;
      }

      return remote;
    }

    private getRemote(): string {
      const remoteConfig: string = runInWorkspace('git remote -v');

      if (GIT_REGEX.REMOTE.test(remoteConfig)) {
        return RegExp.$1;
      }

      return '';
    }

    private getFilePath(): string {
      const textEditor = (vscode.window.activeTextEditor as vscode.TextEditor);
      const filePath = textEditor.document.uri.path;
      return vscode.workspace.asRelativePath(filePath);
    }

    private getBranch(): string[] {
      const repoStatus: string = runInWorkspace('git status -bs');
      
      if (GIT_REGEX.BRANCHS.test(repoStatus)) {
          return RegExp.$1.split(GIT_REGEX.SPLIT_BRANCH);
      }

      return ['master'];
    }
    
  }
}