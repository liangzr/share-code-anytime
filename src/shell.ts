import * as cp from 'child_process';
import * as vscode from 'vscode';

/**
 * Execute shell script
 * @param command shell script
 * @param options exec options
 */
export function exec(
  command: string,
  options?: cp.ExecSyncOptions,
) {
  try {
    return cp.execSync(command, options).toString();
  } catch (error) {
    console.log(error);
    return '';
  }
}

/**
 * Execute shell script in active workspace
 * @param command shell script
 * @param options exec options
 */
export function execInWorkspace(
  command: string,
  options?: cp.ExecSyncOptions,
) {
  try {
    return exec(command, Object.assign(options || {}, {
      cwd: vscode.workspace.rootPath,
    }));
  } catch (error) {
    console.log(error);
    return '';
  }
}

/**
 * Execute shell script file
 * @param file shell script file
 * @param options exec options
 */
export function execFile(
  file: string,
  options?: cp.ExecFileSyncOptions,
) {
  return cp.execFileSync(file, options).toString();
}
