# Vim 使用指南 - 开发者必备

> 适用场景：Linux服务器操作、终端快速编辑、代码审查、面试必备技能

---

## 📋 目录

- [Vim模式说明](#vim模式说明)
- [基础操作](#基础操作)
- [移动光标](#移动光标)
- [编辑命令](#编辑命令)
- [搜索与替换](#搜索与替换)
- [复制粘贴](#复制粘贴)
- [多文件操作](#多文件操作)
- [可视模式](#可视模式)
- [常用配置](#常用配置)
- [实用技巧](#实用技巧)
- [快捷键速查表](#快捷键速查表)

---

## Vim模式说明

Vim有4种主要模式：

| 模式 | 说明 | 进入方式 | 退出方式 |
|------|------|---------|---------|
| **普通模式** | 默认模式，用于移动和命令 | `Esc` | - |
| **插入模式** | 编辑文本 | `i`/`a`/`o` | `Esc` |
| **命令模式** | 执行命令（保存、退出等） | `:` | `Esc` |
| **可视模式** | 选择文本 | `v`/`V`/`Ctrl+v` | `Esc` |

```
普通模式（Normal Mode）
   ↓ i/a/o
插入模式（Insert Mode）
   ↓ Esc
普通模式
   ↓ :
命令模式（Command Mode）
   ↓ Esc
普通模式
   ↓ v/V
可视模式（Visual Mode）
   ↓ Esc
普通模式
```

---

## 基础操作

### 打开/新建文件

```bash
# 打开文件
vim filename.txt

# 打开文件并跳到第10行
vim +10 filename.txt

# 打开文件并跳到第一个匹配"function"的行
vim +/function filename.txt

# 打开多个文件
vim file1.txt file2.txt

# 以只读模式打开
vim -R filename.txt
# 或
view filename.txt
```

### 保存与退出

| 命令 | 说明 |
|------|------|
| `:w` | 保存 |
| `:w filename` | 另存为 |
| `:q` | 退出 |
| `:q!` | 强制退出（不保存） |
| `:wq` | 保存并退出 |
| `:x` | 保存并退出（同:wq） |
| `ZZ` | 保存并退出（普通模式） |
| `ZQ` | 不保存退出（普通模式） |

**常用组合：**
```vim
:wq        " 保存并退出
:q!        " 不保存强制退出
:w !sudo tee %   " 以sudo权限保存（忘记用sudo打开时）
```

---

## 移动光标

### 基础移动（普通模式）

| 按键 | 说明 |
|------|------|
| `h` | 左移一个字符 ← |
| `j` | 下移一行 ↓ |
| `k` | 上移一行 ↑ |
| `l` | 右移一个字符 → |

**记忆技巧：**
```
       k (上)
       ↑
h (左) ← → l (右)
       ↓
       j (下)
```

### 单词/行移动

| 按键 | 说明 | 示例 |
|------|------|------|
| `w` | 下一个单词开头 | `const` → `function` |
| `b` | 上一个单词开头 | `function` → `const` |
| `e` | 当前/下一个单词结尾 | `cons`t → `functio`n |
| `0` | 行首 | `    const x = 1` → 跳到开头空格 |
| `^` | 行首（非空白字符） | `    const x = 1` → 跳到`c` |
| `$` | 行尾 | 跳到`;` |
| `gg` | 文件开头 | 第1行 |
| `G` | 文件结尾 | 最后一行 |
| `10G` | 跳到第10行 | - |
| `:10` | 跳到第10行 | - |

### 屏幕移动

| 按键 | 说明 |
|------|------|
| `Ctrl + f` | 向下翻一页（Forward） |
| `Ctrl + b` | 向上翻一页（Backward） |
| `Ctrl + d` | 向下翻半页（Down） |
| `Ctrl + u` | 向上翻半页（Up） |
| `H` | 跳到屏幕顶部（High） |
| `M` | 跳到屏幕中间（Middle） |
| `L` | 跳到屏幕底部（Low） |
| `zz` | 当前行移到屏幕中央 |
| `zt` | 当前行移到屏幕顶部 |
| `zb` | 当前行移到屏幕底部 |

### 括号/函数跳转

| 按键 | 说明 |
|------|------|
| `%` | 跳转到匹配的括号 `()` `{}` `[]` |
| `{` | 上一个空行（段落开头） |
| `}` | 下一个空行（段落结尾） |
| `[[` | 上一个函数开头 |
| `]]` | 下一个函数开头 |

**示例：**
```javascript
function test() {  // 光标在这里，按%跳到下面的}
  if (true) {      // 光标在这里，按%跳到对应的}
    return 1;
  }
}
```

---

## 编辑命令

### 进入插入模式

| 按键 | 说明 | 示例 |
|------|------|------|
| `i` | 光标前插入 | `he│llo` → `hi│ello` |
| `I` | 行首插入 | `  │hello` → `│  hello` |
| `a` | 光标后插入 | `he│llo` → `hel│lo` |
| `A` | 行尾插入 | `hello│` → `hello │` |
| `o` | 下方新建一行 | 在当前行下方插入 |
| `O` | 上方新建一行 | 在当前行上方插入 |
| `s` | 删除光标字符并插入 | `h│ello` → `h│llo` |
| `S` | 删除整行并插入 | 清空当前行 |
| `C` | 删除光标到行尾并插入 | `hel│lo world` → `hel│` |

### 删除命令

| 按键 | 说明 | 示例 |
|------|------|------|
| `x` | 删除光标字符 | `he│llo` → `he│lo` |
| `X` | 删除光标前字符 | `he│llo` → `h│llo` |
| `dd` | 删除整行 | 删除当前行 |
| `D` | 删除到行尾 | `hel│lo world` → `hel│` |
| `dw` | 删除到单词末尾 | `hello│ world` → `│ world` |
| `db` | 删除到单词开头 | `hello worl│d` → `hello │d` |
| `d0` | 删除到行首 | `hello worl│d` → `│d` |
| `d$` | 删除到行尾（同D） | - |
| `dG` | 删除到文件末尾 | - |
| `dgg` | 删除到文件开头 | - |

**数字组合：**
```vim
3dd        " 删除3行
d3w        " 删除3个单词
5x         " 删除5个字符
```

### 修改/替换

| 按键 | 说明 | 示例 |
|------|------|------|
| `r` | 替换单个字符 | `hello` → `ra` → `aello` |
| `R` | 进入替换模式 | 持续覆盖输入 |
| `cw` | 修改单词 | 删除单词并进入插入模式 |
| `cc` | 修改整行 | 清空行并进入插入模式 |
| `C` | 修改到行尾 | 同`c$` |
| `ciw` | 修改当前单词 | 不管光标在单词哪个位置 |
| `ci"` | 修改引号内内容 | `"hello"` → `""` |
| `ci(` | 修改括号内内容 | `(hello)` → `()` |
| `ci{` | 修改花括号内容 | `{hello}` → `{}` |

**文本对象操作：**
```vim
ciw        " change in word - 修改当前单词
ci"        " change in " - 修改双引号内内容
ci'        " change in ' - 修改单引号内容
ci(        " change in ( - 修改括号内内容
ci{        " change in { - 修改花括号内容
ci[        " change in [ - 修改方括号内容
cit        " change in tag - 修改HTML标签内容

# 同样适用于 d（删除）、y（复制）、v（选择）
diw        " 删除当前单词
yi"        " 复制引号内容
vi{        " 选择花括号内容
```

**示例：**
```javascript
// 光标在任意位置
const message = "Hello World";  // 输入 ci" 清空引号内容
const obj = { name: 'test' };   // 输入 ci{ 清空花括号内容
<div>content</div>              // 输入 cit 清空标签内容
```

### 撤销与重做

| 按键 | 说明 |
|------|------|
| `u` | 撤销（Undo） |
| `Ctrl + r` | 重做（Redo） |
| `U` | 撤销整行修改 |
| `.` | 重复上次操作（超级实用！） |

**重复操作示例：**
```vim
# 场景：删除多个相同的单词
/word      " 搜索word
dw         " 删除word
n          " 跳到下一个word
.          " 重复删除操作
n.n.n.     " 快速删除多个word
```

---

## 搜索与替换

### 搜索

| 命令 | 说明 |
|------|------|
| `/pattern` | 向下搜索 |
| `?pattern` | 向上搜索 |
| `n` | 下一个匹配 |
| `N` | 上一个匹配 |
| `*` | 搜索光标下的单词（向下） |
| `#` | 搜索光标下的单词（向上） |
| `/\<word\>` | 精确匹配单词（不匹配`password`） |

**搜索选项：**
```vim
:set hlsearch      " 高亮搜索结果
:set nohlsearch    " 关闭高亮
:noh               " 临时关闭当前高亮

:set ignorecase    " 忽略大小写
:set smartcase     " 智能大小写（小写忽略，大写精确）
:set incsearch     " 增量搜索（边输入边跳转）
```

### 替换

| 命令 | 说明 |
|------|------|
| `:s/old/new` | 替换当前行第一个匹配 |
| `:s/old/new/g` | 替换当前行所有匹配 |
| `:%s/old/new/g` | 替换全文所有匹配 |
| `:%s/old/new/gc` | 替换全文（带确认） |
| `:5,10s/old/new/g` | 替换第5-10行 |
| `:'<,'>s/old/new/g` | 替换可视选择区域 |

**替换标志：**
```vim
g    " global - 全局替换（一行内所有匹配）
c    " confirm - 确认每次替换
i    " ignore case - 忽略大小写
I    " 大小写敏感
```

**实用示例：**
```vim
# 删除所有空行
:g/^$/d

# 删除行尾空格
:%s/\s\+$//g

# 替换变量名（全词匹配）
:%s/\<oldName\>/newName/g

# 在每行开头添加 //
:%s/^/\/\/ /

# 在每行结尾添加分号
:%s/$/;/

# 交换两个单词
:%s/\(foo\)\(.*\)\(bar\)/\3\2\1/

# 将数字加1（需要特殊技巧）
:%s/\d\+/\=submatch(0)+1/g
```

---

## 复制粘贴

### 基础操作

| 按键 | 说明 |
|------|------|
| `yy` | 复制整行 |
| `Y` | 复制整行（同yy） |
| `yw` | 复制一个单词 |
| `y$` | 复制到行尾 |
| `y0` | 复制到行首 |
| `yG` | 复制到文件末尾 |
| `ygg` | 复制到文件开头 |
| `p` | 粘贴到光标后/下一行 |
| `P` | 粘贴到光标前/上一行 |
| `3yy` | 复制3行 |

### 寄存器操作

Vim有多个剪贴板（寄存器）：

| 寄存器 | 说明 |
|--------|------|
| `"` | 默认寄存器 |
| `0-9` | 最近删除/复制的内容 |
| `a-z` | 命名寄存器（可自定义使用） |
| `+` | 系统剪贴板（与其他应用共享） |
| `*` | 选择缓冲区（鼠标选择的内容） |

**使用寄存器：**
```vim
# 复制到命名寄存器a
"ayy        " 复制当前行到寄存器a
"ap         " 粘贴寄存器a的内容

# 复制到系统剪贴板
"+yy        " 复制当前行到系统剪贴板
"+p         " 粘贴系统剪贴板内容

# 查看所有寄存器内容
:reg        " 显示所有寄存器
:reg a      " 显示寄存器a的内容
```

**实用场景：**
```vim
# 场景1：在多个位置粘贴不同内容
"ayy        " 复制第一行到a
"byy        " 复制第二行到b
"ap         " 粘贴a
"bp         " 粘贴b

# 场景2：与系统剪贴板交互
"+yy        " 复制到系统剪贴板（可粘贴到浏览器）
"+p         " 从系统剪贴板粘贴（可从浏览器复制）
```

---

## 多文件操作

### 缓冲区（Buffer）

| 命令 | 说明 |
|------|------|
| `:e filename` | 打开文件 |
| `:ls` | 列出所有缓冲区 |
| `:bn` | 下一个缓冲区 |
| `:bp` | 上一个缓冲区 |
| `:b3` | 切换到缓冲区3 |
| `:bd` | 关闭当前缓冲区 |
| `:bd 3` | 关闭缓冲区3 |
| `:bufdo %s/old/new/g` | 对所有缓冲区执行替换 |

### 窗口分割（Split）

| 命令 | 说明 |
|------|------|
| `:sp` | 水平分割窗口 |
| `:vsp` | 垂直分割窗口 |
| `:sp filename` | 水平分割并打开文件 |
| `:vsp filename` | 垂直分割并打开文件 |
| `Ctrl + w + h/j/k/l` | 在窗口间移动 |
| `Ctrl + w + w` | 切换到下一个窗口 |
| `Ctrl + w + =` | 平均窗口大小 |
| `Ctrl + w + _` | 最大化当前窗口高度 |
| `Ctrl + w + |` | 最大化当前窗口宽度 |
| `Ctrl + w + q` | 关闭当前窗口 |
| `:qa` | 关闭所有窗口 |

```
┌─────────────────────────────┐
│         :sp (水平)           │
│─────────────────────────────│
│                             │
└─────────────────────────────┘

┌──────────┬──────────────────┐
│          │                  │
│  :vsp    │                  │
│ (垂直)   │                  │
│          │                  │
└──────────┴──────────────────┘
```

### 标签页（Tab）

| 命令 | 说明 |
|------|------|
| `:tabnew` | 新建标签页 |
| `:tabnew filename` | 新标签打开文件 |
| `:tabn` | 下一个标签 |
| `:tabp` | 上一个标签 |
| `gt` | 下一个标签（普通模式） |
| `gT` | 上一个标签（普通模式） |
| `3gt` | 跳到第3个标签 |
| `:tabs` | 列出所有标签 |
| `:tabc` | 关闭当前标签 |
| `:tabo` | 关闭其他标签 |

---

## 可视模式

### 进入可视模式

| 按键 | 说明 |
|------|------|
| `v` | 字符可视模式 |
| `V` | 行可视模式 |
| `Ctrl + v` | 块可视模式（列编辑） |

### 可视模式操作

选择文本后，可以执行：

| 按键 | 说明 |
|------|------|
| `d` | 删除选中内容 |
| `y` | 复制选中内容 |
| `c` | 修改选中内容 |
| `>` | 增加缩进 |
| `<` | 减少缩进 |
| `=` | 自动格式化 |
| `~` | 切换大小写 |
| `u` | 转小写 |
| `U` | 转大写 |

### 块可视模式（列编辑）

**批量注释示例：**
```javascript
// 原始代码
const a = 1;
const b = 2;
const c = 3;

// 操作步骤：
1. 光标移到第一行行首
2. Ctrl + v 进入块可视模式
3. j j j 向下选择4行
4. I（大写i）进入插入模式
5. 输入 //（空格）
6. Esc 退出，自动应用到所有行

// 结果
// const a = 1;
// const b = 2;
// const c = 3;
```

**批量对齐示例：**
```javascript
// 原始代码
const name = 'John';
const age = 25;
const city = 'NYC';

// 操作：选择等号列，删除后重新对齐
1. Ctrl + v 选择等号列
2. x 删除
3. I（插入模式）+ 空格对齐
4. Esc 应用

// 结果
const name  = 'John';
const age   = 25;
const city  = 'NYC';
```

---

## 常用配置

### .vimrc 配置文件

创建/编辑配置文件：
```bash
vim ~/.vimrc
```

### 基础配置

```vim
" ========== 显示设置 ==========
syntax on                   " 语法高亮
set number                  " 显示行号
set relativenumber          " 显示相对行号
set cursorline              " 高亮当前行
set ruler                   " 显示光标位置
set showcmd                 " 显示命令
set showmode                " 显示模式
set wrap                    " 自动换行
set scrolloff=5             " 光标上下保留5行

" ========== 编辑设置 ==========
set tabstop=2               " Tab宽度为2
set shiftwidth=2            " 缩进宽度为2
set expandtab               " Tab转空格
set autoindent              " 自动缩进
set smartindent             " 智能缩进
set backspace=indent,eol,start  " 退格键行为

" ========== 搜索设置 ==========
set hlsearch                " 高亮搜索结果
set incsearch               " 增量搜索
set ignorecase              " 忽略大小写
set smartcase               " 智能大小写

" ========== 其他设置 ==========
set nobackup                " 不创建备份文件
set noswapfile              " 不创建交换文件
set undofile                " 启用持久撤销
set clipboard=unnamedplus   " 使用系统剪贴板
set mouse=a                 " 启用鼠标
set encoding=utf-8          " UTF-8编码
set wildmenu                " 命令行补全菜单

" ========== 快捷键映射 ==========
" 快速保存
nnoremap <C-s> :w<CR>

" 快速退出
nnoremap <C-q> :q<CR>

" 快速切换窗口
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" 取消搜索高亮
nnoremap <Esc><Esc> :nohlsearch<CR>

" 移动整行
nnoremap <A-j> :m .+1<CR>==
nnoremap <A-k> :m .-2<CR>==

" ========== 插件设置（使用vim-plug） ==========
" 安装vim-plug:
" curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
"     https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

call plug#begin('~/.vim/plugged')
Plug 'preservim/nerdtree'           " 文件树
Plug 'vim-airline/vim-airline'      " 状态栏美化
Plug 'tpope/vim-surround'           " 括号/引号操作
Plug 'jiangmiao/auto-pairs'         " 括号自动补全
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'junegunn/fzf.vim'             " 模糊查找
call plug#end()

" NERDTree快捷键
nnoremap <C-n> :NERDTreeToggle<CR>
```

### 应用配置

```bash
# 编辑配置后，重新加载
:source ~/.vimrc

# 或重启vim
```

---

## 实用技巧

### 1. 重复执行命令

```vim
# .（点）命令：重复上次操作
# 场景：批量修改
cw newName <Esc>    " 修改单词
.                   " 跳到下一个，按.重复修改

# 宏录制：录制复杂操作序列
qa                  " 开始录制到寄存器a
# 执行一系列操作...
q                   " 停止录制
@a                  " 执行宏
@@                  " 重复执行上次的宏
10@a                " 执行宏10次
```

**宏录制示例：**
```javascript
// 场景：将变量声明改为解构赋值
// 原始：
const name = user.name;
const age = user.age;
const city = user.city;

// 操作：
qa                  // 开始录制
^                   // 跳到行首
f=                  // 找到等号
D                   // 删除到行尾
i = user.<Esc>      // 插入
j                   // 下一行
q                   // 停止录制

@@                  // 应用到其他行
```

### 2. 快速注释/取消注释

```vim
# 单行注释
I// <Esc>          " 行首插入 //

# 多行注释（块可视模式）
Ctrl+v             " 进入块可视模式
jjj                " 选择多行
I// <Esc>          " 批量添加 //

# 取消注释
Ctrl+v             " 块选择
jjj                " 选择多行
x                  " 删除第一列
```

### 3. 快速缩进

```vim
# 单行缩进
>>                 " 增加缩进
<<                 " 减少缩进

# 多行缩进
V                  " 行可视模式
jjj                " 选择多行
>                  " 增加缩进
3>                 " 增加3级缩进

# 自动格式化
gg=G               " 格式化整个文件
=                  " 格式化选中内容（可视模式）
```

### 4. 大小写转换

```vim
~                  " 切换光标字符大小写
g~~                " 切换整行大小写
gUU                " 整行转大写
guu                " 整行转小写

# 可视模式
v                  " 选择文本
U                  " 转大写
u                  " 转小写
~                  " 切换大小写
```

### 5. 排序与去重

```vim
# 排序
:sort              " 对选中行排序
:%sort             " 对整个文件排序
:sort!             " 逆序排序
:sort n            " 按数字排序

# 去重
:sort u            " 排序并去重

# 删除空行
:g/^$/d
```

### 6. 执行外部命令

```vim
# 执行shell命令
:!ls               " 执行ls命令
:!node %           " 运行当前文件（%代表当前文件名）
:!git status       " 执行git命令

# 读取命令输出
:r !date           " 插入当前日期
:r !ls             " 插入ls结果

# 将内容传给外部命令
:%!jq .            " 格式化JSON（需要安装jq）
:%!python -m json.tool  " 格式化JSON（使用Python）
```

### 7. 跳转与标记

```vim
# 标记位置
ma                 " 在当前位置设置标记a
'a                 " 跳转到标记a所在行
`a                 " 精确跳转到标记a的位置

# 特殊标记
''                 " 跳回上次位置
`.                 " 跳到上次编辑位置
`^                 " 跳到上次插入位置

# 查看标记
:marks             " 显示所有标记
```

### 8. 折叠代码

```vim
# 手动折叠
zf                 " 创建折叠（可视模式）
zf3j               " 折叠3行
zo                 " 打开折叠
zc                 " 关闭折叠
za                 " 切换折叠
zR                 " 打开所有折叠
zM                 " 关闭所有折叠

# 配置自动折叠
:set foldmethod=indent    " 基于缩进折叠
:set foldmethod=syntax    " 基于语法折叠
```

---

## 快捷键速查表

### 移动光标

```
基础移动:        h j k l
单词移动:        w b e
行内移动:        0 ^ $ f F t T
文件移动:        gg G 10G
屏幕移动:        Ctrl+f Ctrl+b Ctrl+d Ctrl+u H M L
括号跳转:        %
标记跳转:        ma 'a `a
```

### 编辑操作

```
插入:            i I a A o O
删除:            x dd D dw d$ d0
修改:            r R cw cc C ciw ci" ci(
复制粘贴:        yy y$ p P
撤销重做:        u Ctrl+r
重复:            .
```

### 搜索替换

```
搜索:            /pattern ?pattern n N * #
替换:            :s/old/new/g
                :%s/old/new/gc
                :'<,'>s/old/new/g
```

### 多文件操作

```
缓冲区:          :e :ls :bn :bp :bd
窗口:            :sp :vsp Ctrl+w+hjkl
标签:            :tabnew gt gT
```

### 可视模式

```
进入:            v V Ctrl+v
操作:            d y c > < = ~
```

### 命令模式

```
保存退出:        :w :q :wq :x ZZ
执行命令:        :!command
读取文件:        :r filename
替换:            :%s/old/new/g
排序:            :sort
```

---

## 常见场景实战

### 场景1：快速修改JSON

```vim
# 打开JSON文件
vim config.json

# 格式化（需要安装jq）
:%!jq .

# 搜索并修改
/port              " 搜索port
cw 8080            " 修改端口号

# 保存退出
:wq
```

### 场景2：批量修改变量名

```vim
# 打开文件
vim app.js

# 全局替换（带确认）
:%s/\<oldName\>/newName/gc

# 或使用*和cgn
/oldName           " 搜索
*                  " 选中当前单词
cgn newName        " 修改并跳到下一个
.                  " 重复修改
n.n.n.             " 连续修改
```

### 场景3：代码注释/取消注释

```vim
# 多行注释
Ctrl+v             " 块选择
jjjj               " 选择5行
I// <Esc>          " 添加注释

# 取消注释
Ctrl+v             " 块选择
jjjj               " 选择5行
x                  " 删除第一列
```

### 场景4：代码对齐

```vim
# 选择代码块
V                  " 行可视模式
{                  " 选到代码块开头
=                  " 自动格式化

# 整个文件格式化
gg=G
```

### 场景5：查看git diff

```vim
# 在vim中执行git命令
:!git diff

# 或用vim插件（vim-fugitive）
:Gdiff
```

---

## 🚀 进阶学习建议

### 1. 学习路径

```
初级（1周）:
- 掌握四种模式切换
- 基础移动和编辑
- 保存退出命令

中级（2-4周）:
- 搜索替换
- 文本对象操作（ciw, ci", etc）
- 宏录制和重复命令
- 多文件操作

高级（1-3月）:
- 自定义.vimrc配置
- 插件使用（NERDTree, fzf等）
- 高级文本处理
- 与shell命令结合
```

### 2. 练习资源

```bash
# Vim内置教程（强烈推荐！）
vimtutor

# 在线练习
https://www.openvim.com/
https://vim-adventures.com/
```

### 3. 常用插件推荐

```vim
" 文件管理
Plug 'preservim/nerdtree'           " 文件树
Plug 'junegunn/fzf.vim'             " 模糊查找

" 编辑增强
Plug 'tpope/vim-surround'           " 括号操作
Plug 'jiangmiao/auto-pairs'         " 括号补全
Plug 'tpope/vim-commentary'         " 快速注释

" 代码提示
Plug 'neoclide/coc.nvim'            " LSP支持

" Git集成
Plug 'tpope/vim-fugitive'           " Git命令
Plug 'airblade/vim-gitgutter'       " Git diff显示

" 美化
Plug 'vim-airline/vim-airline'      " 状态栏
Plug 'morhetz/gruvbox'              " 主题
```

### 4. 面试必备

作为开发者，掌握Vim基础操作是加分项：

**必须掌握：**
- ✅ 模式切换（普通/插入/命令）
- ✅ 基础移动（hjkl, gg, G, 0, $）
- ✅ 编辑操作（i, dd, yy, p, u）
- ✅ 搜索替换（/pattern, :%s/old/new/g）
- ✅ 保存退出（:w, :q, :wq）

**加分项：**
- ✅ 文本对象操作（ciw, ci", etc）
- ✅ 宏录制与重复命令
- ✅ 多文件操作
- ✅ 自定义配置

---

## 📚 总结

### 最常用命令（80/20法则）

```vim
# 移动（20%）
h j k l             " 基础移动
0 ^ $               " 行首行尾
gg G                " 文件首尾
w b                 " 单词移动
/pattern            " 搜索

# 编辑（20%）
i a o               " 插入
dd yy p             " 删除复制粘贴
u Ctrl+r            " 撤销重做
.                   " 重复操作
ciw ci"             " 文本对象操作

# 命令（20%）
:w :q :wq           " 保存退出
:%s/old/new/g       " 替换
:!command           " 执行命令
```

记住这些命令，你就能完成**80%**的日常编辑工作！

---

**最后建议：**
1. 不要一次学太多，循序渐进
2. 多使用vimtutor练习基础
3. 每天用Vim编辑一些文件，建立肌肉记忆
4. 遇到重复操作，思考如何用Vim快捷键优化
5. 善用`.vimrc`定制适合自己的配置

**Vim的精髓：**
> "不要用鼠标，让手指留在键盘上，思考比移动更快。"

---

**最后更新：** 2026-06-25  
**适用人群：** 开发者、运维、服务器操作
