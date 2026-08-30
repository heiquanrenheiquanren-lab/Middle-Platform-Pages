# 电商平台官方 API 对接申请指南

> **重要定位：我们是「自用」，不是「产品化给其他卖家用」。** 所有申请按「自用 / 卖家自研」方向走，不做对外 Appstore / ISV 产品化上架。
>
> 背景：当前中台通过领星 ERP、易仓 ERP 的接口拉取订单，存在数据不齐的问题。后续计划自研 ERP，直接对接各电商平台官方接口。本文档梳理 Shopee、Amazon、eBay、Shopify 官方开放平台的申请流程与多店铺授权机制，供后续开发落地参考。
>
> 说明：文中结论均来自各平台官方开发者文档，关键处已标注来源链接；官方流程可能调整，落地前请以链接指向的最新文档为准。**每个平台均包含「审核时长」小节，便于排期评估；后续新增平台也会补齐审核时长。**

---

## 第一部分：Shopee 官方 API

### 一、总体结论（先看这个）

1. Shopee 官方接口通过 **Shopee Open Platform**（`https://open.shopee.com`）申请。
2. 申请核心是「**注册开发者 → 选开发者类型并提交资料审核 → 创建 App 拿 Partner ID/Key → 授权店铺拿 token → 调接口**」。
3. **多店铺可以拉，不需要每个店铺单独申请一遍**：一个 App（一份 Partner ID/Key）即可，靠「授权多个店铺 + 用 shop_id 区分」实现。
4. 关键限制：access_token 有效期仅 **4 小时**，需定期刷新（refresh token 有效期 30 天）。

### 二、申请流程（4 步）

#### 第 1 步：注册开发者账号

1. 访问 `https://open.shopee.com`，点击 Sign up。
2. 用邮箱注册 → 收到验证邮件 → 点击验证 → 设置密码（6-16 位，含数字/字母/符号）。
3. 注意：**邮箱一旦注册不可更改**。

#### 第 2 步：选择开发者类型并提交资料审核（最关键，类型不可改）

开发者类型分 4 种，**决定你能用哪些接口权限**，提交后不可修改，需根据业务想清楚：

| 开发者类型 | 适用场景 | 可创建的 App 类型 |
|---|---|---|
| **企业卖家自研**（Enterprise Seller） | 是 Shopee 卖家 + 有营业执照，自研 ERP 给自己用 | 卖家自研类 App |
| **个人卖家自研**（Individual Seller） | 是 Shopee 卖家 + 个人身份自研 | 卖家自研类 App |
| **企业第三方服务商**（ISV / Enterprise 3rd Party） | 不是卖家，做软件给**别的卖家**用 | ERP System App（接口权限最全） |
| 个人第三方开发者（Individual 3rd Party） | 个人身份做软件服务 | 第三方类 App |

> **选择建议（我们是自用）**：选「**卖家自研**」——有营业执照选「企业卖家自研（Enterprise Seller）」，个人身份选「个人卖家自研（Individual Seller）」。不要选 ISV。

提交资料需准备：
- 公司名、营业执照号、营业执照图片（jpg/jpeg）、地址、电话、邮编、国家/地区。
- 若是卖家，还需填写 Shopee 店铺 ID（shopid）和招商经理邮箱（`@shopee.com` 结尾，没有可留空）。

> shopid 查询方式：卖家中心 → 我的商品 → 任意商品详情页 → 点击 Visual effect → 新页面地址栏中的 `shopid` 即店铺 ID。

#### 审核时长

- **卖家自研（我们是自用）**：官方口径因站点而异，泰国站官方指南写 **3-5 个工作日**，越南站官方文档写 **7 个工作日**（均不含周末节假日）。建议按 **3-7 个工作日**预留。
- **ISV 第三方**：泰国站 10-12 个工作日，越南站 14 个工作日。
- 来源：
  - 泰国站官方开发者指南（2022.07）：https://deo.shopeemobile.com/shopee/cms_cdn_bucket/ecb708f5284142ceb68be4a84f6cf5a4_TH_SEH_Open%20API_Developer%20Guide_v2.1_20220722.pdf
  - 越南站官方教育文档（2026.05）：https://banhang.shopee.vn/edu/article/8450

#### 第 3 步：资料审核通过后创建 App

1. 审核通过后，进入 Console → App List → Create App。
2. 填写 App 资料并提交，创建后获得两个关键凭证：
   - **Partner ID**（合作伙伴 ID）
   - **Partner Key**（签名密钥，用于 SHA256 签名）

#### 第 4 步：授权店铺 + 调用接口

1. 用 Partner ID/Key 生成授权链接，发给卖家（或自己）登录授权。
2. 授权成功后获得 **access_token + shop_id**。
3. 之后即可用这些凭证调用 Shopee Open API。

### 三、多店铺能不能一次拉？（能）

#### 授权机制

| 授权账号类型 | 能授权的范围 |
|---|---|
| **主账号（Main account）** | 可一次授权名下**多个店铺/多个商家** |
| 店铺账号（Shop account） | 只能授权**单个店铺** |

#### 数据区分方式

授权后，**每个店铺会得到一个独立的 `shop_id` 和 `access_token`**，调用接口时用 `shop_id` 区分是哪个店铺的数据。

> 结论：一个 App 就够了，多店铺通过「授权多个 shop + 用 shop_id 区分」实现，不需要每个店铺单独申请一遍。

#### 需要注意的限制

1. **access_token 有效期 4 小时**，需定期刷新（refresh token 有效期 30 天）。
2. 一个店铺一般只能授权到一个 App，重复授权需先到原应用解绑。
3. 授权时若同时存在主账号/店铺账号登录入口，注意**不要误点 Switch to Main account**（针对仅需授权单店的情况）。

### 四、接口调用要点（开发侧参考）

#### API 域名

- 生产环境（中国内地部署）：`https://openplatform.shopee.cn/`
- 生产环境（SG 部署）：`https://partner.shopeemobile.com/`
- 沙箱环境：`https://openplatform.sandbox.test-stable.shopee.cn/`

#### 请求参数（公共参数）

| 参数 | 说明 |
|---|---|
| partner_id | 合作伙伴 ID，创建 App 后获得 |
| timestamp | 时间戳，需在 5 分钟内 |
| sign | SHA256 签名 |
| access_token | 访问令牌，有效期 4 小时 |
| shop_id | 店铺 ID，授权后获得 |
| merchant_id | 商家 ID（仅跨境卖家使用 Merchant API） |

#### 接口类型

- **Shop API**：partner_id + timestamp + sign + access_token + shop_id（拉店铺订单、商品等）
- **Merchant API**：partner_id + timestamp + sign + access_token + merchant_id（仅跨境卖家）
- **Public API**：partner_id + timestamp + sign（无需 token）

> 拉订单用 Shop API，即需要 access_token + shop_id，因此必须完成店铺授权后才能拉取订单数据。

#### 参考来源（Shopee）

- 开放平台介绍：https://open.shopee.com/developer-guide/4
- 开发者类型与注册：https://open.shopee.com/developer-guide/12
- API 调用（域名/参数/签名）：https://open.shopee.com/developer-guide/16
- 授权与认证（多店铺/token）：https://open.shopee.com/developer-guide/20
- OpenAPI 2.0 概述（授权账号类型）：https://open.shopee.com/documents/v2/

---

## 第二部分：Amazon 官方 API

> Amazon 的官方接口叫 **Selling Partner API（SP-API）**，是 REST 风格的 API，帮助卖家/供应商以程序化方式访问订单、发货、付款等数据。它取代了旧的 MWS（Marketplace Web Service）。

### 一、总体结论（先看这个）

1. Amazon 官方接口通过 **SP-API** 申请，入口在卖家中心（Seller Central）或开发者门户 `https://developer.amazonservices.com/`。
2. 申请核心是「**注册为开发者 → 创建开发者资料 → 注册应用 → 授权（拿 token）→ 调接口**」。
3. **一个 App 可以授权多个卖家账号**：每个卖家账号做一次 OAuth 授权，获得独立的 refresh token，用 `selling_partner_id` 区分。
4. 关键限制：LWA access_token 有效期仅 **1 小时**，需用 refresh token 定期刷新。

### 一之补充：为什么 Amazon 相对复杂（相比其他三个平台）

一句话定位：**Amazon 复杂不在「填表」，而在「权限要按 Role（角色）一个一个申请、一个一个审核」，且有些角色还要过三道审查。** 别的平台是"建好应用基本就通"，Amazon 是"你每要拉一类数据，都得单独证明你有资格拉"。

| 复杂点 | 具体表现 | 与其他平台的对比 |
|---|---|---|
| **Role（角色）机制**（最核心，其他平台没有） | 必须申请并符合某个 Role 的资格，才能访问该 Role 下的接口；不能建好 App 就随便调 | Shopee 按 App 类型、eBay/Shopify 按 OAuth scope 控制权限，建好即可用 |
| **审核时间长且分层** | 标准角色约 1-2 周，受限角色更久，实际可能 2-4 周 | Shopify 自用无需审核、eBay 约 1 个工作日、Shopee 3-7 个工作日，Amazon 最慢 |
| **受限角色三道审查** | 涉及客户个人信息（PII）的角色要过「业务审查 → 安全审查 → 技术审查」 | 其他平台无此类多阶段审查 |
| **开发者资料需评估** | 提交后 Amazon 会评估，某些情况要求补充资料 | 其他平台多为注册即过 |
| **多店铺逐个授权** | 每个卖家账号分别授权一次，维护「多个 refresh token + selling_partner_id」 | Shopee 主账号可一次授权名下多店，更省事 |
| **token 有效期最短** | access_token 仅 1 小时，需频繁刷新 | Shopee 4 小时、eBay 2 小时、Shopify 24 小时 |

**落地建议**：排期上给 Amazon 预留最长（按 2-4 周规划），且开发前第一步先确认「拉订单需要申请哪几个 Role、是否涉及受限角色（PII）」，这一步不定，后续申请与排期都是空的。拉订单若只取普通订单数据，尽量避开受限角色，可明显缩短审查时间。

### 二、应用类型（决定你的角色，先想清楚）

Amazon 把开发者应用分为 **3 种类型**，与 Shopee 的「自用 vs 产品化」是同一道选择题：

| 应用类型 | 适用场景 | 授权方式 |
|---|---|---|
| **私人卖家应用**（Private seller application） | 只给自己组织/自己店铺用，自研 ERP | 自助授权（self-authorized） |
| **公开应用**（Public application） | 做产品给**别的卖家**用 | 由卖家通过 OAuth 授权，需上架 Selling Partner Appstore |
| **私人供应商应用**（Private vendor application） | 只给自己组织的供应商业务用 | 自助授权（self-authorized） |

> **选择建议（我们是自用）**：选「**私人卖家应用（Private seller application）**」，流程最简单。不要选公开应用。

### 三、申请流程（以「私人卖家应用」自研自用为例）

> Amazon 官方把接入流程拆成 10 步（见参考来源「销售伙伴 API 接入概述」），这里提炼成自研自用最关键的几步。

#### 第 1 步：准备专业卖家账号

- 需要一个 **Amazon 专业销售账号（Professional selling account）**。
- 从卖家中心（Seller Central）进入。

#### 第 2 步：进入开发者入口

- 卖家中心主菜单 → **Apps and Services → Develop Apps**。

#### 第 3 步：创建开发者资料（Developer Profile）

- 在 Developer Central 点击 Proceed to Developer Profile。
- 填写组织的联系方式、需要访问的数据类型、安全与使用信息。
- 提交后 Amazon 会评估，某些情况会要求补充资料。

#### 审核时长

- **标准（非受限）角色**（私人卖家应用通常属于此类）：官方文档写 **约 1-2 周**完成审查。
- **受限角色**（涉及客户 PII 的接口）：三阶段审查（业务审查 → 安全审查 → 技术审查），**时间更久**。
- 补充参考：Amazon 卖家论坛官方版主回复，私人开发者应用实际可能 **2-4 周**，建议按 **1-2 周起、最长 4 周**规划。
- 来源：
  - 官方文档「步骤 3：创建开发者资料」：https://developer-docs.amazon.com/sp-api/docs/onboarding-step-3-create-a-developer-profile

#### 第 4 步：注册应用（Register Application）

- 注册为私人开发者后，注册你的 SP-API 应用。
- 注册时 Amazon 会提供后续授权所需的 `client_id` / `client_secret`（OAuth 凭证）。

#### 第 5 步：授权（自助授权 self-authorize）

- 私人卖家应用支持「自助授权」：你自己登录卖家账号授权自己的应用，拿到 **refresh token**。
- 授权基于 **Login with Amazon（LWA）**，即 Amazon 的 OAuth 2.0 实现。

#### 第 6 步：连接 SP-API 调接口

- 运行时用 refresh token 换 LWA access token，再用它调用 SP-API。

### 四、多店铺能不能一次拉？（能，但机制和 Shopee 不同）

#### 授权机制

Amazon 的授权是**按卖家账号逐个授权**（OAuth 2.0）：

- 一个 SP-API **App 可以承载多个卖家账号的授权**。
- 每个卖家账号做一次授权，获得**独立的 refresh token**。
- 私人卖家应用支持「自助授权」，可给自己组织下的多个店铺分别授权。

#### 数据区分方式

- 授权后每个卖家会有一个 **`selling_partner_id`**。
- 调用时用各自的 refresh token 换 access token，用 `selling_partner_id` 区分不同卖家。

> 结论：一个 App 可以对接多个店铺，但**不是像 Shopee 那样用主账号一次授权多个店**，而是**每个卖家账号分别授权一次**，系统里维护「多个 refresh token + 对应 selling_partner_id」。

#### 需要注意的限制

1. **LWA access_token 有效期 1 小时**，需用 refresh token 定期刷新。
2. refresh token 需安全存储、长期复用（具体有效期与撤销规则以官方文档为准）。
3. **公开应用**（给别家卖家）需上架 Selling Partner Appstore，且受限 role 需通过架构审查，涉及客户 PII（个人身份信息）需详细说明用途。

### 五、接口调用要点（开发侧参考）

#### 连接流程（Connect to SP-API）

1. 用 client 凭证 + refresh token 请求 LWA，换取 access token（1 小时有效）。
2. 用 access token 调用 SP-API。

#### 授权工作流（Website Authorization Workflow，公开应用用）

- 卖家在你的网站点「Authorize」→ 登录 Amazon 授权 → Amazon 回调返回授权码 → 你的应用用授权码换 refresh token → 安全存储 refresh token → 运行时换 access token 调接口。

#### Role（角色）机制（关键差异）

Amazon 与 Shopee 不同，**权限通过「Role（角色）」管理**：

- 一个 role 决定开发者/应用是否有权访问某类操作或资源。
- **必须申请并符合某个 role 的资格，才能访问该 role 下的接口**（例如拉订单需要对应的订单 role）。

> 这意味着落地时要先确认「拉订单」需要申请哪些 role，而不是建好 App 就能随便调。

#### 参考来源（Amazon）

- SP-API 介绍与 App 类型：https://developer.amazonservices.com/
- SP-API 官方文档首页：https://developer-docs.amazon.com/sp-api/docs/welcome
- 销售伙伴 API 接入概述（10 步）：https://developer-docs.amazon.com/sp-api/docs/selling-partner-api-onboarding-overview
- 注册为私人开发者：https://developer-docs.amazon.com/sp-api/docs/register-as-a-private-developer
- 公开开发者入门：https://developer.amazonservices.com/getting-started-guide
- 连接 SP-API（token 1 小时）：https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api
- 网站授权工作流：https://developer-docs.amazon.com/sp-api/docs/website-authorization-workflow
- Role 机制：https://developer-docs.amazon.com/sp-api/docs/roles-in-the-selling-partner-api
- SP-API 注册入口（中文）：https://sell.amazon.com/cn/developers

---

## 第三部分：eBay 官方 API

> eBay 的官方开放平台是 **eBay Developers Program**，入口 `https://developer.ebay.com/`（新版开发者文档门户 `https://www.edp.ebay.com/`）。**注意：不是 `developer.amazonservices.com`，那是 Amazon 的地址。**

### 一、总体结论（先看这个）

1. eBay 官方接口通过 **eBay Developers Program** 申请，入口 `https://developer.ebay.com/`。
2. **免费加入**，加入后默认每天 5000 次 API call，账号审核约 1 个工作日。
3. 申请核心是「**注册开发者账号 → 创建 Application Keys → OAuth 授权（拿 token）→ 调接口**」。
4. 关键限制：User access token 有效期仅 **2 小时**，需用 refresh token 定期刷新（refresh token 有效期 **18 个月**）。

### 二、申请流程

#### 第 1 步：加入 eBay Developers Program（免费）

1. 访问 `https://developer.ebay.com/`，点击 Sign up / Join 注册开发者账号。
2. 官方建议**使用企业邮箱**注册开发者账号。
3. 填写注册表单 → 验证邮箱 → 阅读并接受《eBay API License Agreement》→ 验证非机器人 → 提交。
4. **约 1 个工作日**完成账号审批。

#### 审核时长

- **开发者账号审批**：官方文档写 **约 1 个工作日**（"approximately 1 business day"）。
- **生产环境应用认证（Compatible Application Check）**：上线前需单独申请，通常要**提前 2-4 周**申请，eBay 审核通过后才能正式上线。
- 来源：
  - 官方「Get started with eBay APIs」：https://www.edp.ebay.com/develop/guides-v2/get-started-with-ebay-apis
  - eBay 中文快速入门（提及上线前 2-4 周提请认证，3-10 个工作日）：https://www.ebay.cn/newcms/Home/d_devdocs/1712

#### 第 2 步：创建 Application Keys（应用凭证）

1. 登录开发者门户，进入 **Your Account → Application Keys（或 My Account → Keys）**。
2. 点击「Add a new application」创建应用，填写应用名称、应用类型、描述等。
3. 创建后获得两套凭证（**Sandbox 沙箱环境 + Production 生产环境各一套**）：
   - **App ID（Client ID）**：客户端标识
   - **Cert ID（Client Secret）**：客户端密钥，**必须保密，不可公开**

#### 第 3 步：配置 OAuth 回调（RuName）

- eBay 用 **RuName（Redirect URL Name）** 标识 OAuth 回调地址，创建应用后自动生成。
- 需在应用设置里把回调地址配置成你自己的服务器地址（如 `https://yourdomain.com/ebay/callback`）。

#### 第 4 步：OAuth 授权拿 token

- 用 OAuth 2.0 的「授权码流程」让卖家（或自己）登录 eBay 授权应用，拿到 **User access token + refresh token**。

#### 第 5 步：调接口

- 运行时用 refresh token 换新的 User access token，再用它调用 eBay API。

### 三、多店铺能不能一次拉？（能）

#### 授权机制

eBay 的授权是 **OAuth 2.0，按卖家账号逐个授权**：

- 一个开发者账号 / 应用**可以授权多个 eBay 卖家账号**。
- 每个卖家账号做一次 OAuth 授权，拿到**独立的 User access token + refresh token**。

#### 数据区分方式

- 每个卖家授权后对应独立的 token，调用时用各自的 token 区分不同卖家账号。

> 结论：一个应用可以对接多个店铺，但**需要每个 eBay 卖家账号分别授权一次**，系统里维护「多个 refresh token + 对应卖家标识」。

#### 需要注意的限制

1. **User access token 有效期 2 小时**，需用 refresh token 定期刷新（refresh token 有效期 18 个月）。
2. refresh token 可能因卖家改密码、撤销授权、token 到期而失效，需重新授权。
3. **生产环境上线前需申请应用认证（Application / Compatible Application Check）**，eBay 审核通过后才能正式上线（通常需提前 2-4 周申请）。

### 四、接口调用要点（开发侧参考）

#### API 域名

- 沙箱环境：`https://api.sandbox.ebay.com/`
- 生产环境：`https://api.ebay.com/`

#### 授权协议

- eBay 使用 **OAuth 2.0**，token 需带对应的 **scope（权限范围）**。
- 拉订单需要 `sell.fulfillment` 相关 scope（订单履约）。

#### 凭证类型

| 凭证 | 说明 |
|---|---|
| App ID（Client ID） | 客户端标识，可共享 |
| Cert ID（Client Secret） | 客户端密钥，**必须保密** |
| Dev ID | 开发者标识 |
| RuName | OAuth 回调地址标识 |

#### 参考来源（eBay）

- eBay 开发者门户：https://developer.ebay.com/
- 新版开发者文档门户：https://www.edp.ebay.com/
- 快速入门（Get started with eBay APIs）：https://www.edp.ebay.com/develop/guides-v2/get-started-with-ebay-apis
- 获取 OAuth 凭证：https://www.edp.ebay.com/api-docs/static/oauth-credentials.html
- 授权指南（token 2 小时 / refresh 18 个月）：https://www.edp.ebay.com/develop/guides-v2/authorization
- eBay 中文快速入门：https://www.ebay.cn/newcms/Home/d_devdocs/1712

---

## 第四部分：Shopify 官方 API

> Shopify 的官方开放平台是 **Shopify Partners / Dev Dashboard**，入口 `https://partners.shopify.com/` 和 `https://dev.shopify.com/dashboard`。**注意：Shopify 的机制和 Shopee/Amazon/eBay 不同——它没有"开发者账号审核"这一关，自用场景建好应用就能直接拿 token 调接口。**

### 一、总体结论（先看这个）

1. Shopify 官方接口通过 **Shopify Partners（合作伙伴）+ Dev Dashboard（开发者控制台）** 申请，入口 `https://dev.shopify.com/dashboard`。
2. **自用场景无需 App Store 审核**：建「自定义应用（Custom App）」即可，不审核、不收费。
3. 申请核心是「**注册 Partners 账号 → Dev Dashboard 建自定义应用 → 配置 scope → 安装到店铺 → 拿 access token → 调接口**」。
4. 关键限制：access token 有效期 **24 小时**（client credentials 方式，到期重新请求即可，无 refresh token）。

### 二、应用类型（我们是自用，选 Custom App）

Shopify 的应用分两类（旧的 Private App 已于 2022 年废弃）：

| 应用类型 | 适用场景 | 是否需审核 |
|---|---|---|
| **自定义应用（Custom App）** | 单店/自用/内部工具/ERP 集成 | **无需审核** |
| **公开应用（Public App）** | 做产品卖给别的商家，上架 App Store | 需审核（多周） |

> **选择建议（我们是自用）**：选「**自定义应用（Custom App）**」，无需 App Store 审核，直接走 Dev Dashboard 创建。

> **重要变化（2026-01-01 起）**：Shopify 已**不再允许在店铺后台（Admin）直接创建旧的 custom app**，所有新应用必须通过 **Dev Dashboard 或 Partner Dashboard** 创建。

### 三、申请流程（自用 Custom App）

#### 第 1 步：注册 Shopify Partners 账号（免费）

1. 访问 `https://partners.shopify.com/`，免费注册合作伙伴账号。

#### 第 2 步：在 Dev Dashboard 创建自定义应用

1. 登录 Dev Dashboard（`https://dev.shopify.com/dashboard`）。
2. 点击 **Create app** → 命名应用 → 创建。
3. 创建应用版本（Version），填写应用 URL、Webhook 版本。

#### 第 3 步：配置 API 权限（Access Scopes）

- 在应用配置里选择所需 scope（权限范围），只选最小必要权限。
- 拉订单需：`read_orders`（订单）；如需历史订单（60 天以上）需额外申请 `read_all_orders`（**可能需约 7 个工作日审核**）。
- 商品、客户、库存分别对应 `read_products`、`read_customers`、`read_inventory`。

#### 第 4 步：安装应用到店铺

- 在 Dev Dashboard 里点击 Install app，选择目标店铺安装。

#### 第 5 步：拿 access token

- 自用场景推荐 **client credentials 授权**：用应用 Client ID + Client Secret 请求 token 端点，拿到 access token。
- 请求端点：`POST https://{shop}.myshopify.com/admin/oauth/access_token`。

#### 第 6 步：调接口

- 用 access token（放在 `X-Shopify-Access-Token` header）调用 Shopify Admin API（GraphQL 或 REST）。

### 四、多店铺能不能一次拉？（能）

#### 授权机制

- 一个 **Custom App 可以安装到多个商店**（尤其是一个组织下的多个 Shopify Plus 商店）。
- 每个店铺**独立安装、独立 access token**。

#### 数据区分方式

- 每个店铺有独立的 `{shop}.myshopify.com` 域名和独立 token，调用时用各自的 token 区分。

> 结论：一个应用可以对接多个店铺，但**每个店铺需分别安装、分别拿 token**，系统里维护「店铺域名 → access token」映射。

#### 需要注意的限制

1. **access token 有效期 24 小时**（client credentials 方式），到期需重新请求。
2. 自定义应用安装链接**仅适用于你的商店**，且**7 天后过期**，过期需重新生成。
3. 默认只能拉最近 **60 天**订单，如需历史订单要单独申请 `read_all_orders` scope（约 7 个工作日审核）。

### 五、接口调用要点（开发侧参考）

#### API 域名

- 每店铺独立：`https://{shop}.myshopify.com/admin/api/...`

#### 授权协议

- Shopify 使用 **OAuth 2.0**。
- 自用推荐 **client credentials grant**（服务器对服务器，无需人工交互）。

#### 凭证类型

| 凭证 | 说明 |
|---|---|
| Client ID | 应用标识（Dev Dashboard → Settings） |
| Client Secret | 客户端密钥，**必须保密** |

#### 审核时长

- **自定义应用（自用）**：**无需审核**，建好即可用。
- **公开应用（产品化）**：需 App Store 审核，通常多周。
- 特殊 scope（如 `read_all_orders`）：单独申请，**可能约 7 个工作日**审核。
- 来源：
  - 官方「Create apps using the Dev Dashboard」：https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard
  - 官方「Using the client credentials grant」（token 24 小时）：https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant
  - 官方「应用分发（自定义 vs 公开）」：https://help.shopify.com/zh-CN/partners/build-integrate/making-apps
  - 官方「安装自定义应用（安装链接 7 天过期）」：https://help.shopify.com/zh-CN/manual/apps/install-setup-apps

#### 参考来源（Shopify）

- Shopify Partners：https://partners.shopify.com/
- Dev Dashboard：https://dev.shopify.com/dashboard
- 开发者文档首页：https://shopify.dev/
- 创建应用（Dev Dashboard）：https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard
- 授权与 token：https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant
- 应用分发类型：https://help.shopify.com/zh-CN/partners/build-integrate/making-apps

---

## 第五部分：四平台关键差异对比

| 对比项 | Shopee | Amazon（SP-API） | eBay | Shopify |
|---|---|---|---|---|
| 官方接口名称 | Shopee Open Platform API | Selling Partner API（SP-API） | eBay Developers Program API | Shopify Admin API |
| 申请入口 | open.shopee.com | Seller Central / developer.amazonservices.com | developer.ebay.com | dev.shopify.com/dashboard |
| 「自用」对应的类型 | 卖家自研（Enterprise/Individual Seller） | 私人卖家应用（Private seller application） | 开发者账号 + 自助 OAuth 授权 | 自定义应用（Custom App） |
| 授权协议 | 自有授权流程 | OAuth 2.0（Login with Amazon / LWA） | OAuth 2.0 | OAuth 2.0 |
| 审核时长 | 卖家自研 3-7 个工作日（按站点） | 标准角色约 1-2 周（受限角色更久） | 账号约 1 个工作日 + 上线认证提前 2-4 周 | **自用无需审核**（公开应用多周） |
| access_token 有效期 | **4 小时** | **1 小时** | **2 小时** | **24 小时** |
| refresh token | 30 天 | 长期复用（具体以官方为准） | 18 个月 | 无（到期重新请求） |
| 多店铺机制 | 主账号一次授权多个店，用 shop_id 区分 | 每个卖家账号分别授权，用 selling_partner_id 区分 | 每个卖家账号分别授权，用 token 区分 | 每店独立安装，用店铺域名区分 |
| 权限控制 | 按 App 类型决定接口权限 | 按 Role（角色）申请 + 资格审核 | 按 OAuth scope 控制 | 按 OAuth scope 控制 |
| 拉订单所需 | access_token + shop_id（Shop API） | LWA access token + selling_partner_id | User access token（含 fulfillment scope） | access token（含 read_orders scope） |

---

## 第六部分：自研 ERP 多店铺落地方案（通用）

> 定位：**自用**。不做产品化对外 Appstore / ISV。

结合当前场景（通过领星/易仓拉订单数据不齐，后续自研 ERP 直连官方接口）：

1. 按「自用」选对开发者类型：Shopee 选卖家自研、Amazon 选私人卖家应用、eBay 选开发者账号自助授权、Shopify 选自定义应用（**类型一旦提交通常不可改**）。
2. 申请**一个** App（每平台一份开发者凭证）。
3. 让每个店铺/卖家账号做一次授权，拿到各自的 token。
4. 系统内维护「平台 → 店铺标识 → access/refresh token」的映射关系。
5. 定时任务按店铺标识循环拉取每个店铺的订单，access_token 到期前刷新（或重新请求）。

---

## 第七部分：待确认事项

- [x] 我们是「自用」还是「产品化给其他卖家用」？→ **已确认：自用**（Shopee 选卖家自研、Amazon 选私人卖家应用、eBay 自助授权、Shopify 自定义应用）。
- [ ] Shopee 店铺是跨境店还是本土店？涉及是否需要 Merchant API。
- [ ] Amazon 用的是卖家账号还是供应商（Vendor）账号？决定选 seller 应用还是 vendor 应用。
- [ ] Amazon 拉订单具体需要申请哪些 Role？需对照官方 Role 清单确认。
- [ ] eBay 拉订单需要申请哪些 OAuth scope？需对照官方 scope 清单确认。
- [ ] Shopify 拉订单是否需历史订单（60 天以上）？若需，要单独申请 `read_all_orders` scope（约 7 个工作日审核）。
- [ ] 是否有 Shopee 招商经理（Key Account Manager）邮箱，用于加速审核。
