import * as cp from 'child_process';
import * as vscode from 'vscode';

export function run<TOut extends string | Buffer>(
  command: string,
  options?: cp.ExecSyncOptions
): TOut {
  try {
    const ret = cp.execSync(command, options);
    if (ret) {
       return ret.toString() as TOut; 
    }
    return (ret as TOut);
  } catch (error) {
    console.log(error);    
    return ('' as TOut);
  }
}

export function runInWorkspace<TOut extends string | Buffer>(
  command: string,
  options?: cp.ExecSyncOptions
): TOut {
  try {
    return run(command, Object.assign(options || {}, {
      cwd: vscode.workspace.rootPath
    }));
  } catch (error) {
    console.log(error);    
    return ('' as TOut);
  }
}

export function runFile<TOut extends string | Buffer>(
  file: string,
  options?: cp.ExecFileSyncOptions
): TOut {
  const ret = cp.execFileSync(file, options).toString();
  return (ret as TOut);
}