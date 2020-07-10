import * as vscode from 'vscode';
import * as path from 'path';
import * as qs from 'querystring';
import axios from 'axios';

const authToken = '16334a7e1c52a916759b00a134862848';
const postURL = 'https://pastebin.com/api/api_post.php';

export default class Pastebin {
  public static async post(): Promise<string> {
    const { document, selection } = vscode.window.activeTextEditor!;
    const code = document.getText(selection) || document.getText();

    try {
      const res = await axios.post(postURL, qs.stringify({
        api_dev_key: authToken,
        api_option: 'paste',
        api_paste_code: code,
        api_paste_private: 0,
        api_paste_name: path.basename(document.fileName),
      }));

      return res.data;
    } catch (error) {
      return '';
    }
  }
}
