# 积分扣除功能测试指南

## 🔍 问题诊断

### 可能的原因

1. **网络请求失败**：积分扣除API调用失败
2. **API响应错误**：服务器返回错误状态
3. **数据库事务失败**：积分扣除过程中数据库操作失败
4. **用户权限问题**：用户未登录或会话过期

## 🧪 测试步骤

### 1. 检查控制台日志

在音频总结完成后，查看浏览器控制台是否有以下日志：

```
开始扣除积分: {
  requiredPoints: 90,
  audioDuration: 273.168,
  selectedLanguage: 'zh',
  userPoints: 1000
}

积分扣除API响应状态: 200

积分扣除结果: {
  success: true,
  data: {
    deductedPoints: 90,
    remainingPoints: 910
  }
}

积分扣除成功: {
  deductedPoints: 90,
  remainingPoints: 910
}
```

### 2. 检查网络请求

在浏览器开发者工具的Network标签中查看：

- **请求URL**: `/api/user/points/deduct`
- **请求方法**: POST
- **响应状态**: 应该是200
- **响应内容**: 应该包含success: true

### 3. 检查数据库记录

查看数据库中的积分变化：

- **users表**: 用户的points字段应该减少
- **points_history表**: 应该有新的扣除记录

## 🔧 修复内容

### 1. 增强日志记录

```typescript
console.log('开始扣除积分:', {
  requiredPoints,
  audioDuration,
  selectedLanguage,
  userPoints
})
```

### 2. 改进错误处理

```typescript
if (!deductResponse.ok) {
  const errorText = await deductResponse.text()
  console.error('积分扣除API失败:', deductResponse.status, errorText)
  throw new Error(`积分扣除API失败: ${deductResponse.status}`)
}
```

### 3. 添加用户提示

**成功提示**:
```
积分扣除成功
已扣除 90 积分，剩余 910 积分
```

**失败提示**:
```
积分扣除失败
积分扣除失败，但总结已完成。请联系客服处理。
```

## 🎯 测试场景

### 场景1：正常扣除
- **前置条件**: 用户有足够积分
- **预期结果**: 积分正常扣除，显示成功提示

### 场景2：积分不足
- **前置条件**: 用户积分不足
- **预期结果**: 在开始处理前就提示积分不足

### 场景3：网络错误
- **前置条件**: 网络连接问题
- **预期结果**: 显示积分扣除失败提示

### 场景4：服务器错误
- **前置条件**: 服务器内部错误
- **预期结果**: 显示积分扣除失败提示

## 📊 监控指标

### 关键日志
- 积分扣除开始日志
- API响应状态日志
- 积分扣除结果日志
- 错误异常日志

### 用户体验
- 积分数量实时更新
- 成功/失败提示显示
- 错误处理用户友好

## 🚀 下一步测试

1. **上传音频文件**
2. **完成音频总结**
3. **观察控制台日志**
4. **检查积分是否正确扣除**
5. **验证用户提示是否显示**

如果积分仍然没有扣除，请提供控制台的完整日志信息，以便进一步诊断问题。
