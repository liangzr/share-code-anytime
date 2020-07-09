import * as path from 'path';
import * as vscode from 'vscode';

import { prefixHttps, isGitHub } from './util';
import { execInWorkspace } from './shell';

const GIT_REGEX = {
  SSH: /^git@(.*?):(.*?).git$/i,
  HTTP: /^((http|https).*?).git$/i,
  REMOTE: /((git|http).*?\.git)/i,
  BRANCHS: /^##\s(.+?)[\s\n]/i,
  SPLIT_BRANCH: /\.{3}.*?\//i,
};

export default class GitRepository {
  /**
   * Current branch
   */
  branch = 'master';

  /**
   * Relative file path in git repository
   */
  filepath = '';

  /**
   * Remote branch
   */
  remoteBranch?: string;

  /**
   * Corresponding remote repository
   */
  remoteRepo?: string;

  constructor() {
    this.remoteRepo = GitRepository.getRemoteRepo();
    [this.branch, this.remoteBranch] = GitRepository.getBranchs();
    this.filepath = GitRepository.getFilepath();
  }

  /**
   * Ensure current workspace is a git repository
   */
  static ensureGitRepository(): boolean {
    const repoStatus = execInWorkspace('git status');

    return !repoStatus.includes('not a git repository');
  }

  /**
   * Create remote url of selected code or file
   * @param selection user selection
   */
  public async createRemoteURL(selection?: vscode.Selection): Promise<string> {
    let highlightSuffix = '';

    if (selection && !selection.isEmpty) {
      highlightSuffix += `#L${selection.start.line + 1}-`;

      if (isGitHub(this.remoteRepo as string)) {
        highlightSuffix += `L${selection.end.line + 1}`;
      } else {
        highlightSuffix += (selection.end.line + 1);
      }
    }

    let targetBranch = this.remoteBranch;

    if (!this.remoteBranch) {
      targetBranch = await vscode.window.showQuickPick(['master', this.branch], {
        placeHolder: `The current branch ${this.branch} has no upstream branch, open it on master?`,
      });
    }

    if (!targetBranch) return '';

    const repoURL = GitRepository.normalizeRepoURL(this.remoteRepo);

    return path.join(repoURL, 'blob', targetBranch, this.filepath) + highlightSuffix;
  }

  /**
   * If current projeect has a remote upstream.
   */
  public hasRemoteRepo() {
    return !!this.remoteRepo;
  }

  private static normalizeRepoURL(remote: string = '') {
    if (GIT_REGEX.SSH.test(remote)) {
      return prefixHttps(path.join(RegExp.$1, RegExp.$2));
    } if (GIT_REGEX.HTTP.test(remote)) {
      return RegExp.$1;
    }

    return remote;
  }

  /**
   * Get remote repository of current project
   */
  private static getRemoteRepo(): string {
    const remoteConfig: string = execInWorkspace('git remote -v');

    if (GIT_REGEX.REMOTE.test(remoteConfig)) {
      return RegExp.$1;
    }

    return '';
  }

  /**
   * Get relative path of current actived file
   */
  private static getFilepath() {
    const editor = vscode.window.activeTextEditor;

    return vscode.workspace.asRelativePath(editor!.document.uri.path);
  }

  /**
   * Get current branch and remote branch
   */
  private static getBranchs(): string[] {
    const repoStatus = execInWorkspace('git status -bs').toString();

    if (GIT_REGEX.BRANCHS.test(repoStatus)) {
      return RegExp.$1.split(GIT_REGEX.SPLIT_BRANCH);
    }

    return ['master'];
  }
}
