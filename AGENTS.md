# 医院全科随访系统 (Hospital CRM)

全科医疗随访管理系统，支持患者管理、随访记录、预约 scheduling 等功能。

## 技术栈

### 后端

- **语言**: Go 1.21+
- **框架**: Gin
- **数据库**: MySQL, Redis
- **ORM**: GORM
- **依赖注入**: Wire

### 前端

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **组件库**: shadcn/ui
- **状态管理**: Zustand
- **服务端状态**: React Query

## 项目结构

```
hcrm/
  backend/
| ├── cmd/
| │   └── server/           # 应用入口
| │       └── main.go       # 加载配置，调用 injector 初始化 App 并启动
| ├── internal/
| │   ├── injector/         # Wire 注入层 (新增)
| │   │   ├── wire.go       # 依赖注入入口，定义各层的 ProviderSet
| │   │   └── wire_gen.go   # Wire 自动生成的代码
| │   ├── app/              # 应用核心 (新增)
| │   │   └── app.go        # 定义 App 结构体，负责初始化 Gin、注册路由、启动/停止服务器
| │   ├── config/           # 配置管理 (Viper/Env)
| │   ├── handler/          # HTTP 处理器 (ProviderSet)
| │   ├── service/          # 业务逻辑 (ProviderSet)
| │   ├── repository/       # 数据库访问 (ProviderSet)
| │   ├── model/            # 数据库物理模型 (GORM)
| │   ├── schema/           # 数据协议层 (优化：整合 DTO/VO/Converter)
| │   │   ├── dto/          # 请求 DTO
| │   │   ├── vo/           # 响应 VO
| │   │   └── converter/    # 实体转换工具
| │   ├── middleware/       # 接口中间件 (Auth, Logger, Recovery)
| │   ├── errors/           # 业务错误定义与错误码
| │   └── pkg/              # 内部共享组件 (database, logger, redis)
| ├── configs/              # 配置文件 (yaml)
| ├── pkg/                  # 公共工具类 (可被外部引用)
| └── tests/                # 测试
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── features/       # 业务功能模块
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── lib/            # 工具函数
│   │   └── types/          # TypeScript 类型
│   └── tests/unit/         # 单元测试
└── docs/                   # 文档
```

## 快速开始

### 后端

```bash
cd backend
cp configs/config.yaml.example configs/config.yaml
# 编辑 configs/config.yaml 配置数据库等，或使用环境变量覆盖
go mod download
go run cmd/server/main.go
```

### 前端

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## 开发规范

### 核心原则

1. **前后端联调**: 任何功能开发必须前后端同步进行，禁止孤立开发
2. **整洁架构**: 后端严格分层，依赖向内
3. **组件化前端**: React 函数组件 + Hooks
4. **验证驱动**: 复杂逻辑必须测试
5. **安全第一**: 禁止硬编码密钥
6. **类型一致**: 前后端字段命名统一 camelCase

### 前后端联调规范

开发任何功能时，必须遵循以下联调流程：

#### 1. 接口先行

- 后端定义 API 接口后，必须立即同步更新前端的 API 类型定义
- 使用 TypeScript 类型确保前后端数据结构一致
- API 变更必须同步更新前端调用代码

#### 2. 联调检查清单

每完成一个功能模块，必须验证：

- [ ] 后端 API 已通过 Postman/curl 测试
- [ ] 前端 TypeScript 类型与后端响应结构匹配
- [ ] 前端已成功调用后端 API 并处理响应
- [ ] 错误场景已测试（如 401、403、500 等）
- [ ] 边界情况已处理（空数据、分页、加载状态）

#### 3. 禁止行为

- ❌ 禁止只完成后端不测试前端调用
- ❌ 禁止只完成前端使用 mock 数据不上联调
- ❌ 禁止后端 API 变更不通知前端
- ❌ 禁止前后端类型定义不一致

#### 4. 联调顺序建议

```
1. 定义数据模型 (后端 model + 前端 types)
         ↓
2. 实现 API 接口 (后端 handler)
         ↓
3. 编写 API 测试用例
         ↓
4. 前端实现 API 调用层
         ↓
5. 前端实现 UI 组件
         ↓
6. 端到端联调验证
         ↓
7. 清理临时代码 (mock 数据、调试代码)
```

#### 5. 类型同步约定

- 后端 Go struct 字段使用 json tag 明确命名
- 前端 TypeScript 类型必须与后端 json tag 保持一致
- 建议使用工具自动生成前端类型（如 openapi-generator）

## API 规范

所有 API 响应遵循统一格式：

```json
{
  "code": 200,
  "data": {},
  "msg": "success"
}
```

## 许可证

Proprietary
