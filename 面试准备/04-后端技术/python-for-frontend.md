# Python 前端工程师速成指南

> 2-3 小时快速掌握 Python 基础，专为前端工程师设计

---

## 目录
1. [为什么前端要学 Python](#1-为什么前端要学-python)
2. [Python vs JavaScript](#2-python-vs-javascript)
3. [基础语法](#3-基础语法)
4. [数据类型与操作](#4-数据类型与操作)
5. [函数与模块](#5-函数与模块)
6. [文件操作](#6-文件操作)
7. [常用库](#7-常用库)
8. [前端场景应用](#8-前端场景应用)
9. [面试常见问题](#9-面试常见问题)

---

## 1. 为什么前端要学 Python

### 实际应用场景
```
✅ 构建工具脚本（替代复杂的 Node.js 脚本）
✅ 数据处理（爬虫、日志分析）
✅ 自动化测试（Selenium）
✅ CI/CD 脚本
✅ 图片批量处理
✅ 调用 AI API（OpenAI、Claude）
✅ 后端 API 开发（FastAPI）
```

### 面试加分
```
• 全栈能力体现
• 工具链开发经验
• 数据处理能力
• AI 技术应用
```

---

## 2. Python vs JavaScript

### 语法对比

```python
# ============= 变量声明 =============
# JavaScript
let name = 'John';
const age = 30;

# Python
name = 'John'  # 没有 let/const，直接赋值
age = 30


# ============= 数据类型 =============
# JavaScript
const arr = [1, 2, 3];
const obj = { name: 'John', age: 30 };

# Python
arr = [1, 2, 3]  # list（列表）
obj = { 'name': 'John', 'age': 30 }  # dict（字典）


# ============= 函数定义 =============
# JavaScript
function add(a, b) {
  return a + b;
}
const multiply = (a, b) => a * b;

# Python
def add(a, b):
    return a + b

multiply = lambda a, b: a * b  # lambda 表达式


# ============= 条件语句 =============
# JavaScript
if (age >= 18) {
  console.log('成年人');
} else {
  console.log('未成年');
}

# Python
if age >= 18:
    print('成年人')  # 注意缩进！
else:
    print('未成年')


# ============= 循环 =============
# JavaScript
for (let i = 0; i < 5; i++) {
  console.log(i);
}

# Python
for i in range(5):  # range(5) 生成 0-4
    print(i)


# ============= 数组操作 =============
# JavaScript
const arr = [1, 2, 3];
arr.push(4);
arr.map(x => x * 2);
arr.filter(x => x > 2);

# Python
arr = [1, 2, 3]
arr.append(4)  # 不是 push
list(map(lambda x: x * 2, arr))
list(filter(lambda x: x > 2, arr))

# 更 Pythonic 的写法（列表推导式）
[x * 2 for x in arr]  # map
[x for x in arr if x > 2]  # filter


# ============= 对象操作 =============
# JavaScript
const obj = { name: 'John', age: 30 };
console.log(obj.name);
console.log(obj['age']);

# Python
obj = { 'name': 'John', 'age': 30 }
print(obj['name'])  # 只能用 [] 访问
print(obj.get('age', 0))  # 安全访问，默认值 0


# ============= 异步操作 =============
# JavaScript
async function fetchData() {
  const res = await fetch('/api');
  return res.json();
}

# Python
import asyncio
async def fetch_data():
    # Python 也有 async/await！
    response = await some_async_call()
    return response


# ============= 模块导入 =============
# JavaScript
import { add } from './math.js';

# Python
from math import add
# 或
import math
math.add()
```

### 关键差异

| 特性 | JavaScript | Python |
|------|-----------|--------|
| 缩进 | 可选（推荐用） | **强制**（4空格） |
| 分号 | 可选 | 不需要 |
| 数组 | Array | List |
| 对象 | Object | Dictionary (dict) |
| 空值 | null, undefined | None |
| 布尔值 | true, false | True, False |
| 字符串 | 单/双引号 | 单/双/三引号 |
| 类型 | 弱类型 | 动态强类型 |

---

## 3. 基础语法

### 3.1 变量与类型

```python
# 1. 基本类型
name = 'John'  # str（字符串）
age = 30  # int（整数）
height = 1.75  # float（浮点数）
is_student = False  # bool（布尔）
nothing = None  # None（空值）

# 2. 类型检查
print(type(name))  # <class 'str'>
print(isinstance(age, int))  # True

# 3. 类型转换
age = int('30')  # 字符串转数字
price = float('19.99')
text = str(100)  # 数字转字符串

# 4. 多重赋值
x, y, z = 1, 2, 3
a = b = c = 0

# 5. 交换变量（Python 特色）
x, y = y, x  # 不需要临时变量！
```

### 3.2 字符串操作

```python
# 1. 字符串定义
single = 'Hello'
double = "World"
multi = """
多行
字符串
"""

# 2. 字符串拼接
name = 'John'
age = 30

# 方式1：+ 拼接
msg = 'My name is ' + name

# 方式2：f-string（推荐，类似 JS 模板字符串）
msg = f'My name is {name}, I am {age} years old'

# 方式3：format
msg = 'My name is {}, I am {} years old'.format(name, age)

# 3. 常用方法
text = '  Hello World  '
text.strip()  # 去空格，类似 JS 的 trim()
text.upper()  # 大写
text.lower()  # 小写
text.replace('Hello', 'Hi')  # 替换
text.split(' ')  # 分割，返回 ['Hello', 'World']
'-'.join(['a', 'b', 'c'])  # 'a-b-c'

# 4. 字符串切片（Python 特色）
text = 'Hello World'
text[0]  # 'H'（第一个字符）
text[-1]  # 'd'（最后一个字符）
text[0:5]  # 'Hello'（0-4，不包括5）
text[:5]  # 'Hello'（从开头到5）
text[6:]  # 'World'（从6到末尾）
text[::-1]  # 'dlroW olleH'（反转字符串！）
```

### 3.3 控制流

```python
# 1. if 条件
age = 20

if age < 18:
    print('未成年')
elif age < 60:  # 不是 else if！
    print('成年人')
else:
    print('老年人')

# 2. 三元表达式
status = '成年' if age >= 18 else '未成年'

# 3. for 循环
# 遍历列表
fruits = ['apple', 'banana', 'cherry']
for fruit in fruits:
    print(fruit)

# 遍历范围
for i in range(5):  # 0-4
    print(i)

for i in range(1, 6):  # 1-5
    print(i)

for i in range(0, 10, 2):  # 0, 2, 4, 6, 8（步长2）
    print(i)

# 遍历字典
person = {'name': 'John', 'age': 30}
for key in person:
    print(key, person[key])

for key, value in person.items():  # 更好的方式
    print(key, value)

# 带索引遍历
for index, fruit in enumerate(fruits):
    print(index, fruit)

# 4. while 循环
count = 0
while count < 5:
    print(count)
    count += 1  # Python 没有 count++！

# 5. break 和 continue
for i in range(10):
    if i == 5:
        break  # 跳出循环
    if i % 2 == 0:
        continue  # 跳过本次
    print(i)
```

---

## 4. 数据类型与操作

### 4.1 列表 (List)

```python
# 类似 JavaScript 的 Array

# 1. 创建列表
arr = [1, 2, 3, 4, 5]
mixed = [1, 'hello', True, None]  # 可以混合类型

# 2. 访问元素
arr[0]  # 1
arr[-1]  # 5（最后一个）
arr[1:3]  # [2, 3]（切片）

# 3. 修改元素
arr[0] = 10

# 4. 常用方法
arr.append(6)  # 末尾添加，类似 JS 的 push
arr.insert(0, 0)  # 指定位置插入
arr.extend([7, 8])  # 合并列表，类似 JS 的 concat
arr.pop()  # 删除并返回最后一个
arr.pop(0)  # 删除并返回指定索引
arr.remove(3)  # 删除指定值
arr.clear()  # 清空

# 5. 列表操作
len(arr)  # 长度
3 in arr  # 检查是否存在
arr.index(3)  # 查找索引
arr.count(3)  # 统计出现次数
arr.sort()  # 排序（原地修改）
sorted(arr)  # 返回新列表
arr.reverse()  # 反转

# 6. 列表推导式（Python 特色）
# JavaScript: arr.map(x => x * 2)
doubled = [x * 2 for x in arr]

# JavaScript: arr.filter(x => x > 3)
filtered = [x for x in arr if x > 3]

# 复杂示例
result = [x * 2 for x in arr if x % 2 == 0]
```

### 4.2 元组 (Tuple)

```python
# 不可变的列表（类似 JS 的 const arr = Object.freeze([...])）

# 1. 创建元组
point = (10, 20)
single = (1,)  # 单元素元组，注意逗号

# 2. 访问
point[0]  # 10
x, y = point  # 解构

# 3. 不能修改
point[0] = 5  # ❌ TypeError

# 4. 用途
# 返回多个值
def get_point():
    return (10, 20)

x, y = get_point()

# 字典的键（列表不能做键）
positions = {(0, 0): 'origin', (1, 1): 'point'}
```

### 4.3 字典 (Dictionary)

```python
# 类似 JavaScript 的 Object

# 1. 创建字典
person = {
    'name': 'John',
    'age': 30,
    'city': 'Beijing'
}

# 空字典
empty = {}
empty = dict()

# 2. 访问
person['name']  # 'John'
person.get('age')  # 30
person.get('email', 'N/A')  # 安全访问，默认值

# 3. 修改
person['age'] = 31
person['email'] = 'john@example.com'  # 添加新键

# 4. 删除
del person['city']
person.pop('age')  # 删除并返回值

# 5. 常用方法
person.keys()  # 所有键
person.values()  # 所有值
person.items()  # 所有键值对

'name' in person  # 检查键是否存在
len(person)  # 长度

# 6. 遍历
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(key, value)

# 7. 字典推导式
# JavaScript: Object.fromEntries(arr.map(x => [x, x * 2]))
squares = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
```

### 4.4 集合 (Set)

```python
# 类似 JavaScript 的 Set

# 1. 创建集合
nums = {1, 2, 3, 4, 5}
nums = set([1, 2, 2, 3, 3])  # {1, 2, 3}（自动去重）

# 2. 操作
nums.add(6)  # 添加
nums.remove(1)  # 删除（不存在会报错）
nums.discard(1)  # 删除（不存在不报错）
1 in nums  # 检查存在

# 3. 集合运算
a = {1, 2, 3}
b = {3, 4, 5}

a | b  # 并集 {1, 2, 3, 4, 5}
a & b  # 交集 {3}
a - b  # 差集 {1, 2}
a ^ b  # 对称差 {1, 2, 4, 5}

# 4. 用途：数组去重
arr = [1, 2, 2, 3, 3]
unique = list(set(arr))  # [1, 2, 3]
```

---

## 5. 函数与模块

### 5.1 函数定义

```python
# 1. 基础函数
def greet(name):
    return f'Hello, {name}!'

print(greet('John'))

# 2. 默认参数
def greet(name, greeting='Hello'):
    return f'{greeting}, {name}!'

greet('John')  # Hello, John!
greet('John', 'Hi')  # Hi, John!

# 3. 可变参数
def sum_all(*args):  # 类似 JS 的 ...args
    return sum(args)

sum_all(1, 2, 3, 4)  # 10

# 4. 关键字参数
def create_user(**kwargs):  # 类似 JS 的 ...obj
    return kwargs

create_user(name='John', age=30)
# {'name': 'John', 'age': 30}

# 5. 混合使用
def func(a, b, *args, **kwargs):
    print(a, b)
    print(args)
    print(kwargs)

func(1, 2, 3, 4, x=5, y=6)
# 1 2
# (3, 4)
# {'x': 5, 'y': 6}

# 6. Lambda 函数
add = lambda a, b: a + b
double = lambda x: x * 2

# 常用于高阶函数
nums = [1, 2, 3]
list(map(lambda x: x * 2, nums))  # [2, 4, 6]
```

### 5.2 模块导入

```python
# 1. 导入整个模块
import math
print(math.sqrt(16))  # 4.0

# 2. 导入特定函数
from math import sqrt, pi
print(sqrt(16))
print(pi)

# 3. 导入所有（不推荐）
from math import *

# 4. 别名
import numpy as np
from math import sqrt as square_root

# 5. 自定义模块
# math_utils.py
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

# main.py
from math_utils import add
print(add(1, 2))

# 6. 包（Package）
# mypackage/
#   __init__.py
#   module1.py
#   module2.py

from mypackage import module1
from mypackage.module1 import func
```

### 5.3 类与对象

```python
# 1. 定义类
class Person:
    # 构造函数
    def __init__(self, name, age):
        self.name = name  # self 类似 JS 的 this
        self.age = age
    
    # 方法
    def greet(self):
        return f'Hello, I am {self.name}'
    
    # 类方法
    @classmethod
    def from_birth_year(cls, name, birth_year):
        age = 2026 - birth_year
        return cls(name, age)
    
    # 静态方法
    @staticmethod
    def is_adult(age):
        return age >= 18

# 2. 使用
person = Person('John', 30)
print(person.name)
print(person.greet())

person2 = Person.from_birth_year('Jane', 1995)
print(Person.is_adult(20))

# 3. 继承
class Student(Person):
    def __init__(self, name, age, grade):
        super().__init__(name, age)  # 调用父类构造函数
        self.grade = grade
    
    # 重写方法
    def greet(self):
        return f'Hi, I am {self.name}, grade {self.grade}'

student = Student('Tom', 18, 12)
```

---

## 6. 文件操作

### 6.1 读写文件

```python
# 1. 读取文件
# 方式1：手动关闭
file = open('data.txt', 'r', encoding='utf-8')
content = file.read()
file.close()

# 方式2：with 语句（推荐，自动关闭）
with open('data.txt', 'r', encoding='utf-8') as file:
    content = file.read()

# 2. 读取方式
with open('data.txt', 'r') as f:
    content = f.read()  # 读取全部
    line = f.readline()  # 读取一行
    lines = f.readlines()  # 读取所有行，返回列表

# 3. 逐行读取（处理大文件）
with open('large-file.txt', 'r') as f:
    for line in f:
        print(line.strip())

# 4. 写入文件
with open('output.txt', 'w') as f:
    f.write('Hello World\n')
    f.writelines(['Line 1\n', 'Line 2\n'])

# 5. 追加内容
with open('log.txt', 'a') as f:
    f.write('New log\n')

# 6. 读写 JSON
import json

# 写入 JSON
data = {'name': 'John', 'age': 30}
with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)

# 读取 JSON
with open('data.json', 'r') as f:
    data = json.load(f)

# 字符串转换
json_str = json.dumps(data)
data = json.loads(json_str)

# 7. 文件操作
import os

os.path.exists('file.txt')  # 文件是否存在
os.path.isfile('file.txt')  # 是否是文件
os.path.isdir('folder')  # 是否是目录
os.path.getsize('file.txt')  # 文件大小
os.remove('file.txt')  # 删除文件
os.rename('old.txt', 'new.txt')  # 重命名

# 8. 目录操作
os.mkdir('new_folder')  # 创建目录
os.makedirs('a/b/c')  # 递归创建
os.listdir('.')  # 列出目录内容
os.getcwd()  # 当前工作目录
os.chdir('/path')  # 切换目录

# 9. 路径操作
from pathlib import Path

path = Path('data.txt')
path.exists()
path.is_file()
path.read_text()  # 读取文本
path.write_text('content')  # 写入文本

# 遍历目录
for file in Path('.').glob('*.py'):
    print(file)
```

---

## 7. 常用库

### 7.1 requests（HTTP 请求）

```python
# 类似 JavaScript 的 fetch/axios

import requests

# 1. GET 请求
response = requests.get('https://api.github.com/users/github')
print(response.status_code)  # 200
print(response.json())  # 自动解析 JSON

# 2. POST 请求
data = {'name': 'John', 'age': 30}
response = requests.post('https://api.example.com/users', json=data)

# 3. 请求头
headers = {'Authorization': 'Bearer token'}
response = requests.get('https://api.example.com', headers=headers)

# 4. 查询参数
params = {'page': 1, 'limit': 10}
response = requests.get('https://api.example.com/users', params=params)

# 5. 错误处理
try:
    response = requests.get('https://api.example.com')
    response.raise_for_status()  # 检查状态码
    data = response.json()
except requests.exceptions.RequestException as e:
    print(f'请求失败: {e}')

# 6. 下载文件
response = requests.get('https://example.com/image.jpg')
with open('image.jpg', 'wb') as f:
    f.write(response.content)
```

### 7.2 常用内置库

```python
# 1. datetime（日期时间）
from datetime import datetime, timedelta

now = datetime.now()  # 当前时间
print(now.strftime('%Y-%m-%d %H:%M:%S'))  # 格式化

# 解析字符串
dt = datetime.strptime('2026-06-11', '%Y-%m-%d')

# 时间运算
tomorrow = now + timedelta(days=1)
week_ago = now - timedelta(weeks=1)

# 2. random（随机数）
import random

random.randint(1, 10)  # 1-10 随机整数
random.random()  # 0-1 随机浮点数
random.choice([1, 2, 3])  # 随机选择
random.shuffle([1, 2, 3])  # 打乱列表

# 3. re（正则表达式）
import re

pattern = r'\d+'  # 匹配数字
text = 'I have 3 apples and 5 oranges'

re.findall(pattern, text)  # ['3', '5']
re.search(pattern, text).group()  # '3'
re.sub(r'\d+', 'X', text)  # 'I have X apples and X oranges'

# 4. collections
from collections import Counter, defaultdict

# 计数器
words = ['apple', 'banana', 'apple', 'cherry']
counter = Counter(words)
print(counter)  # Counter({'apple': 2, 'banana': 1, 'cherry': 1})

# 默认字典
dd = defaultdict(list)
dd['fruits'].append('apple')  # 自动创建列表

# 5. itertools（迭代工具）
from itertools import chain, combinations

list(chain([1, 2], [3, 4]))  # [1, 2, 3, 4]（展平）
list(combinations([1, 2, 3], 2))  # [(1, 2), (1, 3), (2, 3)]
```

---

## 8. 前端场景应用

### 8.1 批量处理图片

```python
from PIL import Image
import os

def resize_images(input_dir, output_dir, size=(800, 600)):
    """批量调整图片大小"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    for filename in os.listdir(input_dir):
        if filename.endswith(('.jpg', '.png', '.jpeg')):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, filename)
            
            img = Image.open(input_path)
            img.thumbnail(size)  # 保持比例
            img.save(output_path)
            print(f'处理完成: {filename}')

# 使用
resize_images('./images', './images_resized')
```

### 8.2 日志分析

```python
import re
from collections import Counter

def analyze_logs(log_file):
    """分析 Nginx 日志"""
    ips = []
    urls = []
    status_codes = []
    
    with open(log_file, 'r') as f:
        for line in f:
            # 提取 IP
            ip = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
            if ip:
                ips.append(ip.group(1))
            
            # 提取 URL
            url = re.search(r'"GET ([^ ]+)', line)
            if url:
                urls.append(url.group(1))
            
            # 提取状态码
            status = re.search(r'" (\d{3}) ', line)
            if status:
                status_codes.append(status.group(1))
    
    print('Top 10 IPs:', Counter(ips).most_common(10))
    print('Top 10 URLs:', Counter(urls).most_common(10))
    print('Status codes:', Counter(status_codes))

# 使用
analyze_logs('access.log')
```

### 8.3 自动化部署脚本

```python
import subprocess
import sys

def deploy():
    """自动化部署流程"""
    steps = [
        ('拉取代码', 'git pull origin main'),
        ('安装依赖', 'npm install'),
        ('构建项目', 'npm run build'),
        ('重启服务', 'pm2 restart app'),
    ]
    
    for step_name, command in steps:
        print(f'执行: {step_name}...')
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f'❌ {step_name} 失败:')
            print(result.stderr)
            sys.exit(1)
        
        print(f'✅ {step_name} 成功')
    
    print('🎉 部署完成!')

if __name__ == '__main__':
    deploy()
```

### 8.4 API 数据处理

```python
import requests
import json

def fetch_github_repos(username):
    """获取 GitHub 用户的仓库列表"""
    url = f'https://api.github.com/users/{username}/repos'
    response = requests.get(url)
    
    if response.status_code != 200:
        print('请求失败')
        return []
    
    repos = response.json()
    
    # 提取关键信息
    result = []
    for repo in repos:
        result.append({
            'name': repo['name'],
            'stars': repo['stargazers_count'],
            'language': repo['language'],
            'url': repo['html_url']
        })
    
    # 按 stars 排序
    result.sort(key=lambda x: x['stars'], reverse=True)
    
    # 保存到文件
    with open(f'{username}_repos.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    return result

# 使用
repos = fetch_github_repos('github')
for repo in repos[:5]:  # 前5个
    print(f"{repo['name']}: {repo['stars']} stars")
```

### 8.5 调用 AI API

```python
import requests
import os

def call_claude_api(prompt):
    """调用 Claude API"""
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    
    headers = {
        'x-api-key': api_key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
    }
    
    data = {
        'model': 'claude-sonnet-4-6',
        'max_tokens': 1024,
        'messages': [
            {'role': 'user', 'content': prompt}
        ]
    }
    
    response = requests.post(
        'https://api.anthropic.com/v1/messages',
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        return response.json()['content'][0]['text']
    else:
        print(f'错误: {response.status_code}')
        return None

# 使用
result = call_claude_api('用 Python 写一个冒泡排序')
print(result)
```

---

## 9. 面试常见问题

### Q1: Python 和 JavaScript 的主要区别？

```
1. 缩进：Python 强制缩进，JS 可选
2. 类型：Python 动态强类型，JS 弱类型
3. 异步：Python 有 asyncio，JS 原生支持
4. 运行环境：Python 多用于后端/脚本，JS 前后端都可以
5. 语法：Python 更简洁，JS 更灵活
```

### Q2: Python 的优势和劣势？

```
优势：
✅ 语法简洁易学
✅ 库丰富（数据处理、AI、科学计算）
✅ 适合脚本和自动化
✅ 社区活跃

劣势：
❌ 执行速度较慢（相比 C/Java）
❌ GIL 限制多线程（CPU 密集型）
❌ 移动开发支持弱
```

### Q3: 列表和元组的区别？

```python
# 列表（List）- 可变
lst = [1, 2, 3]
lst[0] = 10  # ✅ 可以修改

# 元组（Tuple）- 不可变
tpl = (1, 2, 3)
tpl[0] = 10  # ❌ 报错

# 用途：
# 列表：需要修改的数据
# 元组：不可变数据、函数返回多个值、字典的键
```

### Q4: Python 如何处理异步？

```python
import asyncio

# 1. 定义异步函数
async def fetch_data(url):
    await asyncio.sleep(1)  # 模拟网络请求
    return f'Data from {url}'

# 2. 运行异步函数
async def main():
    result = await fetch_data('https://api.example.com')
    print(result)

asyncio.run(main())

# 3. 并发请求
async def fetch_all():
    tasks = [
        fetch_data('url1'),
        fetch_data('url2'),
        fetch_data('url3')
    ]
    results = await asyncio.gather(*tasks)  # 类似 Promise.all
    return results

asyncio.run(fetch_all())
```

### Q5: 如何处理异常？

```python
# 1. try-except（类似 JS 的 try-catch）
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f'错误: {e}')
except Exception as e:
    print(f'未知错误: {e}')
finally:
    print('总是执行')

# 2. 抛出异常
def divide(a, b):
    if b == 0:
        raise ValueError('除数不能为0')
    return a / b

# 3. 自定义异常
class CustomError(Exception):
    pass

raise CustomError('自定义错误消息')
```

### Q6: Python 的 GIL 是什么？

```
GIL (Global Interpreter Lock) 全局解释器锁

影响：
• 同一时刻只有一个线程执行 Python 字节码
• 多线程无法利用多核 CPU（CPU 密集型）
• I/O 密集型影响不大

解决方案：
1. 使用多进程（multiprocessing）
2. 使用 C 扩展
3. 使用其他 Python 实现（PyPy、Jython）
```

### Q7: 前端工程师如何在项目中使用 Python？

```
1. 构建工具脚本
   • 替代复杂的 Node.js 脚本
   • 批量处理文件

2. 数据处理
   • 日志分析
   • 数据转换
   • 爬虫

3. 自动化
   • 部署脚本
   • 测试脚本
   • CI/CD 流程

4. BFF 层
   • FastAPI 写 API
   • 数据聚合

5. AI 集成
   • 调用 LLM API
   • 图片处理
```

---

## 快速参考

### 语法速查

```python
# 变量
x = 10

# 字符串
f'Hello {name}'

# 列表
[1, 2, 3]
[x * 2 for x in arr]

# 字典
{'name': 'John', 'age': 30}

# 条件
if x > 0:
    print('positive')

# 循环
for i in range(10):
    print(i)

# 函数
def add(a, b):
    return a + b

# 类
class Person:
    def __init__(self, name):
        self.name = name

# 导入
import math
from math import sqrt

# 异常
try:
    # code
except Exception as e:
    print(e)

# 文件
with open('file.txt', 'r') as f:
    content = f.read()

# HTTP
import requests
response = requests.get(url)
```

---

## 学习路径

### 1小时速成（够用）
```
✅ 基础语法（变量、控制流）
✅ 数据类型（列表、字典）
✅ 函数定义
✅ 文件读写
✅ requests 库
```

### 3小时深入（面试）
```
上面内容 +
✅ 类与对象
✅ 常用库（datetime、re）
✅ 异常处理
✅ 列表推导式
✅ 实战案例
```

### 长期学习（精通）
```
上面内容 +
✅ 装饰器
✅ 生成器
✅ 协程
✅ 多线程/多进程
✅ FastAPI/Django
✅ 数据分析（pandas）
```

---

## 总结

### 前端工程师学 Python 的要点
1. **对比学习**：始终和 JavaScript 对比
2. **实用为主**：聚焦实际应用场景
3. **工具思维**：把 Python 当工具，不是主语言
4. **快速上手**：2-3小时就能写脚本
5. **按需深入**：遇到问题再查文档

### 面试策略
1. 承认 Python 不是主力
2. 强调实际应用经验（脚本、自动化）
3. 展示学习能力（能快速上手）
4. 结合前端背景（BFF、全栈）

---

**记住**：作为前端工程师，Python 是**辅助工具**，不需要精通，够用就好！🚀
