# AGENTS.md - Backend

# 《医院全科随访系统》后端协作规范

本文件定义后端特定规则，优先级高于根目录 AGENTS.md。

---

## Operating Procedures

1. **技术栈锁定**：永远只使用 Go (Gin) + GORM + MySQL，除非宪法发生变更。

---

## 一、目录结构

```
backend/
├── cmd/
│   └── server/           # 应用入口
│       └── main.go       # 加载配置，调用 injector 初始化 App 并启动
├── internal/
│   ├── injector/         # Wire 注入层 (新增)
│   │   ├── wire.go       # 依赖注入入口，定义各层的 ProviderSet
│   │   └── wire_gen.go   # Wire 自动生成的代码
│   ├── app/              # 应用核心 (新增)
│   │   └── app.go        # 定义 App 结构体，负责初始化 Gin、注册路由、启动/停止服务器
│   ├── config/           # 配置管理 (Viper/Env)
│   ├── handler/          # HTTP 处理器 (ProviderSet)
│   ├── service/          # 业务逻辑 (ProviderSet)
│   ├── repository/       # 数据库访问 (ProviderSet)
│   ├── model/            # 数据库物理模型 (GORM)
│   ├── schema/           # 数据协议层 (优化：整合 DTO/VO/Converter)
│   │   ├── dto/          # 请求 DTO
│   │   ├── vo/           # 响应 VO
│   │   └── converter/    # 实体转换工具
│   ├── middleware/       # 接口中间件 (Auth, Logger, Recovery)
│   ├── errors/           # 业务错误定义与错误码
│   └── pkg/              # 内部共享组件 (database, logger, redis)
├── configs/              # 配置文件 (yaml/toml)
├── pkg/                  # 公共工具类 (可被外部引用)
└── tests/                # 测试

```

---

## 二、分层架构

### 依赖方向（只能向内）

```
cmd → injector → app → handler → service → repository → model
                 ↓
               schema (dto/vo/converter)
```

### 各层职责

| 层         | 职责                                  | 禁止事项                               |
| ---------- | ------------------------------------- | -------------------------------------- |
| injector   | 依赖注入配置（Wire）                  | 编写任何业务逻辑                       |
| app        | 路由注册、服务器启动/停止、中间件挂载 | 直接操作数据库                         |
| handler    | 参数绑定、成功响应封装、调用 Service  | 业务逻辑、直接数据库操作、错误响应逻辑 |
| service    | 核心业务逻辑、**事务管理**            | 获取 Gin 上下文、直接 SQL              |
| repository | 数据库 CRUD (GORM) / 缓存访问 (Redis) | 业务逻辑                               |
| model      | 数据库表模型定义                      | 业务逻辑                               |
| schema     | DTO/VO 定义及转换逻辑                 | 包含数据库模型                         |

---

## 三、路由定义规范

### 每个 Handler 必须提供 `Register*Routes` 函数

```go
// internal/handler/patient.go
func RegisterPatientRoutes(r *gin.RouterGroup, h *PatientHandler) {
    patients := r.Group("/patients")
    {
        patients.GET("", h.FindAll)
        patients.POST("", h.Create)
        patients.GET("/:id", h.FindByID)
        patients.PUT("/:id", h.Update)
        patients.DELETE("/:id", h.Delete)
    }
}
```

### 路由分组规则

- **公开路由** (`/api`)：健康检查、认证端点（无需认证中间件）
- **受保护路由** (`/api` + `Auth()` 中间件）：所有其他业务模块

### 路由逻辑存放位置

- 所有路由注册逻辑必须实现在 `internal/app/app.go` 的 `registerRoutes` 方法中。
- `main.go` 仅负责加载配置并调用 `injector.BuildApp`。

### 路由注册示例 (app.go)

```go
func (a *App) registerRoutes() {
    public := a.router.Group("/api")
    {
        public.GET("/health", a.healthHandler.Check)
        handler.RegisterAuthRoutes(public, a.authHandler)
    }

    protected := a.router.Group("/api")
    protected.Use(middleware.Auth())
    {
        handler.RegisterPatientRoutes(protected, a.patientHandler)
        // ... 其他模块
    }
}
```

### 禁止事项

- 禁止在 `main.go` 中直接调用 `api.GET/POST/PUT/DELETE`
- 禁止跳过 `Register*Routes` 函数直接注册路由
- 禁止混合使用不同的路由定义模式

### 新增模块流程

1.  在 `internal/handler/` 创建 `XxxHandler` 结构体和方法
2.  添加 `RegisterXxxRoutes` 函数
3.  在对应的包（handler/service/repo）中将构造函数加入 `ProviderSet`
4.  在 `internal/app/app.go` 中添加 Handler 依赖并注册路由
5.  执行 `wire ./internal/injector` 重新生成注入代码

---

## 四、数据对象规范

### DTO (Data Transfer Object) - 请求

- 位置：`internal/schema/dto/`
- 用途：API 请求参数验证和反序列化

### VO (View Object) - 响应

- 位置：`internal/schema/vo/`
- 用途：API 响应数据封装
- JSON 标签必须使用 `camelCase`

### Model - 数据库模型

- 位置：`internal/model/`
- 用途：ORM 映射
- 必须嵌入 `model.Base` 或定义 `ID`、`CreatedAt`、`UpdatedAt`、`DeletedAt`

---

## 五、配置管理规范

1. **配置文件**：使用 YAML 格式，存放在 `backend/configs/` 目录下。
2. **环境覆盖**：统一使用 [Viper](https://github.com/spf13/viper) 库加载配置，支持 `config.yaml` 文件定义，并支持通过环境变量（前缀 `HCRM_`）动态覆盖。
3. **禁止 `.env`**：后端项目**严禁**使用 `.env` 或 `.env.example` 文件进行配置，所有配置模板应提供为 `configs/config.yaml.example`。
4. **加载逻辑**：配置加载代码应存放在 `internal/config/` 中，并在 `main.go` 启动时作为第一个环节执行。

---

## 六、事务管理规范

1.  **职责定义**：事务应由 `Service` 层发起，控制业务原子性。
2.  **闭包模式**：推荐使用 Repository 提供的 `Transaction` 方法。
3.  **Context 传递**：事务状态必须通过 `context.Context` 在 `Service` 和 `Repository` 之间传递。

```go
// Service 示例
func (s *PatientService) Create(ctx context.Context, req *dto.CreatePatientRequest) error {
    return s.repo.Transaction(ctx, func(txCtx context.Context) error {
        // 使用 txCtx 调用其他 Repository 方法
        return s.repo.Create(txCtx, patient)
    })
}
```

4.  **禁止事项**：
    - 禁止在 `Service` 层直接操作 `*gorm.DB`。
    - 禁止在 `Repository` 层显式 `Commit` 或 `Rollback`（由事务容器负责）。

---

## 七、错误处理规范

### 错误定义

- 位置：`internal/errors/`
- 使用自定义错误码

```go
var (
    ErrPatientNotFound = NewError(10001, "患者不存在")
    ErrPatientExists   = NewError(10002, "患者已存在")
)
```

### 错误处理逻辑 (强制)

1.  **Repository 层**：负责执行数据库操作，捕获 GORM/Redis 底层错误，包装为业务错误（或直接返回原始错误），并向上传递给 Service。
2.  **Service 层**：负责核心业务逻辑。如果校验或操作失败，返回对应的业务错误 (`internal/errors`)，向上传递给 Handler。
3.  **Handler 层**：
    - 仅负责参数绑定、权限预校验、调用 Service 及封装**成功**响应。
    - **禁止** 发生错误时在 Handler 中直接调用 `c.JSON` 返回错误码和消息。
    - **强制** 遇到错误时，必须调用 `c.Error(err)` 将错误记录到 Gin 上下文，随后直接 `return` 结束逻辑。
4.  **Middleware 层**：
    - 统一由 `ErrorHandler` 中间件在响应链路末端截获 `c.Errors`。
    - 根据错误类型（业务错误 `*errors.Error`、验证错误、系统 Panic 或原生 error）进行格式化，统一吐出标准 JSON 响应。

### 优势

- **关注点分离**：Handler 不再关心如何构造错误 JSON。
- **一致性**：整个项目的所有错误响应格式完全由中间件控制，绝无二致。
- **可维护性**：调整响应格式或状态码映射只需修改中间件一处。

---

## 八、命名规范

| 类型   | 规范                           | 示例                               |
| ------ | ------------------------------ | ---------------------------------- |
| 文件名 | 小写，下划线分隔               | `patient.go`、`operation_log.go`   |
| 结构体 | 大驼峰                         | `PatientHandler`、`UserService`    |
| 方法   | 大驼峰（导出）或小驼峰（私有） | `FindAll`、`getByID`               |
| 常量   | 大驼峰或全大写                 | `StatusActive`、`MAX_PAGE_SIZE`    |
| 接口   | 动词+er                        | `PatientRepository`、`AuthService` |

---

## 九、禁止事项

Agent 不得：

- 在 Handler 中编写业务逻辑
- 在 Service 中使用 `gin.Context`
- 直接在 Handler 中返回 Model
- 使用 `any` 或 `interface{}` 作为参数类型
- 跳过 DTO 直接绑定请求参数到 Model
- 业务层使用 `panic`
- 在 Handler 中直接调用 `c.JSON` 返回错误响应（必须使用 `c.Error(err)` 配合统一中间件）
- 手动在 `main.go` 中进行复杂的依赖初始化（必须使用 Wire）
- 提交 `wire_gen.go` 之外的手动注入代码
- 硬编码数据库连接字符串、密钥或任何环境相关的配置
- 在代码仓库中提交包含敏感信息的 `config.yaml`（必须使用 `.gitignore` 忽略）
- 使用 `.env.example` 或 `.env` 文件作为后端配置源

---

## 十、Wire 依赖注入规范

1.  **ProviderSet 导出**：每个分层包（handler, service, repository, pkg/database）必须导出 `ProviderSet` 变量。
2.  **构造函数命名**：统一使用 `NewXxx` (例如 `NewUserService`)。
3.  **注入入口**：统一在 `internal/injector/wire.go` 中通过 `wire.Build` 声明。
4.  **清理函数**：对于数据库连接等资源，构造函数应返回 `(T, func(), error)` 以便自动生成清理逻辑。

---

## 十一、测试规范

- 所有 `service` 层方法必须有单元测试
- 测试文件命名：`xxx_test.go`
- 测试函数命名：`TestXxx_MethodName`
- 使用 `testdata` 目录存放测试数据

---

## Active Technologies

- Go 1.25+
- Gin (HTTP)
- GORM (ORM)
- MySQL 8.0+
- Redis 7.0+
- Viper (配置)
- Zap (日志)
