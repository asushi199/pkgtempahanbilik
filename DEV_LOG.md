# 编程日志 — Tempahan PKG Manjung

多 PKG 房间预约系统的开发记录与现阶段启用代码快照。
项目路径：`C:\CodexProject\tempahan-pkg-manjung` ｜ 仓库：https://github.com/asushi199/pkgtempahanbilik

---

## 一、项目概览

- **目的**：把原本只服务 PKG Pantai Remis 的单租户订房网站，扩展为支持 5 个 PKG 的多租户系统，且不动原有正在运行的网站。
- **5 个 PKG**：Sitiawan、Ayer Tawar、Seri Manjung、Beruas、Pantai Remis。
- **技术栈**：Next.js 14（App Router）+ TypeScript + Supabase（PostgreSQL + Storage）。
- **关键特性**：多租户动态路由、各 PKG 自助管理房间+照片、统一全局管理员、订房 WhatsApp 手动通知、现代浅色 UI、手机端底部导航 + 订房弹窗。

---

## 二、现阶段路由结构（启用中）

| 页面 | 路由 | 说明 |
|------|------|------|
| 总首页（列出所有 PKG） | `/` | 公开 |
| 全局管理员登录 / 选 PKG | `/admin` | 未登录显示登录；登录后显示 PKG 选择 |
| PKG 公共订房页 | `/[pkg]` | 公开；管理员登录后多 Admin 入口 |
| 查询预约 | `/[pkg]/semak` | 公开 |
| 预约审批列表 | `/[pkg]/admin` | 需全局登录 |
| 房间管理 | `/[pkg]/admin/rooms` | 需全局登录 |
| PKG 设置（WhatsApp / Logo） | `/[pkg]/admin/settings` | 需全局登录 |
| Token 审批页 | `/[pkg]/approve/[id]` | 凭 token + 密码 |
| 审批结果页 | `/[pkg]/approve/result` | — |

---

## 三、数据模型（Supabase，见 `supabase/schema.sql`）

- **`pkgs`**：`id`(slug) / `name` / `admin_password_hash`(已弃用) / `whatsapp_admin_phone` / `logo_src` / `active`
- **`rooms`**：`id` / `pkg_id` / `slug` / `name` / `short_name` / `category` / `image_src` / `active` / `sort_order`，`unique(pkg_id, slug)`
- **`bookings`**：`id` / `pkg_id` / `room_slug` / `date` / `slot`(am/pm/full_day) / 申请人字段 / `status`(pending/approved/rejected/cancelled) / `approval_token_hash` / 各时间戳
- **预留**：`items` / `item_rentals`（未来租借物品功能，暂未启用）
- **冲突触发器** `prevent_booking_conflict()`：插入/更新时，若同 `pkg_id` + 同 `room_slug` + 同 `date` 且时段重叠（full_day 挡 am/pm）已有 pending/approved，则报错。应用层 `booking-rules.ts` 也做一遍，双保险。
- **Storage**：公开 bucket `room-photos`，房间照片存 `{pkg_id}/{slug}-{ts}.ext`，logo 存 `logos/{pkg_id}-{ts}.ext`。
- 所有表启用 RLS；应用用 service role key 访问（绕过 RLS）。

---

## 四、认证模型（现阶段：单一全局管理员）

> 早期设计是“各 PKG 独立密码”，后改为**一个全局密码管全部 5 个 PKG**（更符合区办统一管理）。

- 密码 = 环境变量 **`ADMIN_PASSWORD`**（本地 `.env.local` 设为 `ustpmanjung`）。
- 会话 = 全局 cookie `pkg_admin`（path=`/`，HMAC-SHA256 签名，8 小时），见 `src/lib/admin-session.ts`。
- 登录流程：`/admin` 输密码 → `setAdminSession()` → 选 PKG → 进 `/[pkg]` 公共页。
- 公共页检测 `isAdminSession()`：为真则在**电脑顶栏**显示「Admin」链接、**手机底栏**显示第 5 个「Admin」标签；普通用户看不到。
- WhatsApp 审批链接页也校验全局 `ADMIN_PASSWORD`（`src/app/[pkg]/approve/actions.ts`）。

核心代码（`src/lib/pkg.ts`）：
```ts
export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(password), b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
```

会话核心（`src/lib/admin-session.ts`）：`isAdminSession()` / `setAdminSession()` / `clearAdminSession()`，无 pkgId 参数（全局）。

---

## 五、订房逻辑（启用中）

1. 用户在 `/[pkg]` 填表单（桌面内嵌 / 手机底部弹窗），提交到 `createBookingAction`（`src/app/[pkg]/actions.ts`）。
2. 校验字段 + `getConflictingBooking` 查冲突（pending/approved 占位，full_day 挡上午+下午）。
3. 通过 → 建预约 `status='pending'` + 生成一次性审批 token（hash 存库）。
4. 生成发往该 PKG `whatsapp_admin_phone` 的 WhatsApp 分享链接（含详情 + 审批链接），用户**手动**点按钮发送（不接 API）。
5. 审批两种方式：
   - **WhatsApp 链接 + 密码**：打开 `/[pkg]/approve/[id]?token=...` → 验 token → 输全局密码 → 批准/拒绝。
   - **后台**：登录后 `/[pkg]/admin` 列表直接点按钮（已登录免再输密码）。
6. 状态对日历影响：pending/approved 占位；rejected/cancelled 释放。
7. `/[pkg]/semak`：用电话查 pending 预约，可重生成 WhatsApp 链接。

冲突判定核心（`src/lib/booking-rules.ts`）：
```ts
export function slotsOverlap(existing: Slot, requested: Slot) {
  return existing === requested || existing === "full_day" || requested === "full_day";
}
```

---

## 六、现阶段启用代码地图

### `src/app/`（路由与服务端动作）
- `layout.tsx` — 根布局，引入 Inter 字体（无深色模式）
- `page.tsx` — 总首页，列出所有 PKG 卡片
- `admin/page.tsx` — **全局**登录页 / 登录后 PKG 选择页
- `admin/actions.ts` — 全局 `loginAction` / `logoutAction`
- `[pkg]/layout.tsx` — 校验 PKG 存在，否则 404
- `[pkg]/page.tsx` — 公共订房页（房间卡 + 日历 + 表单 + 手机底栏 + 管理员入口）
- `[pkg]/actions.ts` — `createBookingAction`
- `[pkg]/semak/{page,actions}.tsx` — 查询预约
- `[pkg]/admin/page.tsx` — 审批列表（全局守卫）
- `[pkg]/admin/actions.ts` — 审批/拒绝/取消/编辑 + `logoutAction`
- `[pkg]/admin/rooms/{page,actions}.tsx` — 房间增删改 + 照片上传
- `[pkg]/admin/settings/{page,actions}.tsx` — WhatsApp 号码 + Logo 上传
- `[pkg]/approve/[id]/page.tsx` + `approve/actions.ts` + `approve/result/page.tsx` — token 审批流
- `globals.css` — 全部样式（浅色 token、组件、手机底栏、订房弹窗、响应式）

### `src/components/`
- `BookingForm.tsx`（client）— 订房表单；手机端经 `#tempah` hash 弹出底部弹窗
- `CalendarBoard.tsx` — 日历网格
- `AdminBookingTable.tsx` — 审批列表（按年/月分组）
- `RoomManager.tsx` — 房间管理 + 上传
- `SemakForm.tsx`（client）— 电话查询
- `MobileTabBar.tsx` — 手机底部导航（Home/Jadual/Tempah/Semak[/Admin]）
- `AdminTopNav.tsx` — 管理页顶栏（logo→首页、Tukar PKG、Jadual）
- `AdminLoginForm.tsx`（client）— 全局登录表单

### `src/lib/`
- `types.ts` — Pkg / Room / Booking 等类型
- `supabase.ts` — service role 客户端
- `repository.ts` — 所有 DB 读写，**每个查询带 `pkg_id`**
- `pkg.ts` — `loadPkg` / `verifyAdminPassword`
- `admin-session.ts` — 全局会话 cookie
- `approval-token.ts` — 审批 token 生成/校验
- `booking-rules.ts` — 时段、冲突、状态、slug 生成
- `storage.ts` — Supabase Storage 上传（房间照片 / logo）
- `date.ts` / `phone.ts` / `whatsapp.ts` / `form.ts` / `app-url.ts` / `action-states.ts` / `admin-booking-groups.ts` — 工具

---

## 七、环境变量（`.env.local`，已 gitignore）

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ADMIN_PASSWORD=<全局管理员密码>          # 本地为 ustpmanjung
ADMIN_SESSION_SECRET=<64位随机串>        # 会话/token 签名，勿随意改
APP_BASE_URL=<部署网址，可选>
```

---

## 八、开发历程（按提交）

1. **`53acec8` 多 PKG 系统搭建** — 新文件夹建 Next.js+Supabase；schema（pkgs/rooms/bookings + 预留表）；动态 `[pkg]` 路由；lib 层全部带 pkg_id；房间自助管理 + 照片上传；首版「科技控制台」深浅双模式 UI。
2. **UI 改造 v2（高大上浅色版）** — 用户不满首版，参照其提供的参考图改为「友好蓝 + 留白 + 白色圆角卡片」；移除深色模式；引入 Inter。
3. **管理员设置页** — 新增 `/[pkg]/admin/settings` 填 WhatsApp；后改为各 PKG 自助上传 Logo（加 `logo_src` 列 + Storage）。
4. **品牌 Logo** — 导航/卡片显示 PKG 自己的 logo，缺省回退 `/ustp-manjung.png`。
5. **`c518969` 手机端底栏 + 订房弹窗** — 底部导航解放 header；订房表单在手机端改为底部上滑弹窗，先看到房间图+日历。
6. **`83801d4` 管理页顶栏** — admin 各页加可点 logo→首页的统一顶栏，解决“回不去首页”。
7. **`2255dad` 统一 admin（中间版）** — 移除公共 Admin 链接；登录后公共页显示「Mod Admin」工具栏。
8. **`dee8fe5`** — 手机端 admin 头部布局修正 + 冲突触发器加固。
9. **`e6efb8c` 全局 admin 重构（现阶段）** — 改为单一全局密码 `ADMIN_PASSWORD` + 全局会话；`/admin` 登录→选 PKG→进公共页，管理员入口整合进顶栏/底栏；去掉割裂的 Mod Admin 栏与 per-PKG 登录页；删废弃密码脚本。

---

## 九、部署与运维清单

- Supabase：跑 `supabase/schema.sql`；建公开 bucket `room-photos`。
- 线上（Vercel）环境变量：`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET`（与本地一致）、`APP_BASE_URL`。
- 各 PKG 的 WhatsApp 号码、Logo：登录后在 `/[pkg]/admin/settings` 自助填写。
- 注意：`ADMIN_SESSION_SECRET` 改了会使现有会话/审批 token 失效；本地不要在 dev server 运行时跑 `next build`（共用 `.next` 会冲突）。

---

## 十、待办 / 未启用

- `items` / `item_rentals` 表已建但功能未实现（未来「租借物品」）。
- 旧 `pkgs.admin_password_hash` 列闲置（全局密码后不再使用）。
- 可选增强：日历上直接审批、管理员隐蔽登录入口、WhatsApp API 自动推送。
