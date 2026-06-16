原文地址：https://claude.com/blog/lessons-from-building-claude-code-how-we-use-skills
Skills 已经成为 Claude Code 中最常用的扩展点之一。它们灵活、易于制作，也易于分发。但这种灵活性也让人很难确定什么才是最佳做法。什么类型的 Skills 值得制作？如何组织一个 Skill？什么时候与他人分享？我们在 Anthropic 内部大量使用了 Claude Code 中的 Skills，有数百个在活跃使用中。以下是我们关于使用 Skills 加速开发所积累的经验教训。

---
什么是 Skills？
Skills 是指令、脚本和资源的文件夹集合，agent 可以发现并使用它们来更准确、更高效地完成任务。本文假设你已经了解 Skills 的基础知识；如果你是新手，请先学习我们在 Skilljar 上的 agent skills 入门课程。关于 Skills，我们常听到的一个误解是它们"只是 Markdown 文件"。实际上，它们是文件夹，可以包含脚本、资产、数据等，agent 可以发现、探索和操作这些内容。在 Claude Code 中，Skills 还拥有多种配置选项，包括注册动态钩子（hooks）。我们发现，Claude Code 中最有效的 Skills 都充分利用了这些配置选项和文件夹结构。
或阅读官方文档

---
Skills 的类型
在整理 Anthropic 内部所有 Skills 后，我们注意到它们可以归为九类。最好的 Skills 能清晰归入某一类；而那些试图做太多事情的 Skills 往往跨越多个类别，会让 agent 感到困惑。这不是一份详尽的清单，但它是识别你自己 Skills 库中缺失部分的一个有用框架。
[图片]
Claude Code 团队对我们的内部 Skills 进行了分类，发现它们可以归入九个不同的类别。

---
1. 库和 API 参考
这类 Skills 解释如何正确使用库、CLI 或 SDK。它们既可以用于内部库，也可以用于 Claude Code 有时难以处理的常见库。这些 Skills 通常包含一个参考代码片段文件夹，以及 Claude 在编写脚本时应避免的常见问题列表。
示例包括：
- billing-lib — 你的内部计费库：边界情况、常见陷阱等。
- internal-platform-cli — 你内部 CLI 包装器的每个子命令，附带何时使用它们的示例。
- sandbox-proxy — 配置你组织的出口网关用于开发工作：哪些主机可访问、如何调试"连接被拒绝"错误、如何添加允许列表条目。

---
2. 产品验证
这类 Skills 描述如何测试或验证你的代码是否正常工作。它们通常与 Playwright、tmux 或其他外部验证工具配合使用。
验证 Skills 对 Claude 内部输出质量的影响最为可衡量。值得让工程师花一周时间专门把你的验证 Skills 做得非常出色。
可以考虑这样的技术：让 Claude 录制其输出的视频，这样你就能确切看到它测试了什么；或者在每个步骤上对状态强制执行编程断言。这些通常通过在 Skill 中包含各种脚本来实现。
示例包括：
- signup-flow-driver — 在无头浏览器中运行注册 → 邮箱验证 → 引导流程，并在每个步骤设置状态断言钩子
- checkout-verifier — 使用 Stripe 测试卡驱动结账 UI，验证发票确实到达正确状态
- tmux-cli-driver — 用于交互式 CLI 测试，当你需要验证的东西需要 TTY 时很有用

---
3. 数据获取和分析
这类 Skills 连接到你的数据和监控栈。它们可能包含用凭证获取数据的库、特定仪表板 ID 等，以及常见工作流或获取数据方法的说明。
示例包括：
- funnel-query — "我需要关联哪些事件来查看注册 → 激活 → 付费"，加上实际包含标准 user_id 的表
- cohort-compare — 比较两个队列的留存率或转化率，标记统计显著的差异，链接到细分定义
- grafana — 数据源 UID、集群名称、问题 → 仪表板查找表
- datadog — 字段参考（@request_id 与 trace_id）、服务列表、指标前缀约定

---
4. 业务流程和团队自动化
这类 Skills 将重复性工作流自动化为一条命令。它们通常是指令相对简单的 Skills，但可能对其他 Skills 或 MCP 有更复杂的依赖。对于这类 Skills，将先前结果保存在日志文件中可以帮助模型保持一致性，并反思工作流的先前执行。
示例包括：
- standup-post — 聚合你的工单跟踪器、GitHub 活动和之前的 Slack → 格式化的站会内容，仅增量
- create-<ticket-system>-ticket — 强制执行模式（有效的枚举值、必填字段）加上创建后的工作流（通知审查人、在 Slack 中链接）
- weekly-recap — 合并的 PR + 关闭的工单 + 部署 → 格式化的周报

---
5. 代码脚手架和模板
这类 Skills 为代码库中的特定功能生成框架样板代码。你可以将这些 Skills 与可组合的脚本结合使用。当你的脚手架有无法仅靠代码覆盖的自然语言需求时，它们特别有用。
示例包括：
- new-<framework>-workflow — 用你的注释搭建新的服务工作流/处理器
- new-migration — 你的迁移文件模板加上常见陷阱
- create-app — 新的内部应用，预先配置好你的认证、日志和部署配置

---
6. 代码质量和审查
这类 Skills 在你组织内强制执行代码质量并帮助审查代码。它们可以包含确定性脚本或工具以实现最大鲁棒性。你可能希望作为钩子或 GitHub Action 的一部分自动运行这些 Skills。
- adversarial-review — 生成一个全新视角的子 agent 进行批评，实施修复，迭代直到发现的问题降级为吹毛求疵
- code-style — 强制执行代码风格，特别是 Claude 默认做不好的风格。
- testing-practices — 关于如何编写测试以及测试什么的说明。

---
7. CI/CD 和部署
这类 Skills 帮助你在代码库中获取、推送和部署代码。这些 Skills 可能引用其他 Skills 来收集数据。
示例包括：
- babysit-pr — 监控 PR → 重试不稳定的 CI → 解决合并冲突 → 启用自动合并
- deploy-<service> — 构建 → 冒烟测试 → 逐步流量发布并比较错误率 → 回归时自动回滚
- cherry-pick-prod — 隔离工作树 → cherry-pick → 冲突解决 → 带模板的 PR

---
8. 运行手册
这类 Skills 接收一个症状（如 Slack 线程、告警或错误特征），进行多工具调查，并生成结构化报告。
示例包括：
- <service>-debugging — 映射症状 → 工具 → 你流量最高服务的查询模式
- oncall-runner — 获取告警 → 检查常见嫌疑对象 → 格式化发现结果
- log-correlator — 给定一个请求 ID，从每个可能接触过它的系统中拉取匹配的日志

---
9. 基础设施运维
这类 Skills 执行日常维护和运维程序，其中一些涉及破坏性操作，需要有防护栏。它们让工程师在关键操作中更容易遵循最佳实践。
示例包括：
- <resource>-orphans — 查找孤立的 pod/卷 → 发布到 Slack → 观察期 → 用户确认 → 级联清理
- dependency-management — 你组织的依赖审批工作流
- cost-investigation — "为什么我们的存储/出口账单激增"，附带具体的桶和查询模式

---
制作 Skills 的技巧
一旦决定了要制作的 Skill，该如何编写它？以下是 Claude Code 团队制作 Skills 的一些最佳实践、提示和技巧。

---
1. 不要陈述显而易见的事
SKILL.md 文件指向 Claude 可以在特定情况下参考的其他几个文件。例如，如果某个任务处于待处理状态，它应该参考 stuck-jobs.md。Claude 已经知道如何编程，并且可以阅读你的代码库。一个重复 Claude 默认会做的事情的 Skill 增加了上下文但没有增加价值。如果你发布的 Skill 主要是关于知识的，请专注于那些能推动 Claude 跳出常规思维的信息。
前端设计 Skill 是一个很好的例子；它由 Anthropic 的一位工程师通过与用户迭代改进 Claude 的设计品味而构建，避免了 Inter 字体和紫色渐变等经典模式。

---
2. 建立"常见陷阱"部分
[图片]
任何 Skill 中信噪比最高的内容是"常见陷阱"（Gotchas）部分。这些部分应该从 Claude 在使用你的 Skill 时遇到的常见失败点积累而来。理想情况下，你会随着时间的推移更新你的 Skill 以捕捉这些陷阱。
例如：
- "subscriptions 表是仅追加的。你想要的行是具有最高版本的那一行，而不是最新的 created_at。"
- "这个字段在 API 网关中称为 @request_id，在计费服务中称为 trace_id。它们是同一个值。"
- "即使 Stripe webhook 实际上没有处理，Staging 环境也返回 200。检查 payment_events 以获取真实状态。"

---
3. 使用文件系统和渐进式披露
[图片]
SKILL.md 文件指向 Claude 可以在特定情况下参考的其他几个文件。例如，如果某个任务处于待处理状态，它应该参考 stuck-jobs.md。正如我们之前所说，一个 Skill 是一个文件夹，而不仅仅是一个 Markdown 文件。你应该把整个文件系统视为一种上下文工程和渐进式披露的形式。告诉 Claude 你的 Skill 中有哪些文件，它会在适当的时候读取它们。最简单的渐进式披露形式是指向其他 Markdown 文件供 Claude 使用。例如，你可以将详细的函数签名和使用示例拆分到 references/api.md 中。
另一个例子：如果你的最终输出是 Markdown 文件，你可以在 assets/ 中包含一个模板文件供复制和使用。
你可以拥有参考、脚本、示例等文件夹，帮助 Claude 更有效地工作。

---
4. 避免过度限制 Claude
Claude 通常会尽量遵循你的指令，而且因为 Skills 非常可重用，你会希望小心不要在指令中过于具体。给 Claude 它需要的信息，但给它灵活适应情况的余地。
例如：
[图片]

---
5. 想清楚设置流程
[图片]
上面的 Skill 被编写为：如果配置中未包含 Slack 频道，则提示用户。
有些 Skills 可能需要用户提供的上下文进行设置。例如，如果你正在制作一个将站会发布到 Slack 的 Skill，你可能希望 Claude 询问发布到哪个 Slack 频道。
一个好的做法是将这些设置信息存储在 Skill 目录中的 config.json 文件中，如上面的示例所示。如果配置未设置，agent 可以向用户询问信息。
如果你希望 agent 呈现结构化的多项选择题，你可以指示 Claude 使用 AskUserQuestion 工具。

---
6.为模型写描述，而不是为人类
当 Claude Code 启动会话时，它会构建每个可用 Skills 及其描述的列表。Claude 扫描这个列表来决定"这个请求是否有对应的 Skill？"这意味着描述字段不是摘要，而是描述何时触发此 Skill。
[图片]
在描述中包含 Skills 的触发词（如"babysit"）会很有帮助。

---
7.帮助 Claude 记忆
[图片]
这个文本日志文件帮助 Claude 记住过去的事件，比如审查 Sarah 的认证 PR。
有些 Skills 可以通过在其中存储数据来包含某种形式的记忆。你可以将数据存储在任何简单的东西中，如仅追加的文本日志文件或 JSON 文件，或者复杂到 SQLite 数据库。
例如，standup-post Skill 可能会保留一个 standups.log，记录它写过的每个帖子，这意味着下次你运行它时，Claude 会读取自己的历史记录，并能判断自昨天以来有什么变化。你可以使用环境变量 ${CLAUDE_PLUGIN_DATA} 获取一个稳定的目录来存储数据，在此阅读更多关于在 Skills 中持久化数据的内容。

---
8.存储脚本并生成代码
你能给 Claude 最强大的工具之一是代码。给 Claude 脚本和库可以让 Claude 把时间花在组合上，决定下一步做什么，而不是重建样板代码。
例如，在你的 data-science Skill 中，你可能有一个从事件源获取数据的函数库。为了让 Claude 进行复杂分析，你可以给它一组这样的辅助函数：
[图片]
Claude 然后可以动态生成脚本来组合这些功能，进行更高级的分析，以回应"周二发生了什么？"这样的提示。
[图片]

---
9.使用按需钩子
Skills 可以包含仅在调用 Skill 时激活且仅在会话持续期间有效的钩子。将它们用于更有主见的钩子，你不希望一直运行，但有时非常有用。
例如：
- /careful — 通过 Bash 上的 PreToolUse 匹配器阻止 rm -rf、DROP TABLE、force-push、kubectl delete。你只希望在知道自己要操作生产环境时才使用它——一直开启会让你抓狂。
- /freeze — 阻止任何不在特定目录中的编辑/写入操作。在调试时很有用："我想添加日志，但我总是意外地'修复'了无关的代码。"
Hook 文档
Skill 和agent专属Hook文档

---
分发 Skills
Skills 的最大好处之一是你可以在团队中分享它们。
有两种方式可以与他人分享 Skills：
- 将你的 Skills 提交到仓库（在 ./.claude/skills 下）
- 制作一个插件，并拥有一个 Claude Code 插件市场，用户可以在其中上传和安装插件（在此阅读文档了解更多信息）
对于跨相对较少仓库工作的小型团队，将 Skills 提交到仓库效果很好。但每个提交的 Skills 也会给模型的上下文增加一点负担。随着规模扩大，内部插件市场允许你分发 Skills，让团队决定安装哪些，还包括设置流程。

---
管理 Skills 市场
你如何决定哪些 Skills 进入市场？人们如何提交它们？
在 Anthropic，我们没有一个集中团队来做决定；相反，我们尝试有机地找到最有用的 Skills。如果有人有一个想让别人尝试的 Skill，他们可以将其上传到 GitHub 中的沙盒文件夹，并在 Slack 或其他论坛中指引人们前往。
一旦某个 Skill 获得关注（由 Skill 所有者决定），他们可以提交 PR 将其移入市场。

---
组合 Skills
你可能希望拥有相互依赖的 Skills。例如，你可能有一个上传文件的 Skills，以及一个生成 CSV 并上传的 Skills。这种依赖管理尚未原生构建到市场或 Skills 中，但你只需按名称引用其他 Skills，如果它们已安装，模型就会调用它们。

---
衡量 Skills
要了解某个 Skill 的表现，我们使用一个 PreToolUse 钩子，让我们可以在公司内记录 Skill 使用情况（示例代码在此）。这意味着我们可以找到流行的 Skills，或者与我们预期相比触发不足的 Skills。
参考：
skill专属hook

---
开始行动
Skills 最佳实践仍在不断发展。我们大多数最好的 Skills 最初只是几行代码和一个常见陷阱，然后随着 Claude 遇到新的边界情况，人们不断添加内容而变得更好。
理解 Skills 的最好方法是开始动手、实验，看看什么对你有效。

---
本文由 Thariq Shihipar 撰写，他是 Anthropic 的技术团队成员，从事 Claude Code 相关工作。

