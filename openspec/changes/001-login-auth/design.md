## Context

HCRM 系统目前没有用户认证层。我们需要从头开始，为前端 (React) 和后端 (Go) 建立安全规范，并深度绑定现有的 RBAC 模型与业务档案。

## Goals / Non-Goals

**Goals:**

1. 实现安全的密码存储 (bcrypt) 与双令牌 (JWT) 机制。
2. **权限感知**：登录响应集成 Roles 和 Permissions。
3. **业务感知**：自动关联 `DoctorID` 简化前端业务调用。
4. **防暴破**：基于 Redis 的登录失败锁定机制。
5. **动态 UI**：实现 Premium 级“极简白” (Modern White) 及动效。

**Non-Goals:**

1. 第三方登录 (SSO/OAuth2) 暂不实现。
2. 复杂的权限编辑 UI（本阶段仅实现登录权限获取）。

## Decisions

1. **认证驱动**: AccessToken (短效) 存内存，RefreshToken (长效) 存 HttpOnly Cookie。
2. **RBAC 绑定**: 登录 Service 需 `Preload` 用户的角色及权限，将其扁平化为字符串数组下发。
3. **业务联动**:
   - 登录接口查询 `doctors` 表，若存在则返回 `doctorId`。
   - **自动禁用**: 若 `Doctor.Status` 为离职，登录流程应拒绝该用户并返回 403。
4. **登录保护**: 使用 Redis 记录 `${username}:fail_count`。5 分钟内失败 5 次则锁定 15 分钟。
5. **审计机制**: 异步调用 `OperationLog` 服务记录登录结果。
6. **前端 UI 规范**:
   - **基调**: 医疗蓝 (#0056D2) + 冰点白 (#FBFDFF)。
   - **效果**: 登录卡片模糊背景 (Backdrop Filter)、按钮呼吸动效、输入框聚焦阴影。

## Risks / Trade-offs

1. **Redis 依赖**: 若 Redis 宕机，登录锁定功能将失效（需回退至允许登录但不限频，保证可用性）。
2. **Token 体积**: 若权限过多，AccessToken 载荷会变大，需控制扁平化深度。
