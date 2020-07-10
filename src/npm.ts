import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

interface RepositoryConfig {
  type?: 'git' | 'svn',
  url?: string
}

const MODULE_REGEX = {
  ROOT: /(^.*node_modules\/([^@]*?|.*?\/.*?))\//i,
};

export default class NodeModule {
  /**
   * Root path of ambiant npm package
   */
  moduleRoot: string = ''

  /**
   * Corresponding git repository
   */
  repository?: string

  constructor() {
    this.moduleRoot = NodeModule.resolveModuleRoot();
    this.repository = this.resolveRepo();
  }

  /**
   * Resolve remote repository from node module
   */
  public resolveRepo(): string | undefined {
    const packageJsonPath = path.join(this.moduleRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    const repoConfig: string | RepositoryConfig = pkg.repository;
    if (typeof repoConfig === 'string') {
      if (repoConfig.startsWith('github')) {
        const [group, repo] = repoConfig.slice(7).split('/');

        return `https://github/${group}/${repo}`;
      }
    } else if (repoConfig.type === 'git') {
      return repoConfig.url;
    }

    return undefined;
  }

  /**
   * Resolve root path of node module
   */
  public static resolveModuleRoot() {
    const editor = vscode.window.activeTextEditor;
    const filepath = editor!.document.fileName;

    let rootPath = MODULE_REGEX.ROOT.exec(filepath)?.[1];

    if (
      rootPath
      && rootPath.split('node_modules')[1].includes('@')
      && !fs.existsSync(path.join(rootPath, 'package.json'))
    ) {
      rootPath = path.resolve(rootPath, '../');
    }

    return rootPath || vscode.workspace.rootPath!;
  }

  /**
   * Determine if current active editor is under node_modules
   */
  public static insideNodeModules() {
    const editor = vscode.window.activeTextEditor;

    return editor!.document.fileName.includes('node_modules');
  }
}
