import * as vscode from 'vscode';

/**
 * Ensure the editor is actived
 */
export const ensureEditorActived  = () => {
	if (typeof vscode.window.activeTextEditor === 'undefined') {
			vscode.window.showErrorMessage('Active a TextEditor first');
			return false;
	}
	return true;
};

export const prefixHttp = (path: string): string => `http://${path}`;

export const isGitHub = (remote: string): boolean => remote.includes('github');