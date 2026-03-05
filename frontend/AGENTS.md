# AGENTS.md - Frontend

# 《医院全科随访系统》前端协作规范

本文件定义前端特定规则，优先级高于根目录 AGENTS.md。

---

## Operating Procedures

1. **遵循宪法**：在生成任何代码前，必须强制读取并遵守 `@.specify/memory/constitution.md`。
2. **技术栈锁定**：永远只使用 React (TS) + Vite + Tailwind CSS + shadcn/ui，除非宪法发生变更。

---

## 一、目录结构

```
frontend/
├── src/
│   ├── components/       # 可复用 UI 组件
│   │   ├── ui/           # shadcn/ui 组件（自动生成）
│   │   └── common/       # 业务通用组件
│   ├── features/         # 按业务域划分的功能模块
│   │   ├── patients/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api.ts
│   │   │   └── types.ts
│   │   └── ...
│   ├── hooks/            # 全局自定义 Hooks
│   ├── lib/              # 工具函数、API 客户端
│   ├── store/            # Zustand 状态管理
│   ├── types/            # 全局 TypeScript 类型
│   └── App.tsx
├── public/
└── tests/
    └── unit/
```

---

## 二、组件规范

### 组件模式

- **统一使用函数组件和 Hooks**
- **禁止使用类组件**
- **组件文件使用 PascalCase 命名**：`PatientList.tsx`

### 组件结构

```tsx
// 1. 导入
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. 类型定义
interface PatientCardProps {
  patient: Patient;
  onEdit?: (id: string) => void;
}

// 3. 组件定义
export function PatientCard({ patient, onEdit }: PatientCardProps) {
  // Hooks 在顶部
  const [isExpanded, setIsExpanded] = useState(false);

  // 事件处理函数
  const handleClick = () => {
    onEdit?.(patient.id);
  };

  // JSX 返回
  return <div className="...">{/* ... */}</div>;
}
```

### 禁止事项

- 禁止在组件中直接使用 `fetch`/`axios`
- 禁止在 JSX 中定义内联函数（事件处理除外）
- 禁止使用 `any` 类型

---

## 三、数据获取规范

### React Query 使用

- **所有异步操作必须使用 React Query**
- **API 调用封装在 `api.ts` 文件中**

```tsx
// features/patients/api.ts
import { apiClient } from "@/lib/api";

export const patientApi = {
  getAll: () => apiClient.get<Patient[]>("/patients"),
  getById: (id: string) => apiClient.get<Patient>(`/patients/${id}`),
  create: (data: CreatePatientRequest) => apiClient.post("/patients", data),
};
```

```tsx
// features/patients/hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientApi } from "../api";

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: patientApi.getAll,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
```

---

## 四、状态管理规范

### Zustand 使用

- **全局状态使用 Zustand**
- **Store 文件放置在 `src/store/` 目录**

```tsx
// store/authStore.ts
import { create } from "zustand";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

---

## 五、类型定义规范

### 类型位置

- **模块类型**：`features/xxx/types.ts`
- **全局类型**：`src/types/`

### 命名规范

| 类型         | 命名                  | 示例                   |
| ------------ | --------------------- | ---------------------- |
| 实体类型     | PascalCase            | `Patient`、`Doctor`    |
| Props 类型   | 组件名 + Props        | `PatientCardProps`     |
| API 请求类型 | 动作 + 实体 + Request | `CreatePatientRequest` |
| API 响应类型 | 实体 + Response       | `PatientListResponse`  |

### 类型示例

```ts
// types.ts
export interface Patient {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  createdAt: string;
}

export interface CreatePatientRequest {
  name: string;
  phone: string;
  idCard: string;
}
```

---

## 六、样式规范

### Tailwind CSS

- **优先使用 Tailwind 类名**
- **复杂样式提取为 CSS 变量或组件**

```tsx
// 推荐
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">

// 避免
<div style={{ display: 'flex', alignItems: 'center' }}>
```

### shadcn/ui 组件

- **组件放置在 `src/components/ui/`**
- **使用 CLI 添加组件**：`npx shadcn-ui@latest add button`

---

## 七、API 响应格式

所有 API 响应遵循标准格式：

```typescript
interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}
```

API 客户端自动处理响应格式。

---

## 八、命名规范

| 类型      | 规范                 | 示例                       |
| --------- | -------------------- | -------------------------- |
| 组件文件  | PascalCase           | `PatientList.tsx`          |
| Hook 文件 | camelCase + use 前缀 | `usePatients.ts`           |
| API 文件  | camelCase            | `api.ts`                   |
| 类型文件  | camelCase            | `types.ts`                 |
| 组件名    | PascalCase           | `PatientCard`              |
| Hook 名   | use + PascalCase     | `usePatients`              |
| 变量/函数 | camelCase            | `patientList`、`fetchData` |
| 常量      | UPPER_SNAKE_CASE     | `API_BASE_URL`             |

---

## 九、禁止事项

Agent 不得：

- 使用类组件
- 在组件中直接调用 `fetch`/`axios`
- 使用 `any` 类型（除非有明确理由）
- 内联样式（除非动态计算）
- 硬编码 API URL
- 在前端实现业务规则（如权限判断）
- 直接操作 localStorage（使用封装的工具函数）

---

<!--
## 十、测试规范

- 使用 Vitest 编写单元测试
- 测试文件命名：`xxx.test.ts`、`xxx.test.tsx`
- 关键用户路径需有组件测试 -->

---

## Active Technologies

- React 18+
- TypeScript 5.3+（严格模式）
- Vite
- Tailwind CSS
- shadcn/ui
- React Query (TanStack Query)
- Zustand
- Vitest
