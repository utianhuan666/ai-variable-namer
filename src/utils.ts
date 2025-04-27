/**
 * 将文本转换为指定的命名风格
 * @param text 原始文本
 * @param style 命名风格
 * @returns 转换后的变量名
 */
export function formatVariableName(text: string, style: string): string {
    // 首先将文本转换为单词数组
    const words = text
      .trim()
      .replace(/[^\w\s\-_]/g, '') // 移除特殊字符
      .split(/[\s\-_]+/) // 按空格、连字符或下划线分割
      .filter(word => word.length > 0); // 过滤空字符串
    
    if (words.length === 0) {
      return '';
    }
    
    switch (style) {
      case 'camelCase':
        return words[0].toLowerCase() + 
          words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      
      case 'snake_case':
        return words.map(w => w.toLowerCase()).join('_');
      
      case 'PascalCase':
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      
      case 'kebab-case':
        return words.map(w => w.toLowerCase()).join('-');
      
      default:
        return words.join('');
    }
  }
  
  /**
   * 检测文本可能的编程语言上下文
   * @param text 代码上下文
   * @returns 推测的编程语言
   */
  export function detectLanguageContext(text: string): string {
    // 简单的语言检测逻辑
    if (text.includes('function') && (text.includes('{') || text.includes('=>'))) {
      return 'javascript';
    }
    if (text.includes('def ') && text.includes(':')) {
      return 'python';
    }
    if (text.includes('public class') || text.includes('private void')) {
      return 'java';
    }
    if (text.includes('func ') && text.includes('()')) {
      return 'go';
    }
    
    // 默认返回 javascript
    return 'javascript';
  }
  
  /**
   * 获取编程语言的常用变量前缀
   * @param type 变量类型
   * @param language 编程语言
   * @returns 推荐的前缀
   */
  export function getVariablePrefix(type: string, language: string): string {
    if (language === 'javascript' || language === 'typescript') {
      if (type === 'boolean') return 'is';
      if (type === 'array') return '';
      if (type === 'function') return '';
    }
    
    if (language === 'csharp' || language === 'java') {
      if (type === 'interface') return 'I';
    }
    
    return '';
  }