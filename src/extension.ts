import * as vscode from 'vscode';
import { generateVariableName } from './aiService';
import { formatVariableName } from './utils';

// 添加调试输出频道
const outputChannel = vscode.window.createOutputChannel('AI 变量命名调试');

export function activate(context: vscode.ExtensionContext) {
  outputChannel.appendLine('AI 变量命名助手已激活');
  console.log('AI 变量命名助手已激活');

  let disposable = vscode.commands.registerCommand('ai-variable-namer.generateName', async () => {
    outputChannel.appendLine('命令已触发: ai-variable-namer.generateName');
    
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        outputChannel.appendLine('错误: 没有打开的编辑器');
        vscode.window.showErrorMessage('没有打开的编辑器');
        return;
      }

      const selection = editor.selection;
      if (selection.isEmpty) {
        outputChannel.appendLine('错误: 没有选择文本');
        vscode.window.showInformationMessage('请先选择文本');
        return;
      }

      const selectedText = editor.document.getText(selection);
      if (selectedText.trim().length === 0) {
        outputChannel.appendLine('错误: 选择的文本为空');
        vscode.window.showInformationMessage('请选择有意义的文本');
        return;
      }
      
      outputChannel.appendLine(`已选择文本: "${selectedText}"`);
      const fileLanguage = editor.document.languageId;
      outputChannel.appendLine(`文件语言: ${fileLanguage}`);
      
      // 获取上下文（选中文本前后的代码）
      const lineCount = 5; // 获取前后5行作为上下文
      const startLine = Math.max(0, selection.start.line - lineCount);
      const endLine = Math.min(editor.document.lineCount - 1, selection.end.line + lineCount);
      
      const contextRange = new vscode.Range(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, editor.document.lineAt(endLine).text.length)
      );
      
      const context = editor.document.getText(contextRange);
      outputChannel.appendLine(`上下文长度: ${context.length} 字符`);
      
      // 获取用户配置
      const config = vscode.workspace.getConfiguration('aiVariableNamer');
      const namingStyle = config.get<string>('namingStyle') || 'camelCase';
      const language = config.get<string>('language') || 'auto';
      const actualLanguage = language === 'auto' ? fileLanguage : language;
      const model = config.get<string>('model') || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B';
      
      outputChannel.appendLine(`命名风格: ${namingStyle}`);
      outputChannel.appendLine(`使用语言: ${actualLanguage}`);
      outputChannel.appendLine(`使用模型: ${model}`);
      
      // 显示加载指示器
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `正在使用"${model.split('/').pop() || model}"生成变量名...`,
        cancellable: false
      }, async (progress) => {
        try {
          // 检查 API 密钥
          const apiKey = config.get<string>('apiKey');
          if (!apiKey) {
            outputChannel.appendLine('错误: API 密钥未配置');
            const setApiKey = '设置 API 密钥';
            const result = await vscode.window.showErrorMessage(
              'API 密钥未配置。请在设置中配置 AI 服务的 API 密钥。',
              setApiKey
            );
            
            if (result === setApiKey) {
              vscode.commands.executeCommand('workbench.action.openSettings', 'aiVariableNamer.apiKey');
            }
            return;
          }
          
          outputChannel.appendLine('开始调用 AI 服务...');
          
          // 设置超时计时器
          let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
            outputChannel.appendLine('警告: AI服务请求超时，但后台继续尝试');
            vscode.window.showWarningMessage('AI服务响应较慢，请稍候...');
          }, 15000); // 15秒后显示警告
          
          // 调用 AI 服务生成变量名
          const suggestions = await generateVariableName(
            selectedText, 
            context, 
            actualLanguage, 
            namingStyle
          );
          
          // 清除超时计时器
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          
          if (!suggestions || suggestions.length === 0) {
            outputChannel.appendLine('错误: 无法生成变量名建议');
            vscode.window.showErrorMessage('无法生成变量名建议');
            return;
          }
          
          outputChannel.appendLine(`收到 ${suggestions.length} 个变量名建议`);
          suggestions.forEach((s, i) => {
            outputChannel.appendLine(`建议 ${i+1}: ${s.name} - ${s.explanation || '无说明'}`);
          });
          
          // 确保所有建议都是英文变量名
          const validSuggestions = suggestions.filter(s => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s.name));
          
          if (validSuggestions.length === 0) {
            outputChannel.appendLine('警告: 没有有效的英文变量名建议，尝试重新格式化');
            // 尝试格式化可能的变量名
            for (const s of suggestions) {
              s.name = formatVariableName(s.name, namingStyle);
            }
          }
          
          // 显示建议列表供用户选择
          const selected = await vscode.window.showQuickPick(
            suggestions.map(s => ({ 
              label: s.name,
              description: s.reason || '推荐变量名',
              detail: s.explanation || undefined
            })),
            { placeHolder: '选择一个变量名' }
          );
          
          if (selected) {
            outputChannel.appendLine(`用户选择了: ${selected.label}`);
            // 替换选中文本
            await editor.edit(editBuilder => {
              editBuilder.replace(selection, selected.label);
            });
            vscode.window.showInformationMessage(`已将文本替换为: ${selected.label}`);
          } else {
            outputChannel.appendLine('用户取消了选择');
          }
        } catch (error) {
          const errorMsg = `生成变量名时出错: ${error instanceof Error ? error.message : String(error)}`;
          outputChannel.appendLine(`错误: ${errorMsg}`);
          vscode.window.showErrorMessage(errorMsg);
        }
        
        return Promise.resolve();
      });
    } catch (error) {
      // 最外层的错误处理，确保命令不会完全崩溃
      const errorMsg = `命令执行出错: ${error instanceof Error ? error.message : String(error)}`;
      outputChannel.appendLine(`严重错误: ${errorMsg}`);
      vscode.window.showErrorMessage(`AI变量命名助手遇到错误: ${errorMsg}`);
    }
  });

  // 添加一个命令来显示调试输出面板
  let showOutputCommand = vscode.commands.registerCommand('ai-variable-namer.showDebugLogs', () => {
    outputChannel.show();
  });

  context.subscriptions.push(disposable, showOutputCommand);
}

export function deactivate() {
  outputChannel.appendLine('AI 变量命名助手已停用');
}