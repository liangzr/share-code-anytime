import * as vscode from 'vscode';

/**
 * Ensure the TextEditor actived
 */
export const ensureEditorActived = () => {
  if (!vscode.window.activeTextEditor) {
    vscode.window.showErrorMessage('Active a TextEditor first');
    return false;
  }
  return true;
};

/**
 * Prefix the string with 'https'
 */
export const prefixHttps = (path: string) => `https://${path}`;

/**
 * Determine if remote is from GitHub
 */
export const isGitHub = (remote: string) => remote.includes('github');
