const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 从后端获取 Swagger 文档
async function getSwaggerDocs() {
  try {
    const response = await axios.get('http://localhost:8000/swagger/?format=json');
    return response.data;
  } catch (error) {
    console.error('获取 Swagger 文档失败:', error);
    return null;
  }
}

// 生成前端 API 类型定义
async function generateApiTypes(swaggerDocs) {
  if (!swaggerDocs) return;

  const types = [];
  const paths = swaggerDocs.paths;

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods)) {
      const operationId = details.operationId;
      const parameters = details.parameters || [];
      const responses = details.responses;

      // 生成接口类型定义
      const type = `
export interface ${operationId}Request {
  ${parameters.map(param => `${param.name}: ${param.type}`).join('\n  ')}
}

export interface ${operationId}Response {
  ${Object.entries(responses).map(([code, response]) => 
    `status${code}: ${response.schema ? response.schema.type : 'any'}`
  ).join('\n  ')}
}
`;
      types.push(type);
    }
  }

  // 写入类型定义文件
  const typesPath = path.join(__dirname, '../frontend/src/types/api.d.ts');
  fs.writeFileSync(typesPath, types.join('\n'));
}

// 主函数
async function main() {
  const swaggerDocs = await getSwaggerDocs();
  await generateApiTypes(swaggerDocs);
}

main().catch(console.error); 