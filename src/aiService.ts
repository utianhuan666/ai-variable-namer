import * as vscode from 'vscode';
import axios from 'axios';

export interface NameSuggestion {
  name: string;
  reason?: string;
  explanation?: string;
}

export async function generateVariableName(
  text: string,
  context: string,
  language: string,
  namingStyle: string
): Promise<NameSuggestion[]> {
  // 获取 API 配置
  const config = vscode.workspace.getConfiguration('aiVariableNamer');
  const apiKey = config.get<string>('apiKey');
  const apiEndpoint = config.get<string>('apiEndpoint') || 'https://api.openai.com/v1/chat/completions';
  const model = config.get<string>('model') || 'gpt-3.5-turbo';

  if (!apiKey) {
    throw new Error('未配置 AI 服务 API 密钥，请在设置中配置');
  }

  try {
    // 构建 AI 提示
    const prompt = `
你是一个专业的编程助手，擅长为变量命名。请根据提供的文本和上下文，生成符合${language}语言习惯的${namingStyle}风格变量名。

文本: "${text}"

上下文代码:
\`\`\`${language}
${context}
\`\`\`

重要规则：
1. 必须生成英文变量名，不要使用中文或其他非英文字符
2. 变量名必须符合${namingStyle}命名风格
3. 变量名应该清晰表达变量的用途和含义
4. 避免使用过于通用的名称如data、info、value等
5. 根据上下文考虑合适的命名前缀或后缀

请提供3-5个高质量的变量名建议，每个建议包括:
1. 变量名
2. 简短的英文解释说明为什么这个名称合适

请以JSON格式返回，格式如下:
[
  {
    "name": "suggestedName1",
    "explanation": "Clear explanation in English why this name is appropriate"
  },
  {
    "name": "suggestedName2",
    "explanation": "Clear explanation in English why this name is appropriate"
  }
]

仅返回JSON格式数据，不要包含其他文本。
`;

    return await callAIService(prompt, apiEndpoint, apiKey, model);

  } catch (error: any) {
    console.error('AI 服务调用失败:', error);
    
    // 改进错误处理
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMsg = error.response?.data?.error?.message || 
                       error.response?.data?.message || 
                       error.message || 
                       '未知错误';
      
      throw new Error(`AI 服务返回错误 (${statusCode || 'N/A'}): ${errorMsg}`);
    }
    
    throw new Error(`调用AI服务时出错: ${error.message || '未知错误'}`);
  }
}

export async function generateMethodName(
  text: string,
  context: string,
  language: string,
  namingStyle: string
): Promise<NameSuggestion[]> {
  // 获取 API 配置
  const config = vscode.workspace.getConfiguration('aiVariableNamer');
  const apiKey = config.get<string>('apiKey');
  const apiEndpoint = config.get<string>('apiEndpoint') || 'https://api.openai.com/v1/chat/completions';
  const model = config.get<string>('model') || 'gpt-3.5-turbo';

  if (!apiKey) {
    throw new Error('未配置 AI 服务 API 密钥，请在设置中配置');
  }

  try {
    // 构建 AI 提示
    const prompt = `
你是一个专业的编程助手，擅长为方法/函数命名。请根据提供的文本和上下文，生成符合${language}语言习惯的${namingStyle}风格方法名。

文本: "${text}"

上下文代码:
\`\`\`${language}
${context}
\`\`\`

重要规则：
1. 必须生成英文方法名，不要使用中文或其他非英文字符
2. 方法名必须符合${namingStyle}命名风格
3. 方法名应该清晰表达函数的功能和目的
4. 方法名通常应以动词开头，表示执行的操作
5. 避免使用过于通用的名称如process、handle、doSomething等
6. 根据上下文考虑合适的动词前缀，如get、set、calculate、validate等

请提供3-5个高质量的方法名建议，每个建议包括:
1. 方法名
2. 简短的英文解释说明为什么这个名称合适

请以JSON格式返回，格式如下:
[
  {
    "name": "suggestedName1",
    "explanation": "Clear explanation in English why this name is appropriate"
  },
  {
    "name": "suggestedName2",
    "explanation": "Clear explanation in English why this name is appropriate"
  }
]

仅返回JSON格式数据，不要包含其他文本。
`;

    return await callAIService(prompt, apiEndpoint, apiKey, model);

  } catch (error: any) {
    console.error('AI 服务调用失败:', error);
    
    // 改进错误处理
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMsg = error.response?.data?.error?.message || 
                       error.response?.data?.message || 
                       error.message || 
                       '未知错误';
      
      throw new Error(`AI 服务返回错误 (${statusCode || 'N/A'}): ${errorMsg}`);
    }
    
    throw new Error(`调用AI服务时出错: ${error.message || '未知错误'}`);
  }
}

// 通用 AI 服务调用函数
async function callAIService(
  prompt: string, 
  apiEndpoint: string, 
  apiKey: string, 
  model: string
): Promise<NameSuggestion[]> {
  // 调用 AI API
  const response = await axios({
    method: 'post',
    url: apiEndpoint,
    data: {
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional programming assistant specializing in variable naming. Respond only with JSON format as specified, no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    },
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 设置30秒超时
  });

  // 解析 AI 响应
  const aiResponse = response.data.choices[0].message.content;
  return parseAIResponse(aiResponse);
}

// 解析 AI 响应，提取变量名建议
function parseAIResponse(response: string): NameSuggestion[] {
  try {
    // 尝试直接解析 JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // 如果直接解析失败，尝试提取格式化的建议列表
    const suggestions: NameSuggestion[] = [];
    const regex = /[0-9]+\.\s+[`'"]*([a-zA-Z0-9_]+)[`'"]*\s*[-–:]\s*(.*?)(?=\n[0-9]+\.|\n\n|$)/g;
    let match;

    while ((match = regex.exec(response)) !== null) {
      if (match[1] && match[2]) {
        suggestions.push({
          name: match[1],
          explanation: match[2].trim()
        });
      }
    }

    // 如果仍然没有找到，尝试提取任何看起来像变量名的内容
    if (suggestions.length === 0) {
      const nameRegex = /['"`]([a-zA-Z][a-zA-Z0-9_]+)['"`]/g;
      const uniqueNames = new Set<string>();

      while ((match = nameRegex.exec(response)) !== null) {
        const name = match[1];
        if (!uniqueNames.has(name)) {
          uniqueNames.add(name);
          suggestions.push({
            name: name,
            explanation: '推荐变量名'
          });
        }
      }
    }

    // 确保至少返回一个默认建议
    if (suggestions.length === 0) {
      suggestions.push({
        name: 'variableName', 
        explanation: '默认变量名 - AI未能提供有效建议'
      });
    }

    return suggestions;
  } catch (error) {
    console.error('解析 AI 响应失败:', error);
    // 返回至少一个默认建议，避免前端报错
    return [{
      name: 'variableName',
      explanation: '默认变量名 - 解析AI响应时出错'
    }];
  }
}