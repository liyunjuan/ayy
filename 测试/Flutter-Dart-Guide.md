# Flutter & Dart 开发指南

> 跨平台移动应用开发框架
> 更新时间：2026-06-23

---

## 目录

1. [概述](#1-概述)
2. [Dart语言基础](#2-dart语言基础)
3. [Flutter核心概念](#3-flutter核心概念)
4. [常用Widget](#4-常用widget)
5. [状态管理](#5-状态管理)
6. [实战示例](#6-实战示例)
7. [与前端对比](#7-与前端对比)

---

## 1. 概述

### 1.1 什么是Flutter

**Flutter：** Google开发的跨平台UI框架

**特点：**
- 一套代码运行在iOS、Android、Web、Desktop
- 使用Dart语言编写
- 自绘引擎（Skia）渲染
- 热重载开发

### 1.2 什么是Dart

**Dart：** Google开发的编程语言

**特点：**
- 强类型、面向对象
- 支持JIT和AOT编译
- 空安全（Null Safety）
- 可编译为Native代码或JavaScript

### 1.3 Flutter vs React Native

| 特性 | Flutter | React Native |
|-----|---------|--------------|
| **语言** | Dart | JavaScript/TypeScript |
| **渲染方式** | 自绘引擎（Skia） | 原生组件桥接 |
| **性能** | ⚡️ 接近原生 | 略慢（JS桥接） |
| **热重载** | ✅ 极快 | ✅ 快 |
| **包体积** | 较大（~4MB） | 较小 |
| **UI一致性** | ✅ 完全一致 | ⚠️ 依赖平台 |
| **生态成熟度** | 较新（2017） | 成熟（2015） |
| **学习曲线** | 中等（新语言） | 低（前端友好） |
| **适用场景** | 高性能UI | 快速开发 |

---

## 2. Dart语言基础

### 2.1 变量声明

```dart
// 类型推断
var name = 'Alice';
var age = 25;

// 显式类型
String name = 'Alice';
int age = 25;
double price = 99.99;
bool isActive = true;

// 常量
final currentTime = DateTime.now();  // 运行时常量
const PI = 3.14;                     // 编译时常量

// 区别
final list1 = [1, 2, 3];    // ✅ 可以
const list2 = [1, 2, 3];    // ✅ 可以
list1.add(4);               // ✅ 可以修改内容
// list2.add(4);            // ❌ 不能修改
```

### 2.2 空安全（Null Safety）

```dart
// 可空类型（?）
String? name;              // 可以是null
String name = 'Alice';     // 不能是null

// 空安全操作符
String? name;

name?.length;              // 空安全调用（name为null返回null）
name ?? 'Default';         // 空值合并
name!.length;              // 断言非空（危险，可能抛异常）

// 实际应用
class User {
  String? email;
  
  String getEmailDomain() {
    // 方式1：空检查
    if (email != null) {
      return email!.split('@')[1];
    }
    return 'unknown';
    
    // 方式2：空安全链式调用
    return email?.split('@').elementAt(1) ?? 'unknown';
  }
}
```

### 2.3 函数

```dart
// 基本函数
void greet(String name) {
  print('Hello $name');
}

// 返回值
String greet(String name) {
  return 'Hello $name';
}

// 箭头函数（单表达式）
int add(int a, int b) => a + b;
void log(String msg) => print(msg);

// 可选位置参数
String greet(String name, [String? title]) {
  return title != null ? '$title $name' : name;
}

greet('Alice');          // 'Alice'
greet('Alice', 'Dr.');   // 'Dr. Alice'

// 命名参数
void createUser({
  required String name,    // 必需
  int age = 0,            // 默认值
  String? email,          // 可选
}) {
  print('$name, $age, $email');
}

createUser(name: 'Alice', age: 25);

// 函数作为参数
void forEach(List<int> list, Function(int) callback) {
  for (var item in list) {
    callback(item);
  }
}

forEach([1, 2, 3], (num) => print(num));
```

### 2.4 类和对象

```dart
// 基本类
class Person {
  String name;
  int age;
  
  // 构造函数简写
  Person(this.name, this.age);
  
  // 方法
  void greet() {
    print('Hello, I am $name');
  }
}

// 使用
var person = Person('Alice', 25);
person.greet();

// 命名构造函数
class Point {
  double x, y;
  
  Point(this.x, this.y);
  
  // 命名构造函数
  Point.origin() : x = 0, y = 0;
  Point.fromJson(Map<String, double> json)
      : x = json['x']!,
        y = json['y']!;
}

var origin = Point.origin();
var p = Point.fromJson({'x': 1.0, 'y': 2.0});

// Getter和Setter
class Rectangle {
  double width, height;
  
  Rectangle(this.width, this.height);
  
  // Getter
  double get area => width * height;
  
  // Setter
  set area(double value) {
    width = value / height;
  }
}

var rect = Rectangle(10, 5);
print(rect.area);  // 50
rect.area = 100;
print(rect.width); // 20

// 继承
class Student extends Person {
  String school;
  
  Student(String name, int age, this.school) : super(name, age);
  
  @override
  void greet() {
    print('Hi, I am $name from $school');
  }
}
```

### 2.5 集合

```dart
// List（数组）
var list = [1, 2, 3];
List<String> names = ['Alice', 'Bob'];

list.add(4);
list.remove(2);
list.length;

// Set（唯一集合）
var set = {1, 2, 3};
Set<String> names = {'Alice', 'Bob'};

set.add(1);  // 无效，已存在

// Map（字典）
var map = {
  'name': 'Alice',
  'age': 25,
};

Map<String, dynamic> user = {
  'name': 'Alice',
  'age': 25,
};

map['email'] = 'alice@example.com';
print(map['name']);

// 集合操作
var numbers = [1, 2, 3, 4, 5];

numbers.map((n) => n * 2);           // [2, 4, 6, 8, 10]
numbers.where((n) => n > 3);         // [4, 5]
numbers.reduce((a, b) => a + b);     // 15
numbers.any((n) => n > 3);           // true
numbers.every((n) => n > 0);         // true
```

### 2.6 异步编程

```dart
// Future（类似Promise）
Future<String> fetchData() async {
  await Future.delayed(Duration(seconds: 1));
  return 'Data loaded';
}

// 使用async/await
void main() async {
  print('Loading...');
  String data = await fetchData();
  print(data);
}

// then/catchError
fetchData()
  .then((data) => print(data))
  .catchError((error) => print('Error: $error'));

// 并行请求
Future.wait([
  fetchData(),
  fetchData(),
  fetchData(),
]).then((results) => print(results));

// Stream（数据流）
Stream<int> countStream() async* {
  for (int i = 1; i <= 5; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// 监听Stream
countStream().listen((value) {
  print(value);  // 每秒输出 1, 2, 3, 4, 5
});
```

---

## 3. Flutter核心概念

### 3.1 Widget（一切皆Widget）

```dart
// Widget是Flutter的核心概念
// 所有UI元素都是Widget

import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: HomePage(),
    );
  }
}
```

### 3.2 StatelessWidget（无状态组件）

```dart
// 不可变的Widget
class Greeting extends StatelessWidget {
  final String name;
  
  const Greeting({Key? key, required this.name}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Text('Hello, $name!');
  }
}

// 使用
Greeting(name: 'Alice')
```

### 3.3 StatefulWidget（有状态组件）

```dart
// 可变状态的Widget
class Counter extends StatefulWidget {
  @override
  _CounterState createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;
  
  void _increment() {
    setState(() {  // 触发重建
      _count++;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $_count'),
        ElevatedButton(
          onPressed: _increment,
          child: Text('Increment'),
        ),
      ],
    );
  }
}
```

### 3.4 生命周期

```dart
class MyWidget extends StatefulWidget {
  @override
  _MyWidgetState createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  @override
  void initState() {
    super.initState();
    // 初始化（类似componentDidMount）
    print('initState');
  }
  
  @override
  void didUpdateWidget(MyWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Widget更新时调用
    print('didUpdateWidget');
  }
  
  @override
  void dispose() {
    // 销毁时调用（类似componentWillUnmount）
    print('dispose');
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
```

---

## 4. 常用Widget

### 4.1 布局Widget

```dart
// Container - 容器
Container(
  width: 200,
  height: 100,
  padding: EdgeInsets.all(16),
  margin: EdgeInsets.symmetric(vertical: 10),
  decoration: BoxDecoration(
    color: Colors.blue,
    borderRadius: BorderRadius.circular(8),
    boxShadow: [
      BoxShadow(
        color: Colors.grey,
        blurRadius: 5,
        offset: Offset(2, 2),
      ),
    ],
  ),
  child: Text('Hello'),
)

// Row - 水平布局
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    Text('Left'),
    Text('Center'),
    Text('Right'),
  ],
)

// Column - 垂直布局
Column(
  children: [
    Text('Top'),
    Text('Middle'),
    Text('Bottom'),
  ],
)

// Stack - 堆叠布局
Stack(
  children: [
    Container(color: Colors.blue, width: 200, height: 200),
    Positioned(
      top: 10,
      left: 10,
      child: Text('Overlay'),
    ),
  ],
)

// ListView - 列表
ListView(
  children: [
    ListTile(title: Text('Item 1')),
    ListTile(title: Text('Item 2')),
    ListTile(title: Text('Item 3')),
  ],
)

// ListView.builder - 动态列表
ListView.builder(
  itemCount: 100,
  itemBuilder: (context, index) {
    return ListTile(title: Text('Item $index'));
  },
)

// GridView - 网格
GridView.count(
  crossAxisCount: 2,  // 2列
  children: List.generate(20, (index) {
    return Card(
      child: Center(child: Text('Item $index')),
    );
  }),
)
```

### 4.2 基础Widget

```dart
// Text - 文本
Text(
  'Hello Flutter',
  style: TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Colors.blue,
  ),
)

// Image - 图片
Image.network('https://example.com/image.jpg')
Image.asset('assets/images/logo.png')

// Icon - 图标
Icon(Icons.home, color: Colors.blue, size: 30)

// ElevatedButton - 按钮
ElevatedButton(
  onPressed: () {
    print('Button pressed');
  },
  child: Text('Click Me'),
)

// TextField - 输入框
TextField(
  decoration: InputDecoration(
    labelText: 'Username',
    hintText: 'Enter your username',
    border: OutlineInputBorder(),
  ),
  onChanged: (value) {
    print('Input: $value');
  },
)

// Card - 卡片
Card(
  elevation: 5,
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Text('Card Content'),
  ),
)
```

### 4.3 导航

```dart
// 页面跳转
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => SecondPage()),
);

// 返回
Navigator.pop(context);

// 命名路由
MaterialApp(
  routes: {
    '/': (context) => HomePage(),
    '/second': (context) => SecondPage(),
  },
)

Navigator.pushNamed(context, '/second');
```

---

## 5. 状态管理

### 5.1 setState（内置）

```dart
class CounterPage extends StatefulWidget {
  @override
  _CounterPageState createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('$_count'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          setState(() {
            _count++;
          });
        },
        child: Icon(Icons.add),
      ),
    );
  }
}
```

### 5.2 Provider（推荐）

```dart
// 1. 定义Model
class Counter with ChangeNotifier {
  int _count = 0;
  
  int get count => _count;
  
  void increment() {
    _count++;
    notifyListeners();  // 通知更新
  }
}

// 2. 提供Provider
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => Counter(),
      child: MyApp(),
    ),
  );
}

// 3. 使用
class CounterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Consumer<Counter>(
          builder: (context, counter, child) {
            return Text('${counter.count}');
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.read<Counter>().increment();
        },
        child: Icon(Icons.add),
      ),
    );
  }
}
```

### 5.3 其他状态管理方案

```dart
// Riverpod - Provider的改进版
// BLoC - 基于Stream的状态管理
// GetX - 轻量级状态管理
// Redux - 单向数据流
```

---

## 6. 实战示例

### 6.1 完整计数器应用

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Counter App',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: CounterPage(),
    );
  }
}

class CounterPage extends StatefulWidget {
  @override
  _CounterPageState createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;
  
  void _increment() {
    setState(() {
      _count++;
    });
  }
  
  void _decrement() {
    setState(() {
      _count--;
    });
  }
  
  void _reset() {
    setState(() {
      _count = 0;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Counter App'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _reset,
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Current Count:',
              style: TextStyle(fontSize: 20),
            ),
            SizedBox(height: 16),
            Text(
              '$_count',
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.bold,
                color: _count > 0 ? Colors.green : Colors.red,
              ),
            ),
            SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FloatingActionButton(
                  onPressed: _decrement,
                  child: Icon(Icons.remove),
                  heroTag: 'decrement',
                ),
                SizedBox(width: 16),
                FloatingActionButton(
                  onPressed: _increment,
                  child: Icon(Icons.add),
                  heroTag: 'increment',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

### 6.2 API请求示例

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class User {
  final int id;
  final String name;
  final String email;
  
  User({required this.id, required this.name, required this.email});
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }
}

class UserListPage extends StatefulWidget {
  @override
  _UserListPageState createState() => _UserListPageState();
}

class _UserListPageState extends State<UserListPage> {
  List<User> users = [];
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    fetchUsers();
  }
  
  Future<void> fetchUsers() async {
    final response = await http.get(
      Uri.parse('https://jsonplaceholder.typicode.com/users'),
    );
    
    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      setState(() {
        users = data.map((json) => User.fromJson(json)).toList();
        isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Users')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: users.length,
              itemBuilder: (context, index) {
                final user = users[index];
                return ListTile(
                  title: Text(user.name),
                  subtitle: Text(user.email),
                );
              },
            ),
    );
  }
}
```

---

## 7. 与前端对比

### 7.1 语法对比

```javascript
// React/Vue
<View style={styles.container}>
  <Text>{count}</Text>
  <Button onPress={() => setCount(count + 1)} />
</View>

// Flutter
Container(
  child: Column(
    children: [
      Text('$count'),
      ElevatedButton(
        onPressed: () => setState(() { count++; }),
        child: Text('Increment'),
      ),
    ],
  ),
)
```

### 7.2 概念对比

| 概念 | React | Flutter |
|-----|-------|---------|
| **组件** | Component | Widget |
| **状态** | useState | setState |
| **副作用** | useEffect | initState/dispose |
| **列表渲染** | map() | ListView.builder |
| **条件渲染** | &&, ? : | condition ? a : b |
| **样式** | StyleSheet | Container + decoration |
| **导航** | React Navigation | Navigator |
| **状态管理** | Redux/Context | Provider/BLoC |

### 7.3 项目结构对比

```
React Native:
├── src/
│   ├── components/
│   ├── screens/
│   ├── services/
│   └── App.js
└── package.json

Flutter:
├── lib/
│   ├── widgets/
│   ├── screens/
│   ├── models/
│   └── main.dart
└── pubspec.yaml
```

---

## 8. 优势与劣势

### 优势

```
✅ 性能优秀（自绘引擎，无JS桥接）
✅ UI一致性强（完全控制渲染）
✅ 热重载极快
✅ Google支持和维护
✅ Widget丰富且可组合
✅ 适合复杂动画和高性能UI
```

### 劣势

```
❌ 生态较新（2017年）
❌ 需要学习新语言（Dart）
❌ 包体积大（约4MB基础体积）
❌ 前端开发者有学习成本
❌ Web支持还不够成熟
❌ 部分原生功能需要Platform Channel
```

---

## 9. 学习路径

```
1. Dart基础
   ↓
2. Flutter Widget
   ↓
3. 布局和样式
   ↓
4. 状态管理
   ↓
5. 网络请求和数据处理
   ↓
6. 导航和路由
   ↓
7. 原生功能集成
   ↓
8. 性能优化和打包发布
```

---

## 10. 快速命令

```bash
# 安装Flutter
# 下载：https://flutter.dev

# 检查环境
flutter doctor

# 创建项目
flutter create my_app

# 运行
flutter run

# 构建
flutter build apk        # Android
flutter build ios        # iOS
flutter build web        # Web

# 依赖管理
flutter pub get          # 安装依赖
flutter pub upgrade      # 更新依赖

# 清理
flutter clean
```

---

## 总结

**Flutter适合：**
- 需要高性能跨平台应用
- UI要求高、动画复杂
- 团队愿意学习新技术栈

**React Native适合：**
- 前端团队转移动端
- 快速开发MVP
- 依赖大量原生组件

**选择建议：**
- 新项目 + 性能要求高 → Flutter
- 前端团队 + 快速开发 → React Native
- 已有Web代码 → 考虑跨平台方案或PWA

---

**文档维护：** 本文档应根据Flutter版本更新
**官方文档：** https://flutter.dev
**Dart文档：** https://dart.dev
