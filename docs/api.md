# API 接口文档

## 组织管理接口

### 获取组织列表

```http
GET /api/v1/organizations/

响应示例：
{
    "code": 200,
    "data": [
        {
            "id": 1,
            "name": "测试组织",
            "description": "这是一个测试组织",
            "created_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

### 创建组织

```http
POST /api/v1/organizations/

请求体：
{
    "name": "新组织",
    "description": "组织描述"
}

响应示例：
{
    "code": 200,
    "data": {
        "id": 2,
        "name": "新组织",
        "description": "组织描述",
        "created_at": "2024-01-02T00:00:00Z"
    }
}
```

## 用户管理接口

### 获取用户信息

```http
GET /api/v1/users/profile/

响应示例：
{
    "code": 200,
    "data": {
        "id": 1,
        "username": "test_user",
        "email": "test@example.com",
        "organizations": [
            {
                "id": 1,
                "name": "测试组织"
            }
        ]
    }
}
```

### 更新用户信息

```http
PUT /api/v1/users/profile/

请求体：
{
    "email": "new_email@example.com",
    "password": "new_password"
}

响应示例：
{
    "code": 200,
    "message": "用户信息更新成功"
}
``` 