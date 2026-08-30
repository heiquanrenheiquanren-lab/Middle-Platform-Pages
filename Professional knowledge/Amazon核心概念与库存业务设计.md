# Amazon 核心概念与库存业务设计

> **用途**：统一产品、业务、研发、仓库和运营对 Amazon 商品、销售记录、FBA 条码及库存归属的理解，并为供应链中台的库存模型、FBA 发货和店铺库存隔离提供业务基础。
>
> **适用范围**：Amazon Seller Central、FBA、海外仓/本地仓发往 FBA，以及中台内部的 Amazon 店铺库存管理。
>
> **重要说明**：Amazon 的条码、混合库存、全球开店和 FBA 规则可能按站点、商品类型、卖家身份和账号配置变化。本文记录的是当前业务建模原则；实际入仓时仍应以对应 Seller Central 账号、站点和货件页面返回的数据为准。

---

## 一、先记住四个核心结论

### 1. ASIN、Listing、Offer 不是同一个概念

```text
ASIN / 商品页面
    ↓
某个卖家针对该商品创建的 Offer
    ↓
Seller SKU / FNSKU / 价格 / 履约方式 / 库存
```

- **ASIN**：Amazon 商品目录中的商品标识。
- **Listing**：泛指商品在 Amazon 上的上架记录或销售页面，业务沟通中容易和 Offer 混用。
- **Offer**：某个卖家针对某个 ASIN 的具体销售报价和库存记录。

同一个 ASIN 可以有多个卖家的 Offer。中台建模时，应该把“商品目录对象”和“店铺销售对象”分开。

### 2. FNSKU 不是普通商品编码

FNSKU 是 Amazon 用于 FBA 库存识别的 Amazon Barcode，通常和卖家、Offer、Seller SKU、站点及商品状态等上下文相关。它不是跨平台通用的商品编码，也不应作为中台的本地 SKU。

### 3. 同一个 FBA 仓库，不代表不同店铺可以共用库存

两个店铺的货即使进入同一个 Amazon Fulfillment Center，也不能仅因为仓库相同就把库存视为一份库存。使用 FNSKU 时，应按对应卖家账号/店铺的库存标识进行隔离。

### 4. 你们的库存模型应当“物理库存与销售库存分层”

```text
物理库存：SKU + 仓库 + 团队/货主 + 批次
销售库存：库存池 + 可使用的店铺/渠道
订单库存：Offer + Seller SKU/FNSKU + 订单预占和实际扣减
```

店铺和 Seller SKU 不作为物理库存主表的核心维度，但必须保留在 Offer、库存池映射、订单预占、出库流水和 FBA 对账中。

---

## 二、Amazon 核心概念词典

| 概念 | 英文/常用写法 | 含义 | 中台建模建议 |
|---|---|---|---|
| 卖家账号 | Seller Account | Amazon 识别卖家主体的账号，包含销售、收款、商品和库存上下文。 | 作为外部账号主数据，不能只用店铺名称代替。 |
| 站点 | Marketplace / Marketplace ID | 例如 Amazon US、CA、UK、DE、JP 等销售市场。 | 作为平台销售和库存同步的维度。 |
| 商品目录 | Catalog | Amazon 平台维护的商品信息集合。 | 与企业本地产品主数据分离。 |
| ASIN | Amazon Standard Identification Number | Amazon 商品目录中的商品标识。 | 作为本地 SKU 的外部商品映射，不作为货权维度。 |
| Listing | Listing | 泛指商品上架记录或商品销售页面。 | 在系统内不要作为唯一精确定义，建议拆成商品目录和 Offer。 |
| Offer | Seller Offer | 某个卖家针对某个 ASIN 的具体销售报价。 | 建议建成“店铺/卖家账号级销售对象”。 |
| Seller SKU | Merchant SKU / MSKU | 卖家在 Amazon 侧定义的销售库存编码。 | 作为销售属性和外部映射，不作为物理库存主键。 |
| FNSKU | Fulfillment Network SKU | Amazon 用于识别 FBA 库存的 Amazon Barcode。 | 作为 FBA 外部库存标识，和卖家账号、站点、Offer 建立映射。 |
| 制造商条码 | UPC / EAN / JAN / ISBN | 商品制造商或品牌使用的全球商品条码。 | 作为产品外部识别码，不等同于 FNSKU。 |
| Amazon Barcode | Amazon Barcode | Amazon 条码的统称，常见形式包括 FNSKU。 | 按 Amazon 实际入仓要求维护。 |
| FBA | Fulfillment by Amazon | Amazon 提供仓储、配送和售后履约的服务。 | 作为履约方式和库存来源。 |
| FBM | Fulfilled by Merchant | 卖家自行履约，不由 Amazon FBA 仓发货。 | 和 FBA 使用不同的库存与履约逻辑。 |
| FBA 物流中心 | Fulfillment Center / FC | Amazon 的实际履约仓库。 | 是外部仓库对象；一个入库计划可能被拆到多个 FC。 |
| STA | Send to Amazon | Amazon 创建 FBA 入库货件的流程。 | 表示入库计划，不等同于实际发货单。 |
| FBA 货件 | FBA Shipment | Amazon 确认的入库货件，有货件号、目的仓和申报量。 | 作为 FBA 入库和接收进度对象。 |

---

## 三、ASIN、Listing、Offer、Seller SKU 和 FNSKU 的关系

### 3.1 示例

```text
ASIN：B0XXXX
商品：某款焊机
```

同一个商品页面下可能存在：

```text
Offer A
- 卖家账号/店铺：Amazon 店铺 A
- Seller SKU：A-WELDER-001
- 履约方式：FBA
- 价格：99 美元
- FNSKU：FNSKU-A

Offer B
- 卖家账号/店铺：Amazon 店铺 B
- Seller SKU：B-WELDER-001
- 履约方式：FBA
- 价格：105 美元
- FNSKU：FNSKU-B
```

两条 Offer 可以指向同一个 ASIN，但它们可能拥有不同的 Seller SKU、FNSKU、库存和价格。

### 3.2 设计上的准确表达

```text
本地 SKU
    ↓ 映射
Amazon ASIN / 商品目录
    ↓ 某店铺创建销售记录
Amazon Offer
    ↓ 销售和 FBA 履约属性
Seller SKU + FNSKU
```

不要把下面几种关系混淆：

```text
同 ASIN ≠ 同 Offer
同 Offer ≠ 同仓库物理库存
同仓库 ≠ 可跨店铺共享 FBA 库存
同商品 ≠ 同 FNSKU
```

### 3.3 Listing 和 Offer 是否一样

严格来说不一样：

- Listing 更偏向“商品上架记录/商品页面”的泛称。
- Offer 更偏向“某个卖家针对该商品的具体销售报价”。

Amazon 后台和业务沟通中可能把卖家的上架记录也称为 Listing，因此要结合上下文判断。中台设计不要只使用一个含义不清的 `listing` 表来承载商品、店铺、库存、价格和 FBA 条码。

---

## 四、FNSKU 与库存的核心知识

### 4.1 FNSKU 的作用

FNSKU 主要用于 Amazon FBA 环节识别入仓商品和卖家库存。它不是 UPC/EAN 的替代品，也不是适用于 eBay、Shopee 或独立站的通用条码。

使用 Amazon Barcode/FNSKU 时，Amazon 通过条码识别商品属于哪个卖家库存上下文；不同卖家通常不会共用同一个 Amazon Barcode。

### 4.2 不同店铺在同一个仓库，FNSKU 是否一样

通常不能认为一样。

| 场景 | FNSKU 判断 |
|---|---|
| 不同卖家账号、同一个 ASIN、同一个 FBA 仓库 | 通常是不同 FNSKU，不能直接共用库存。 |
| 同一个店铺、同一个 ASIN、同一个 Seller SKU，分多批入仓 | 通常使用同一个 FNSKU；以 Seller Central 实际返回值为准。 |
| 同一 Seller Central 账号下的多个站点 | 可能存在统一账户或跨站点安排，不能仅按店铺名称推断，必须读取实际映射。 |
| 同一仓库但不同 FBA Offer | 仓库相同不改变库存归属，仍按各自外部库存标识管理。 |

因此，中台不应使用以下方式判断库存是否相同：

```text
只按 ASIN 判断
只按仓库判断
只按商品名称判断
只按本地 SKU 判断
```

建议至少使用以下组合维护 Amazon 外部库存映射：

```text
Amazon Seller Account
+ Marketplace ID / 站点
+ Store ID
+ Offer ID（如果接口可提供）
+ Seller SKU / MSKU
+ FNSKU
+ Fulfillment Channel
+ 商品状态
```

### 4.3 FNSKU 是否等于库存主键

不建议把 FNSKU 作为中台库存主键。

更合理的关系是：

```text
中台物理库存主键：本地 SKU + 仓库 + 团队/货主 + 批次
Amazon 外部映射：本地 SKU + 店铺/卖家账号 + 站点 + Seller SKU + FNSKU
```

FNSKU 是外部销售/履约标识；它可以决定 FBA 库存对应哪个店铺库存池，但不应反过来决定本地物理库存的基础结构。

### 4.4 制造商条码和混合库存

符合条件的商品历史上可能使用制造商条码进行 FBA 追踪，Amazon 也曾存在虚拟追踪或混合库存处理：相同制造商条码的相同商品可能由 Amazon 按距离等因素从不同卖家库存中履约。

这不等于企业可以在自己的 ERP 中把两个 Amazon 店铺的库存直接合并。它是 Amazon 的内部履约和条码识别机制，不是企业侧的库存共享授权。

Amazon 已公告将于 **2026 年 3 月 31 日**结束混合库存处理，并调整制造商条码的适用条件；品牌方、经销商、商品类别和站点可能适用不同规则。中台设计不应依赖混合库存来实现店铺共享。

---

## 五、Amazon 不同店铺能否共用库存

### 5.1 FNSKU 方式下的基本规则

假设同一个团队有：

```text
Amazon 店铺 A：FNSKU-A
Amazon 店铺 B：FNSKU-B
```

在中台库存模型中，应默认：

```text
FNSKU-A 库存 → Amazon A 店铺库存池
FNSKU-B 库存 → Amazon B 店铺库存池
```

不能因为：

- 两个店铺属于同一个团队；
- 两个店铺卖同一个 ASIN；
- 两个店铺使用同一个 FBA 仓库；
- 两个店铺背后属于同一家公司；

就默认两个店铺可以直接共享 FBA 库存。

### 5.2 店铺之间如果要转移库存

不能把店铺 A 的 FBA 库存仅通过中台改个归属就变成店铺 B 的 FBA 库存。Amazon 官方社区答复给出的处理方式是：原账号移除库存、按接收账号的 FNSKU 重新贴标，再按接收账号重新入仓。[Amazon 关于不同卖家账号之间库存转移的答复](https://sellercentral.amazon.co.uk/seller-forums/discussions/t/3587b4cf-5278-46a4-b420-95c9b430486d)

因此，企业内部可以做“库存池调拨计划”，但真正进入 FBA 后，需要遵守 Amazon 对接收账号、条码和入仓的要求。

### 5.3 FNSKU 和制造商条码的区别

| 对比项 | FNSKU / Amazon Barcode | UPC/EAN 等制造商条码 |
|---|---|---|
| 主要识别对象 | Amazon 卖家侧 FBA 库存 | 全球商品本身 |
| 是否天然绑定卖家 | 通常绑定卖家库存上下文 | 不天然绑定某个卖家 |
| 是否适合跨平台 | 不适合 | 可作为商品识别码，但各平台规则不同 |
| 是否代表企业库存共享 | 不代表 | 也不代表 |
| 中台用途 | 外部 FBA 库存映射与对账 | 产品外部编码映射 |

---

## 六、结合公司业务的库存归属模型

以下按当前已知业务建模：

1. eBay、Shopee 等非 Amazon 小平台，在同一团队内可以共享库存。
2. Amazon 即使属于同一个团队，不同店铺之间也不能默认共享库存。
3. 团队之间是否可以共享，当前信息未明确；默认按“不共享”设计，跨团队共享必须显式配置。

### 6.1 总体关系

```text
租户 / 公司
└── 法人主体
    └── 团队 T1
        ├── Amazon 店铺 A
        │   └── Amazon A 店铺库存池
        ├── Amazon 店铺 B
        │   └── Amazon B 店铺库存池
        ├── eBay 店铺 C
        └── Shopee 店铺 D
            └── T1 团队共享库存池
```

### 6.2 店铺到库存池的映射

| 店铺 | 平台 | 库存范围类型 | 默认库存池 | 是否与同团队其他店铺共享 |
|---|---|---|---|---|
| Amazon A | Amazon | STORE | Amazon A 店铺库存池 | 否 |
| Amazon B | Amazon | STORE | Amazon B 店铺库存池 | 否 |
| eBay C | eBay | TEAM | T1 团队共享库存池 | 是，与同团队共享店铺共享 |
| Shopee D | Shopee | TEAM | T1 团队共享库存池 | 是，与同团队共享店铺共享 |

### 6.3 不要把平台规则硬编码

当前可以将默认规则配置为：

```text
Amazon → STORE
eBay / Shopee → TEAM
```

但建议实际建立可配置的库存范围策略：

```text
inventory_scope_type = TEAM / STORE / PUBLIC
inventory_scope_id
```

店铺表可以维护：

```text
store_id
team_id
platform
marketplace_id
inventory_scope_type
inventory_scope_id
fallback_pool_id
```

这样可以支持特殊店铺、特殊市场或新平台，而不需要修改库存核心代码。

---

## 七、库存分层设计

### 7.1 物理库存层

物理库存记录仓库里真实存在的货物：

```text
本地 SKU
+ 仓库
+ 团队/货主
+ 批次
+ 库位
+ 质量状态
+ 在库数量
```

示例：

```text
SKU-001
美国海外仓
团队 T1
批次 20260801
良品
在库 1,000 件
```

这一层不因为 Amazon 店铺变化而拆分同一批物理货物。

### 7.2 库存池层

库存池表示“哪些销售对象可以使用这批货”。

```text
Amazon A 店铺池：100
Amazon B 店铺池：150
T1 团队共享池：500
未分配库存：250
```

约束：

```text
各库存池逻辑分配数量之和 ≤ 物理库存可分配数量
```

### 7.3 订单库存层

订单创建、分配和发货时，记录订单实际占用了哪个库存池：

```text
订单 A001
SKU-001
- 来源库存池：Amazon A 店铺池
- FNSKU：FNSKU-A
- 预占数量：20
```

订单记录中的平台、店铺、Seller SKU、FNSKU 是销售和履约引用信息，不应回写为物理库存主表的拆分维度。

---

## 八、库存数量口径

建议统一使用以下库存类型：

```text
可用库存
在途库存
占用库存
待确认库存
```

对于某个库存池：

```text
可售库存
= 已分配库存
- 占用库存
- 冻结库存
- 安全库存
```

对于店铺：

```text
店铺可售库存
= 店铺库存池可售库存
+ 允许使用的公共库存池可售库存
```

Amazon 店铺是否允许回退到团队通用货或公共库存，必须单独配置，不能因为文档存在“渠道货 → 团队通用货 → 公共库存”就默认允许。

### 8.1 当前业务下的推荐扣减规则

```text
Amazon 店铺 A 订单
→ Amazon A 店铺库存池
→ 如果业务确认允许，再检查授权公共池
→ 不允许使用 Amazon B 店铺库存池
→ 不允许默认使用团队共享池
```

```text
eBay 店铺 C 订单
→ T1 团队共享库存池
```

```text
Shopee 店铺 D 订单
→ T1 团队共享库存池
```

---

## 九、库存流转规则

### 9.1 海外仓发往 Amazon FBA

海外仓阶段，库存可以仍然按团队管理：

```text
团队 T1 海外仓库存
    ↓ 创建 Amazon A FBA 入仓计划
分配到 Amazon A 店铺库存池
    ↓ 使用 FNSKU-A 入仓
进入 Amazon A FBA 库存
```

如果 Amazon B 也需要同一个本地 SKU：

```text
团队 T1 海外仓库存
    ↓ 创建 Amazon B FBA 入仓计划
分配到 Amazon B 店铺库存池
    ↓ 使用 FNSKU-B 入仓
进入 Amazon B FBA 库存
```

中台要记录一次“团队库存 → Amazon 店铺库存池”的分配或调拨流水，而不是直接修改库存归属字段。

### 9.2 FBA 订单扣减

```text
Amazon A 订单创建
    ↓
读取 Amazon A 的 Offer / Seller SKU / FNSKU
    ↓
定位 Amazon A 店铺库存池
    ↓
原子校验可售库存
    ↓
创建占用流水
    ↓
同步或对账 Amazon FBA 库存
```

Amazon A 不能因为 Amazon B 仍有库存，就在中台显示为可售。

### 9.3 eBay、Shopee 团队共享库存扣减

```text
eBay C 订单 → T1 团队共享库存池占用
Shopee D 订单 → T1 团队共享库存池占用
```

两个店铺的订单必须在同一个库存池余额上进行并发控制，避免两个店铺同时成功占用同一件货。

### 9.4 订单取消、超时和退货

```text
订单取消 / 预占超时
    → 释放原库存池占用

订单发货
    → 减少占用库存
    → 扣减实际物理库存或外部 FBA 库存

退货入库
    → 经过质检
    → 良品重新进入可用库存
    → 次品进入冻结或报废库存
```

释放库存时必须回到原来的库存池，不能把 Amazon A 的取消库存自动释放到 Amazon B 或团队共享池，除非有明确的库存调拨规则。

---

## 十、推荐的数据对象

### 10.1 基础对象

```text
tenant                 租户
legal_entity           法人主体
org_unit               团队/组织
store                  店铺
marketplace            平台站点
warehouse              仓库
location               库位
sku                    本地 SKU
batch                  批次
```

### 10.2 Amazon 销售对象

```text
amazon_seller_account  Amazon 卖家账号
amazon_offer           Amazon 店铺 Offer
amazon_listing         可选：商品上架记录
amazon_sku_mapping     本地 SKU 与 Seller SKU 的映射
amazon_fnsku_mapping   本地 SKU 与 FNSKU 的映射
```

建议 FNSKU 映射至少包含：

```text
seller_account_id
marketplace_id
store_id
asin
seller_sku
fnsku
fulfillment_channel
condition
effective_from
effective_to
status
```

如果当前 FNSKU 仅按站点维护，需要确认同一团队多个 Amazon 店铺是否存在不同 Seller Account 或不同 Offer；如果存在，建议把店铺/卖家账号纳入映射键，避免串店。

### 10.3 库存对象

```text
physical_inventory_balance  物理库存余额
inventory_pool              库存池
inventory_pool_member       库存池成员
pool_inventory_balance      库存池余额
inventory_reservation       库存占用
inventory_allocation        订单分配
inventory_transaction       库存流水
```

### 10.4 核心关系

```text
本地 SKU
    ↓
物理库存余额：SKU + 仓库 + 团队 + 批次
    ↓ 分配
库存池余额：库存池 + SKU + 仓库 + 批次
    ↓ 订单引用
Offer / Seller SKU / FNSKU
    ↓
库存占用、出库、发货和对账流水
```

---

## 十一、与《中台 2.0 版本规划》的对应关系

规划文档已经明确提出：

1. 当前库存粒度混入了 SKU、仓库、团队、平台、店铺、SellerSKU。
2. 2.0 要将库存核心维度收敛到 SKU、仓库、团队/货主。
3. 平台、店铺、SellerSKU 从库存主表剥离，作为出库扣减引用。
4. 订单按“渠道货 → 团队通用货 → 公共库存”路由。
5. 通过单事务和并发锁防止超卖。

这些方向可以保留，但需要补充 Amazon 的店铺隔离规则：

### 11.1 对库存核心维度的补充

```text
物理库存核心维度：SKU + 仓库 + 团队/货主 + 批次
销售库存控制维度：库存池 + 店铺/渠道可使用范围
```

批次和库龄建议作为物理库存明细或库存分层属性保留，不要因为销售店铺拆分而复制库龄。

### 11.2 对销售属性剥离的补充

平台、店铺、SellerSKU、FNSKU 不进入物理库存主表，但要保留在：

- Amazon Offer；
- FNSKU 映射；
- 库存池映射；
- 订单预占；
- 出库扣减；
- FBA 库存同步和对账；
- 店铺权限。

### 11.3 对“渠道货 → 团队通用货 → 公共库存”的补充

建议将“渠道货”定义为可配置的渠道库存池：

```text
Amazon A 渠道货 = Amazon A 店铺库存池
Amazon B 渠道货 = Amazon B 店铺库存池
eBay / Shopee 渠道货 = T1 团队共享库存池中的销售引用
```

Amazon 是否能从团队通用货或公共库存回退，需要业务单独确认；默认不能使用其他 Amazon 店铺库存。

---

## 十二、权限和数据范围

库存权限需要同时控制“功能权限”和“数据范围”。

| 角色 | 可查看内容 | 可操作内容 |
|---|---|---|
| Amazon A 运营 | Amazon A 店铺库存池、A 店铺订单 | A 店铺订单库存操作 |
| Amazon B 运营 | Amazon B 店铺库存池、B 店铺订单 | B 店铺订单库存操作 |
| eBay/Shopee 运营 | 团队共享库存可售结果 | 本店铺订单占用，不可修改共享池余额 |
| 团队负责人 | 团队物理库存、团队共享池、店铺池 | 库存池分配、库存调拨 |
| 仓库人员 | 负责仓库的物理库存、批次、库位 | 入库、出库、盘点、移库 |
| 供应链管理员 | 所有仓库和库存池 | 库存池规则、调拨和异常处理 |
| 财务 | 法人、货主、库存成本和流水 | 成本相关调整和审核 |

未授权店铺的数据不应通过库存总览、导出、接口返回或详情弹窗泄露。

---

## 十三、库存流水和并发控制

### 13.1 流水必须追加记录

常见流水类型：

```text
RECEIVE       入库
ALLOCATE      分配到库存池
TRANSFER      库存池调拨
RESERVE       订单占用
RELEASE       释放占用
PICK          拣货
SHIP          发货扣减
RETURN        退货入库
ADJUST        库存调整
FREEZE        冻结
UNFREEZE      解冻
```

每条流水建议记录：

```text
流水类型
SKU
仓库
批次
原库存池
目标库存池
平台
店铺
Seller SKU
FNSKU
订单/发货单号
变动前数量
变动数量
变动后数量
操作人
操作时间
业务原因
幂等键
```

### 13.2 预占必须原子校验

多个 eBay/Shopee 店铺同时抢团队共享库存时，库存预占必须在同一事务或等价的原子机制中完成：

```text
读取库存池可售数量
    ↓
加锁或条件更新
    ↓
判断可售数量是否足够
    ↓
成功则写入占用流水
失败则返回缺货
```

不能依赖前端页面展示的库存数量进行扣减。

---

## 十四、需要业务继续确认的问题

以下问题会直接影响库存池和 Amazon FBA 的最终规则：

1. 你们说的“不同 Amazon 店铺”，是不同 Seller Account，还是同一 Seller Account 下的不同站点/销售店铺？
2. Amazon 店铺库存不足时，是否可以使用团队通用货？目前只能确认不能使用另一个 Amazon 店铺的货。
3. “公共库存”是公司级公共库存、团队级公共库存，还是仓库级未分配库存？
4. 团队之间是否完全禁止共享，还是可以通过审批/调拨共享？
5. FNSKU 映射当前是否按 Seller Account、站点和店铺维护，还是只按站点维护？
6. 同一个本地 SKU 是否可能对应多个 Amazon Seller SKU、多个 FNSKU 或多个商品状态？
7. Amazon FBA 入库前，海外仓库存是否需要预先分配到店铺池，还是创建 FBA 货件时再分配？
8. Amazon 订单的库存扣减，以 Amazon FBA 订单为准，还是以中台同步订单为准？
9. FBA 库存同步异常时，是否允许使用最近一次成功同步的库存，还是直接停止销售库存回传？
10. 是否需要按批次、有效期、序列号或质量状态管理 Amazon 入仓库存？

---

## 十五、速查结论

```text
ASIN：Amazon 商品目录标识
Listing：泛指上架记录或商品销售页面
Offer：某个卖家针对 ASIN 的具体销售记录
Seller SKU：卖家定义的销售库存编码
FNSKU：Amazon 用于识别 FBA 卖家库存的条码
```

```text
同 ASIN ≠ 同 FNSKU
同仓库 ≠ 可跨店铺共享
同团队 ≠ Amazon 店铺自动共享
同一店铺同一 Offer 分批入仓，通常使用同一 FNSKU
```

```text
非 Amazon 平台：店铺 → 团队共享库存池
Amazon 平台：店铺 → 独立店铺库存池
海外仓物理库存：按 SKU + 仓库 + 团队/货主管理
FBA 入仓库存：按 Seller Account/店铺 + 站点 + FNSKU 对账
```

---

## 十六、参考资料

- [Amazon：FBA 包装、准备和条码说明](https://sell.amazon.com/blog/fba-packaging-prep-labeling)
- [Amazon Seller Central：Barcode types and requirements for FBA](https://sellercentral.amazon.com/seller-forums/discussions/t/84e2c23e-e36b-4cfd-b0cd-c104bd0ab35c)
- [Amazon：Commingling practices will end effective March 31, 2026](https://sellercentral.amazon.com/seller-forums/discussions/t/06778c12-539e-478a-8f67-00592c4c5cca)
- [Amazon：不同卖家账号之间 FBA 库存转移的处理说明](https://sellercentral.amazon.co.uk/seller-forums/discussions/t/3587b4cf-5278-46a4-b420-95c9b430486d)
- 项目文档：[中台 2.0 版本规划](../docs/中台2.0版本规划.md)
- 项目文档：[FBA 发货业务流程与对象关系](./FBA发货业务流程与对象关系.md)
