# Java 5年工作经验面试指南

> 系统化整理 Java 中高级面试知识点，涵盖核心基础、框架原理、并发编程、JVM调优、分布式系统等

---

## 📋 目录

- [01. Java 核心基础](#01-java-核心基础)
- [02. 集合框架](#02-集合框架)
- [03. 并发编程](#03-并发编程)
- [04. JVM 虚拟机](#04-jvm-虚拟机)
- [05. Spring 框架](#05-spring-框架)
- [06. 数据库与持久层](#06-数据库与持久层)
- [07. 分布式系统](#07-分布式系统)
- [08. 消息队列](#08-消息队列)
- [09. 微服务架构](#09-微服务架构)
- [10. 性能优化与调优](#10-性能优化与调优)
- [11. 设计模式](#11-设计模式)
- [12. 实战场景题](#12-实战场景题)

---

## 01. Java 核心基础

### 1.1 面向对象

#### Q: Java 三大特性（封装、继承、多态）

**封装（Encapsulation）**
```java
public class Account {
    // 私有字段，外部无法直接访问
    private double balance;
    
    // 公共方法提供受控访问
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
    
    public double getBalance() {
        return balance;
    }
}
```

**继承（Inheritance）**
```java
public class Animal {
    protected String name;
    
    public void eat() {
        System.out.println(name + " is eating");
    }
}

public class Dog extends Animal {
    @Override
    public void eat() {
        System.out.println(name + " is eating dog food");
    }
    
    public void bark() {
        System.out.println("Woof!");
    }
}
```

**多态（Polymorphism）**
```java
// 编译时多态（方法重载）
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    public double add(double a, double b) {
        return a + b;
    }
}

// 运行时多态（方法重写）
Animal animal = new Dog();
animal.eat(); // 调用 Dog 的 eat 方法
```

---

### 1.2 String 相关

#### Q: String、StringBuilder、StringBuffer 区别

```java
// String - 不可变，线程安全
String s1 = "hello";
String s2 = s1 + " world"; // 创建新对象

// StringBuilder - 可变，线程不安全，效率高
StringBuilder sb = new StringBuilder("hello");
sb.append(" world"); // 原对象修改

// StringBuffer - 可变，线程安全（synchronized），效率较低
StringBuffer sbf = new StringBuffer("hello");
sbf.append(" world");
```

**性能对比**：
- 单线程大量拼接：`StringBuilder` > `StringBuffer` > `String`
- 多线程：使用 `StringBuffer` 或 `StringBuilder + 外部同步`
- 少量拼接：`String` 即可（编译器优化）

#### Q: String 常量池机制

```java
// 字面量直接进常量池
String s1 = "hello";
String s2 = "hello";
System.out.println(s1 == s2); // true

// new 创建在堆上
String s3 = new String("hello");
System.out.println(s1 == s3); // false

// intern() 手动入池
String s4 = s3.intern();
System.out.println(s1 == s4); // true
```

**注意**：
- JDK 7+ 常量池从永久代移到堆
- `intern()` 在堆中已有时返回引用，否则加入常量池

---

### 1.3 equals 与 hashCode

#### Q: 为什么重写 equals 必须重写 hashCode？

```java
public class User {
    private Long id;
    private String name;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

**原因**：
1. **HashMap/HashSet 依赖 hashCode**：
   - 先用 `hashCode()` 定位桶位置
   - 再用 `equals()` 判断是否相同
2. **违反约定的后果**：
   - 相同对象可能被放入不同桶
   - 导致集合中出现重复元素

**约定**：
- `a.equals(b) == true` → `a.hashCode() == b.hashCode()`
- 反之不成立（哈希冲突）

---

### 1.4 异常处理

#### Q: Exception 与 Error 的区别

```
Throwable
├── Error（系统级错误，不应捕获）
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── NoClassDefFoundError
└── Exception（可恢复异常）
    ├── RuntimeException（非检查异常）
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   └── IllegalArgumentException
    └── 检查异常（必须处理）
        ├── IOException
        ├── SQLException
        └── ClassNotFoundException
```

#### Q: try-catch-finally 执行顺序

```java
public class FinallyTest {
    public static int test() {
        try {
            return 1; // ① 保存返回值
        } catch (Exception e) {
            return 2;
        } finally {
            // ② finally 一定执行
            System.out.println("finally");
            // return 3; // ③ 会覆盖前面的返回值（不推荐）
        }
    }
    
    public static void main(String[] args) {
        System.out.println(test()); // 输出: finally  1
    }
}
```

**规则**：
1. `finally` 总会执行（除非 JVM 崩溃）
2. `finally` 中的 `return` 会覆盖 `try/catch` 中的 `return`
3. 不要在 `finally` 中使用 `return`

---

## 02. 集合框架

### 2.1 集合体系

```
Collection
├── List（有序，可重复）
│   ├── ArrayList（动态数组）
│   ├── LinkedList（双向链表）
│   └── Vector（线程安全，已过时）
├── Set（无序，不可重复）
│   ├── HashSet（基于 HashMap）
│   ├── LinkedHashSet（保持插入顺序）
│   └── TreeSet（排序，基于 TreeMap）
└── Queue（队列）
    ├── PriorityQueue（优先队列，堆实现）
    ├── ArrayDeque（双端队列）
    └── LinkedList（也实现了 Deque）

Map（键值对）
├── HashMap（哈希表）
├── LinkedHashMap（保持插入顺序）
├── TreeMap（排序，红黑树）
├── ConcurrentHashMap（线程安全）
└── Hashtable（线程安全，已过时）
```

---

### 2.2 ArrayList vs LinkedList

| 特性 | ArrayList | LinkedList |
|------|-----------|------------|
| 底层结构 | 动态数组 | 双向链表 |
| 随机访问 | O(1) | O(n) |
| 插入/删除（头尾） | O(n) | O(1) |
| 插入/删除（中间） | O(n) | O(n) |
| 内存占用 | 连续内存 | 节点指针额外开销 |
| 适用场景 | 查询多 | 插入删除多 |

```java
// ArrayList 示例
List<String> arrayList = new ArrayList<>();
arrayList.add("A"); // 尾部添加 O(1) 均摊
arrayList.get(0);   // 随机访问 O(1)

// LinkedList 示例
LinkedList<String> linkedList = new LinkedList<>();
linkedList.addFirst("A"); // 头部添加 O(1)
linkedList.addLast("B");  // 尾部添加 O(1)
linkedList.get(100);      // 随机访问 O(n)
```

---

### 2.3 HashMap 原理（重点）

#### Q: HashMap 底层结构

**JDK 1.7**：数组 + 链表  
**JDK 1.8+**：数组 + 链表 + 红黑树

```java
// 简化版 HashMap 结构
class HashMap<K,V> {
    Node<K,V>[] table; // 哈希桶数组
    int size;          // 元素个数
    float loadFactor = 0.75f; // 负载因子
    
    static class Node<K,V> {
        final int hash;
        final K key;
        V value;
        Node<K,V> next; // 链表指针
    }
}
```

#### Q: put 流程

```java
public V put(K key, V value) {
    // 1. 计算 hash
    int hash = hash(key);
    
    // 2. 定位桶位置
    int index = (table.length - 1) & hash;
    
    // 3. 检查是否需要扩容
    if (++size > threshold) {
        resize();
    }
    
    // 4. 插入节点
    Node<K,V> node = table[index];
    if (node == null) {
        // 桶为空，直接插入
        table[index] = new Node<>(hash, key, value);
    } else {
        // 遍历链表/红黑树
        while (node != null) {
            if (node.hash == hash && (node.key == key || key.equals(node.key))) {
                // 键已存在，更新值
                V oldValue = node.value;
                node.value = value;
                return oldValue;
            }
            node = node.next;
        }
        // 键不存在，添加到链表尾（JDK 1.8+ 尾插法）
    }
    return null;
}
```

#### Q: 为什么容量是 2 的幂次？

```java
// 计算桶索引的公式
index = (table.length - 1) & hash;

// 例如 length = 16 (10000)
// length - 1 = 15 (01111)
// 任何 hash 与 15 做 & 运算，结果在 [0, 15] 范围内

// 如果 length 不是 2 的幂次，如 length = 15 (01111)
// length - 1 = 14 (01110)
// hash 的最低位永远为 0，导致奇数索引位置永远不会被用到
```

**好处**：
1. `&` 运算比 `%` 更快
2. 保证索引均匀分布

#### Q: 链表何时转为红黑树？

**条件**：
- 链表长度 ≥ 8
- 数组长度 ≥ 64（否则优先扩容）

**原因**：
- 链表查询 O(n)，红黑树 O(log n)
- 红黑树节点占用空间是链表的 2 倍
- 8 是泊松分布下的最优阈值

#### Q: 扩容机制

```java
void resize() {
    // 1. 容量扩大为原来的 2 倍
    Node<K,V>[] newTable = new Node[table.length * 2];
    
    // 2. 重新计算每个节点的位置
    for (Node<K,V> node : table) {
        while (node != null) {
            int newIndex = (newTable.length - 1) & node.hash;
            // 移动到新数组
            newTable[newIndex] = node;
            node = node.next;
        }
    }
    
    table = newTable;
}
```

**JDK 1.8 优化**：
- 节点要么在原位置，要么在 `原位置 + 旧容量` 位置
- 无需重新计算 hash

---

### 2.4 ConcurrentHashMap（重点）

#### Q: JDK 1.7 vs 1.8 实现

**JDK 1.7**：Segment 分段锁
```java
// 分成 16 个 Segment，每个 Segment 是一个 HashTable
ConcurrentHashMap<K,V> {
    Segment<K,V>[] segments; // 默认 16 个
    
    static class Segment<K,V> extends ReentrantLock {
        HashEntry<K,V>[] table;
    }
}

// 并发度 = Segment 数量（默认 16）
```

**JDK 1.8**：CAS + synchronized
```java
// 取消 Segment，粒度细化到每个桶
Node<K,V>[] table;

public V put(K key, V value) {
    int hash = hash(key);
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f = tabAt(tab, i); // CAS 读取
        if (f == null) {
            // 桶为空，CAS 插入
            if (casTabAt(tab, i, null, new Node<>(hash, key, value)))
                break;
        } else {
            // 桶不为空，synchronized 锁住桶
            synchronized (f) {
                // 链表/红黑树插入
            }
        }
    }
}
```

**优势**：
- 并发度提升到桶级别
- 减少锁竞争
- 读操作几乎无锁

---

## 03. 并发编程

### 3.1 线程基础

#### Q: 创建线程的方式

```java
// 1. 继承 Thread
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread running");
    }
}
new MyThread().start();

// 2. 实现 Runnable
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Runnable running");
    }
}
new Thread(new MyRunnable()).start();

// 3. 实现 Callable（有返回值）
class MyCallable implements Callable<String> {
    @Override
    public String call() throws Exception {
        return "Callable result";
    }
}
FutureTask<String> task = new FutureTask<>(new MyCallable());
new Thread(task).start();
String result = task.get(); // 阻塞获取结果

// 4. 线程池（推荐）
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> System.out.println("Task running"));
executor.shutdown();
```

---

### 3.2 线程池（重点）

#### Q: 线程池核心参数

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                      // corePoolSize: 核心线程数
    10,                     // maximumPoolSize: 最大线程数
    60L,                    // keepAliveTime: 空闲线程存活时间
    TimeUnit.SECONDS,       // timeUnit: 时间单位
    new LinkedBlockingQueue<>(100), // workQueue: 任务队列
    Executors.defaultThreadFactory(), // threadFactory: 线程工厂
    new ThreadPoolExecutor.AbortPolicy() // handler: 拒绝策略
);
```

**执行流程**：
1. 线程数 < `corePoolSize`：创建新线程
2. 线程数 ≥ `corePoolSize`：任务入队
3. 队列满 && 线程数 < `maximumPoolSize`：创建新线程
4. 队列满 && 线程数 = `maximumPoolSize`：执行拒绝策略

#### Q: 拒绝策略

```java
// 1. AbortPolicy（默认）：抛异常
new ThreadPoolExecutor.AbortPolicy();

// 2. CallerRunsPolicy：调用者线程执行
new ThreadPoolExecutor.CallerRunsPolicy();

// 3. DiscardPolicy：静默丢弃
new ThreadPoolExecutor.DiscardPolicy();

// 4. DiscardOldestPolicy：丢弃最老任务
new ThreadPoolExecutor.DiscardOldestPolicy();
```

#### Q: 为什么不推荐 Executors 创建线程池？

```java
// FixedThreadPool 和 SingleThreadPool
// 问题：队列长度 Integer.MAX_VALUE，可能 OOM
Executors.newFixedThreadPool(10);
// 等价于
new ThreadPoolExecutor(10, 10, 0L, TimeUnit.MILLISECONDS,
    new LinkedBlockingQueue<Runnable>()); // 无界队列！

// CachedThreadPool
// 问题：最大线程数 Integer.MAX_VALUE，可能创建大量线程
Executors.newCachedThreadPool();
// 等价于
new ThreadPoolExecutor(0, Integer.MAX_VALUE, // 无限线程！
    60L, TimeUnit.SECONDS,
    new SynchronousQueue<Runnable>());
```

**推荐**：手动创建 `ThreadPoolExecutor`，明确各参数

---

### 3.3 锁机制

#### Q: synchronized vs ReentrantLock

| 特性 | synchronized | ReentrantLock |
|------|--------------|---------------|
| 类型 | JVM 层面关键字 | JDK 层面 API |
| 锁释放 | 自动释放 | 手动 unlock |
| 可中断 | 不可中断 | 可中断 |
| 公平锁 | 非公平 | 可选 |
| 条件变量 | 单个（wait/notify） | 多个（Condition） |
| 性能 | JDK 6+ 优化后相当 | 略高 |

```java
// synchronized 示例
public synchronized void method() {
    // 锁当前对象
}

synchronized (lock) {
    // 锁指定对象
}

// ReentrantLock 示例
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock(); // 必须在 finally 中释放
}
```

#### Q: volatile 关键字

**作用**：
1. **保证可见性**：修改立即刷新到主内存
2. **禁止指令重排序**：通过内存屏障

```java
// 双重检查锁单例模式
public class Singleton {
    private static volatile Singleton instance; // 必须 volatile
    
    public static Singleton getInstance() {
        if (instance == null) { // 第一次检查
            synchronized (Singleton.class) {
                if (instance == null) { // 第二次检查
                    instance = new Singleton(); // ③
                }
            }
        }
        return instance;
    }
}
```

**为什么需要 volatile？**
```java
// instance = new Singleton() 分三步：
1. memory = allocate();   // 分配内存
2. ctorInstance(memory);  // 初始化对象
3. instance = memory;     // 设置引用

// 可能发生指令重排序为 1-3-2
// 其他线程可能拿到未初始化的对象
```

#### Q: CAS（Compare-And-Swap）

```java
// AtomicInteger 基于 CAS
AtomicInteger count = new AtomicInteger(0);

// compareAndSet(expect, update)
// 如果当前值 == expect，则更新为 update
boolean success = count.compareAndSet(0, 1);

// 自增操作（线程安全）
count.incrementAndGet(); // 等价于 ++count
```

**原理**：
```java
// CAS 伪代码（底层由 CPU 指令保证原子性）
boolean compareAndSwap(int expect, int update) {
    if (value == expect) {
        value = update;
        return true;
    }
    return false;
}

// 自旋 CAS
int old, newValue;
do {
    old = count.get();
    newValue = old + 1;
} while (!count.compareAndSet(old, newValue));
```

**ABA 问题**：
```java
// 值从 A → B → A，CAS 无法感知
// 解决：AtomicStampedReference（版本号）
AtomicStampedReference<Integer> ref = new AtomicStampedReference<>(1, 0);
int stamp = ref.getStamp();
ref.compareAndSet(1, 2, stamp, stamp + 1);
```

---

### 3.4 JUC 工具类

#### Q: CountDownLatch vs CyclicBarrier

```java
// CountDownLatch：等待 N 个线程完成
CountDownLatch latch = new CountDownLatch(3);

for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        System.out.println("Thread finished");
        latch.countDown(); // 计数 -1
    }).start();
}

latch.await(); // 阻塞，直到计数为 0
System.out.println("All threads finished");

// CyclicBarrier：等待 N 个线程到达屏障点
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("All threads arrived");
});

for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        System.out.println("Thread working");
        barrier.await(); // 到达屏障点，等待其他线程
        System.out.println("Thread continue");
    }).start();
}
```

**区别**：
- `CountDownLatch`：一次性，计数减到 0 后无法重置
- `CyclicBarrier`：可重复使用，所有线程到达后自动重置

---

## 04. JVM 虚拟机

### 4.1 内存区域

```
JVM 内存结构
├── 程序计数器（线程私有）
│   └── 记录当前线程执行的字节码行号
├── 虚拟机栈（线程私有）
│   └── 栈帧（局部变量表、操作数栈、动态链接、返回地址）
├── 本地方法栈（线程私有）
│   └── Native 方法使用
├── 堆（线程共享）⭐
│   ├── 新生代（Eden + Survivor0 + Survivor1）
│   └── 老年代
└── 方法区（线程共享）
    ├── 运行时常量池
    ├── 类元信息
    └── 静态变量（JDK 7+ 移到堆）
```

---

### 4.2 垃圾回收

#### Q: 如何判断对象可回收？

**1. 引用计数法**（Python/PHP 使用）
```java
// 问题：循环引用无法回收
A.ref = B;
B.ref = A;
```

**2. 可达性分析**（Java 使用）
```
GC Roots
├── 虚拟机栈中的引用
├── 方法区中的静态变量
├── 方法区中的常量
└── Native 方法栈中的引用

从 GC Roots 出发，无法到达的对象可回收
```

#### Q: 四种引用类型

```java
// 1. 强引用：永不回收
Object obj = new Object();

// 2. 软引用：内存不足时回收
SoftReference<byte[]> soft = new SoftReference<>(new byte[1024]);
// 适用场景：缓存

// 3. 弱引用：下次 GC 时回收
WeakReference<Object> weak = new WeakReference<>(new Object());
// 适用场景：ThreadLocal、WeakHashMap

// 4. 虚引用：随时回收，无法通过引用获取对象
PhantomReference<Object> phantom = new PhantomReference<>(new Object(), queue);
// 适用场景：跟踪对象回收
```

#### Q: 垃圾回收算法

**1. 标记-清除（Mark-Sweep）**
```
优点：简单
缺点：碎片化
```

**2. 标记-复制（Mark-Copy）**
```
步骤：
1. 标记存活对象
2. 复制到另一块内存
3. 清空原内存

优点：无碎片
缺点：空间浪费（新生代使用，Eden:S0:S1 = 8:1:1）
```

**3. 标记-整理（Mark-Compact）**
```
步骤：
1. 标记存活对象
2. 移动到内存一端
3. 清理边界外内存

优点：无碎片，无空间浪费
缺点：移动对象开销大（老年代使用）
```

---

### 4.3 垃圾收集器

| 收集器 | 区域 | 算法 | 特点 | 适用场景 |
|--------|------|------|------|----------|
| Serial | 新生代 | 复制 | 单线程，STW | 单核/小内存 |
| ParNew | 新生代 | 复制 | 多线程，STW | 配合 CMS |
| Parallel Scavenge | 新生代 | 复制 | 吞吐量优先 | 后台计算 |
| Serial Old | 老年代 | 标记整理 | 单线程，STW | 单核/小内存 |
| Parallel Old | 老年代 | 标记整理 | 吞吐量优先 | 后台计算 |
| CMS | 老年代 | 标记清除 | 低延迟 | Web 应用 |
| G1 | 新生代+老年代 | 标记整理+复制 | 可预测停顿 | 大内存应用 |
| ZGC | 新生代+老年代 | 标记整理 | 超低延迟(<10ms) | JDK 11+ |

#### Q: CMS 收集器流程

```
1. 初始标记（STW）：标记 GC Roots 直接关联对象
2. 并发标记：与用户线程并发，标记所有可达对象
3. 重新标记（STW）：修正并发期间变化的标记
4. 并发清除：与用户线程并发，清理垃圾对象
```

**缺点**：
- 占用 CPU 资源
- 无法处理浮动垃圾
- 产生内存碎片

#### Q: G1 收集器

**特点**：
- 将堆分为多个 Region（每个 1-32MB）
- 新生代/老年代不再物理隔离
- 优先回收垃圾最多的 Region
- 可设置停顿时间目标（如 200ms）

```java
// G1 参数
-XX:+UseG1GC                    // 启用 G1
-XX:MaxGCPauseMillis=200        // 最大停顿时间
-XX:G1HeapRegionSize=16m        // Region 大小
```

---

### 4.4 JVM 调优

#### Q: 常用 JVM 参数

```bash
# 堆内存
-Xms4g                  # 初始堆大小
-Xmx4g                  # 最大堆大小（建议与 Xms 相同，避免动态扩容）
-Xmn2g                  # 新生代大小
-XX:SurvivorRatio=8     # Eden:Survivor = 8:1

# 垃圾收集器
-XX:+UseG1GC            # 使用 G1
-XX:+UseConcMarkSweepGC # 使用 CMS

# GC 日志
-Xlog:gc*:file=gc.log:time,uptime:filecount=10,filesize=100m

# OOM 时 Dump
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/tmp/heapdump.hprof

# 元空间
-XX:MetaspaceSize=256m      # 初始元空间大小
-XX:MaxMetaspaceSize=512m   # 最大元空间大小
```

#### Q: 如何排查 OOM？

**步骤**：
1. **分析 Dump 文件**
```bash
# 使用 MAT（Memory Analyzer Tool）
jhat heapdump.hprof
# 访问 http://localhost:7000
```

2. **查看大对象**
```bash
# 通过 MAT 的 Dominator Tree 查看占用最大的对象
```

3. **分析泄漏原因**
```java
// 常见原因：
// 1. 集合类忘记清理
Map<String, Object> cache = new HashMap<>();
cache.put(...); // 一直增长，从不清理

// 2. 静态集合持有对象引用
public class Leak {
    private static List<Object> list = new ArrayList<>();
    
    public void add(Object obj) {
        list.add(obj); // 对象永不回收
    }
}

// 3. 资源未关闭
Connection conn = getConnection();
// 忘记 conn.close()
```

---

## 05. Spring 框架

### 5.1 IoC 容器

#### Q: IoC（控制反转）与 DI（依赖注入）

**IoC**：对象创建权交给容器  
**DI**：容器自动注入依赖

```java
// 传统方式：手动创建依赖
public class UserService {
    private UserDao userDao = new UserDaoImpl(); // 强耦合
}

// Spring DI：容器注入依赖
@Service
public class UserService {
    @Autowired // 自动注入
    private UserDao userDao;
}
```

#### Q: Bean 生命周期

```
1. 实例化 Bean
   ↓
2. 设置属性（依赖注入）
   ↓
3. BeanNameAware.setBeanName()
   ↓
4. BeanFactoryAware.setBeanFactory()
   ↓
5. ApplicationContextAware.setApplicationContext()
   ↓
6. BeanPostProcessor.postProcessBeforeInitialization()
   ↓
7. @PostConstruct 或 InitializingBean.afterPropertiesSet()
   ↓
8. init-method
   ↓
9. BeanPostProcessor.postProcessAfterInitialization()
   ↓
10. Bean 可用
   ↓
11. @PreDestroy 或 DisposableBean.destroy()
   ↓
12. destroy-method
```

```java
@Component
public class LifeCycleBean implements InitializingBean, DisposableBean {
    
    @PostConstruct
    public void postConstruct() {
        System.out.println("@PostConstruct");
    }
    
    @Override
    public void afterPropertiesSet() {
        System.out.println("InitializingBean.afterPropertiesSet");
    }
    
    @PreDestroy
    public void preDestroy() {
        System.out.println("@PreDestroy");
    }
    
    @Override
    public void destroy() {
        System.out.println("DisposableBean.destroy");
    }
}
```

#### Q: Bean 作用域

```java
// 1. singleton（默认）：单例，容器启动时创建
@Scope("singleton")

// 2. prototype：每次获取创建新实例
@Scope("prototype")

// 3. request：每个 HTTP 请求一个实例（Web 应用）
@Scope("request")

// 4. session：每个 HTTP 会话一个实例（Web 应用）
@Scope("session")
```

---

### 5.2 AOP 面向切面

#### Q: AOP 核心概念

```java
@Aspect
@Component
public class LogAspect {
    
    // 切点：定义拦截规则
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceLayer() {}
    
    // 前置通知：方法执行前
    @Before("serviceLayer()")
    public void before(JoinPoint jp) {
        System.out.println("Before: " + jp.getSignature().getName());
    }
    
    // 后置通知：方法执行后
    @AfterReturning(pointcut = "serviceLayer()", returning = "result")
    public void afterReturning(Object result) {
        System.out.println("After returning: " + result);
    }
    
    // 异常通知：方法抛异常时
    @AfterThrowing(pointcut = "serviceLayer()", throwing = "e")
    public void afterThrowing(Exception e) {
        System.out.println("After throwing: " + e.getMessage());
    }
    
    // 最终通知：方法执行后（无论是否异常）
    @After("serviceLayer()")
    public void after() {
        System.out.println("After");
    }
    
    // 环绕通知：完全控制方法执行
    @Around("serviceLayer()")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("Around before");
        Object result = pjp.proceed(); // 调用目标方法
        System.out.println("Around after");
        return result;
    }
}
```

#### Q: AOP 实现原理

**JDK 动态代理**（接口）：
```java
public interface UserService {
    void save();
}

// JDK 代理创建代理对象
UserService proxy = (UserService) Proxy.newProxyInstance(
    UserService.class.getClassLoader(),
    new Class[]{UserService.class},
    new InvocationHandler() {
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            System.out.println("Before");
            Object result = method.invoke(target, args);
            System.out.println("After");
            return result;
        }
    }
);
```

**CGLIB 代理**（类）：
```java
public class UserService {
    public void save() {}
}

// CGLIB 通过继承创建子类
Enhancer enhancer = new Enhancer();
enhancer.setSuperclass(UserService.class);
enhancer.setCallback(new MethodInterceptor() {
    @Override
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) {
        System.out.println("Before");
        Object result = proxy.invokeSuper(obj, args);
        System.out.println("After");
        return result;
    }
});
UserService proxy = (UserService) enhancer.create();
```

---

### 5.3 Spring Boot

#### Q: Spring Boot 自动配置原理

```java
@SpringBootApplication
// 组合注解，包含：
// 1. @SpringBootConfiguration（配置类）
// 2. @EnableAutoConfiguration（自动配置）
// 3. @ComponentScan（组件扫描）

@EnableAutoConfiguration
// 核心：导入 AutoConfigurationImportSelector
// 该类加载 META-INF/spring.factories 中的配置类

// spring.factories 示例
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.MyAutoConfiguration
```

**条件注解**：
```java
@Configuration
@ConditionalOnClass(DataSource.class) // 类路径存在 DataSource 时生效
@ConditionalOnMissingBean(DataSource.class) // 容器中不存在 DataSource 时生效
public class DataSourceAutoConfiguration {
    
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}
```

---

## 06. 数据库与持久层

### 6.1 MySQL 索引

#### Q: 索引类型

**1. B+树索引**（默认）
```sql
CREATE INDEX idx_name ON user(name);
```

**特点**：
- 叶子节点存储数据（聚簇索引）或主键（非聚簇索引）
- 叶子节点通过指针连接，支持范围查询
- 高度低（3-4 层），IO 次数少

**2. 哈希索引**
```sql
-- Memory 引擎支持
CREATE TABLE t (id INT, name VARCHAR(20), KEY USING HASH (name)) ENGINE=MEMORY;
```

**特点**：
- 等值查询快 O(1)
- 不支持范围查询、排序

**3. 全文索引**
```sql
CREATE FULLTEXT INDEX idx_content ON article(content);
SELECT * FROM article WHERE MATCH(content) AGAINST('keyword');
```

#### Q: 聚簇索引 vs 非聚簇索引

**聚簇索引**：
- 叶子节点存储完整行数据
- InnoDB 默认主键为聚簇索引
- 一张表只有一个聚簇索引

**非聚簇索引**：
- 叶子节点存储主键值
- 查询时需**回表**（先查非聚簇索引得到主键，再查聚簇索引）

```sql
-- 示例
CREATE TABLE user (
    id INT PRIMARY KEY,      -- 聚簇索引
    name VARCHAR(20),
    age INT,
    INDEX idx_name (name)    -- 非聚簇索引
);

-- 查询流程
SELECT * FROM user WHERE name = 'Alice';
-- 1. 通过 idx_name 找到主键 id
-- 2. 通过主键 id 回表查完整数据
```

**覆盖索引**：避免回表
```sql
-- 索引包含所有查询字段
CREATE INDEX idx_name_age ON user(name, age);

-- 无需回表
SELECT name, age FROM user WHERE name = 'Alice';
```

#### Q: 索引失效场景

```sql
-- 1. 不满足最左前缀原则
CREATE INDEX idx_abc ON t(a, b, c);
SELECT * FROM t WHERE b = 1; -- 失效

-- 2. 在索引列上使用函数
SELECT * FROM t WHERE YEAR(create_time) = 2024; -- 失效

-- 3. 类型转换
SELECT * FROM t WHERE phone = 12345678; -- phone 是 VARCHAR，失效

-- 4. 使用 !=、<>、NOT IN
SELECT * FROM t WHERE status != 1; -- 失效

-- 5. LIKE 以 % 开头
SELECT * FROM t WHERE name LIKE '%Alice'; -- 失效

-- 6. OR 条件中有无索引列
SELECT * FROM t WHERE id = 1 OR age = 20; -- age 无索引，失效
```

---

### 6.2 事务

#### Q: ACID 特性

**Atomicity（原子性）**：事务要么全执行，要么全不执行（Undo Log）  
**Consistency（一致性）**：事务前后数据完整性约束不变  
**Isolation（隔离性）**：多事务并发不互相影响（MVCC + 锁）  
**Durability（持久性）**：事务提交后永久保存（Redo Log）

#### Q: 隔离级别

| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|-----------|------|
| 读未提交（RU） | ✓ | ✓ | ✓ |
| 读已提交（RC） | ✗ | ✓ | ✓ |
| 可重复读（RR）| ✗ | ✗ | ✓ |
| 串行化（S） | ✗ | ✗ | ✗ |

```sql
-- MySQL 默认 RR
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 查看当前隔离级别
SELECT @@transaction_isolation;
```

**示例**：
```sql
-- 脏读：读到未提交的数据
-- 事务 A
UPDATE account SET balance = balance - 100 WHERE id = 1;
-- 事务 B
SELECT balance FROM account WHERE id = 1; -- 读到未提交的修改
-- 事务 A
ROLLBACK; -- 事务 B 读到的数据无效

-- 不可重复读：同一查询两次结果不同
-- 事务 A
SELECT balance FROM account WHERE id = 1; -- 100
-- 事务 B
UPDATE account SET balance = 200 WHERE id = 1;
COMMIT;
-- 事务 A
SELECT balance FROM account WHERE id = 1; -- 200（不一致）

-- 幻读：查询范围内数据条数变化
-- 事务 A
SELECT COUNT(*) FROM account WHERE balance > 100; -- 5 条
-- 事务 B
INSERT INTO account VALUES (6, 200);
COMMIT;
-- 事务 A
SELECT COUNT(*) FROM account WHERE balance > 100; -- 6 条（幻读）
```

#### Q: MVCC（多版本并发控制）

**原理**：每行记录有隐藏字段
```
row_id      | 自增 ID
trx_id      | 最后修改事务 ID
roll_pointer| 指向 Undo Log 中的历史版本
```

**读视图（Read View）**：
- 创建时机：
  - RC：每次查询创建
  - RR：第一次查询创建
- 可见性判断：
  - `trx_id < min_trx_id`：可见
  - `trx_id > max_trx_id`：不可见
  - `trx_id` 在活跃事务列表中：不可见

---

### 6.3 MyBatis

#### Q: #{}与${}的区别

```xml
<!-- #{} - 预编译，防 SQL 注入 -->
SELECT * FROM user WHERE id = #{id}
-- 编译为：SELECT * FROM user WHERE id = ?

<!-- ${} - 字符串替换，有注入风险 -->
SELECT * FROM user WHERE id = ${id}
-- 编译为：SELECT * FROM user WHERE id = 1
```

**使用场景**：
- `#{}`：参数传递（推荐）
- `${}`：动态表名、列名（谨慎使用）

```xml
<!-- 动态排序 -->
SELECT * FROM user ORDER BY ${orderBy}
```

#### Q: 一级缓存 vs 二级缓存

**一级缓存**：
- 作用域：`SqlSession`
- 默认开启
- 同一 `SqlSession` 内相同查询走缓存

```java
SqlSession session = sqlSessionFactory.openSession();
UserMapper mapper = session.getMapper(UserMapper.class);
mapper.selectById(1); // 查询数据库
mapper.selectById(1); // 走缓存
```

**二级缓存**：
- 作用域：`Mapper` 命名空间
- 需手动开启
- 不同 `SqlSession` 共享缓存

```xml
<mapper namespace="com.example.UserMapper">
    <cache/>
    <select id="selectById" resultType="User">
        SELECT * FROM user WHERE id = #{id}
    </select>
</mapper>
```

---

## 07. 分布式系统

### 7.1 CAP 理论

**定理**：分布式系统最多满足 CAP 中的两个

- **C（Consistency）**：一致性
- **A（Availability）**：可用性
- **P（Partition Tolerance）**：分区容错性（网络分区时系统仍可用）

**组合**：
- **CP**：ZooKeeper、HBase（牺牲可用性）
- **AP**：Eureka、Cassandra（牺牲一致性）
- **CA**：单机数据库（不考虑分区）

---

### 7.2 分布式事务

#### Q: 解决方案

**1. 2PC（两阶段提交）**
```
阶段 1：准备阶段
协调者 → 参与者：CanCommit?
参与者 → 协调者：Yes/No

阶段 2：提交阶段
协调者 → 参与者：DoCommit/Rollback
参与者 → 协调者：ACK
```

**缺点**：
- 同步阻塞
- 单点故障
- 数据不一致（协调者宕机）

**2. TCC（Try-Confirm-Cancel）**
```java
public interface AccountService {
    // 1. Try：预留资源
    void tryDeduct(Long userId, BigDecimal amount);
    
    // 2. Confirm：确认提交
    void confirmDeduct(Long userId, BigDecimal amount);
    
    // 3. Cancel：回滚
    void cancelDeduct(Long userId, BigDecimal amount);
}
```

**优点**：性能好，无长事务锁  
**缺点**：业务侵入性强

**3. 本地消息表**
```sql
-- 订单表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    status VARCHAR(20)
);

-- 本地消息表
CREATE TABLE message_log (
    id BIGINT PRIMARY KEY,
    content TEXT,
    status VARCHAR(20), -- PENDING/SUCCESS/FAIL
    retry_count INT
);

-- 同一事务中插入订单和消息
BEGIN;
INSERT INTO orders VALUES (1, 'CREATED');
INSERT INTO message_log VALUES (1, '{"orderId": 1}', 'PENDING', 0);
COMMIT;

-- 定时任务扫描消息表，发送 MQ
```

**4. Seata（推荐）**
```java
@GlobalTransactional // 全局事务注解
public void createOrder() {
    orderService.create();    // 订单服务
    storageService.deduct();  // 库存服务
    accountService.deduct();  // 账户服务
}
```

**模式**：
- AT：自动补偿（默认）
- TCC：手动补偿
- SAGA：长事务

---

### 7.3 分布式锁

#### Q: Redis 实现

```java
// 1. SETNX + EXPIRE（有问题）
SET lock:order:1001 uuid NX EX 30

// 2. Redisson 实现（推荐）
RLock lock = redisson.getLock("lock:order:1001");
try {
    // 尝试加锁，最多等待 100s，锁自动过期时间 10s
    boolean res = lock.tryLock(100, 10, TimeUnit.SECONDS);
    if (res) {
        // 业务逻辑
    }
} finally {
    lock.unlock();
}
```

**RedLock 算法**（多 Redis 实例）：
```java
// 向 N 个 Redis 实例加锁
// 超过半数成功 → 加锁成功
```

#### Q: ZooKeeper 实现

```java
// 创建临时顺序节点
/locks/lock-0000000001
/locks/lock-0000000002

// 加锁流程：
// 1. 创建临时顺序节点
// 2. 获取 /locks 下所有子节点
// 3. 如果自己是最小节点 → 获取锁
// 4. 否则监听前一个节点，等待删除通知
```

**对比**：
- Redis：性能高，可能有锁丢失风险
- ZooKeeper：强一致性，性能较低

---

## 08. 消息队列

### 8.1 RocketMQ

#### Q: 消息发送方式

```java
// 1. 同步发送
SendResult result = producer.send(msg);

// 2. 异步发送
producer.send(msg, new SendCallback() {
    @Override
    public void onSuccess(SendResult result) {}
    
    @Override
    public void onException(Throwable e) {}
});

// 3. 单向发送（不关心结果）
producer.sendOneway(msg);
```

#### Q: 消息可靠性

**生产者**：
- 同步发送 + 重试
- 事务消息

**Broker**：
- 持久化（同步/异步刷盘）
- 主从复制

**消费者**：
- ACK 机制
- 消费失败重试

```java
// 事务消息
producer.sendMessageInTransaction(msg, new LocalTransactionExecuter() {
    @Override
    public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            // 执行本地事务
            updateDB();
            return LocalTransactionState.COMMIT_MESSAGE;
        } catch (Exception e) {
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }
    
    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        // 事务状态回查
        return checkDB() ? COMMIT_MESSAGE : ROLLBACK_MESSAGE;
    }
});
```

#### Q: 如何保证消息顺序？

**全局顺序**：单 Topic 单 Queue（不推荐）

**局部顺序**：
```java
// 相同订单消息发到同一 Queue
producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        Long orderId = (Long) arg;
        int index = (int) (orderId % mqs.size());
        return mqs.get(index);
    }
}, orderId);

// 消费者单线程消费同一 Queue
consumer.registerMessageListener(new MessageListenerOrderly() {
    @Override
    public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, ConsumeOrderlyContext context) {
        // 顺序消费
        return ConsumeOrderlyStatus.SUCCESS;
    }
});
```

---

### 8.2 Kafka vs RocketMQ

| 特性 | Kafka | RocketMQ |
|------|-------|----------|
| 吞吐量 | 高（10万/s） | 中（10万/s） |
| 延迟 | 低（ms） | 低（ms） |
| 可用性 | 高（分区副本） | 高（主从同步） |
| 顺序性 | 分区有序 | Queue 有序 |
| 事务 | 支持 | 支持 |
| 延迟消息 | 不支持 | 支持 |
| 消息回溯 | 支持（offset） | 支持（时间戳） |
| 适用场景 | 日志、流计算 | 业务解耦、削峰 |

---

## 09. 微服务架构

### 9.1 Spring Cloud

#### Q: 核心组件

| 组件 | 功能 | 实现 |
|------|------|------|
| Eureka | 服务注册与发现 | Netflix Eureka |
| Ribbon | 负载均衡 | Netflix Ribbon |
| Feign | 声明式 HTTP 客户端 | OpenFeign |
| Hystrix | 熔断降级 | Netflix Hystrix（停更）|
| Gateway | API 网关 | Spring Cloud Gateway |
| Config | 配置中心 | Spring Cloud Config |
| Sleuth | 链路追踪 | Spring Cloud Sleuth |

#### Q: Feign 调用流程

```java
// 1. 定义接口
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{id}")
    User getById(@PathVariable Long id);
}

// 2. 调用
@Autowired
private UserClient userClient;

User user = userClient.getById(1L);
```

**流程**：
```
1. 生成代理对象（JDK 动态代理）
2. Ribbon 从 Eureka 获取服务列表
3. 负载均衡选择实例
4. Hystrix 熔断保护
5. 发送 HTTP 请求
```

---

### 9.2 服务治理

#### Q: 熔断降级

```java
// Hystrix 示例
@HystrixCommand(fallbackMethod = "fallback",
    commandProperties = {
        @HystrixProperty(name = "circuitBreaker.enabled", value = "true"),
        @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "10"),
        @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "50"),
        @HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds", value = "5000")
    })
public User getById(Long id) {
    return restTemplate.getForObject("http://user-service/users/" + id, User.class);
}

public User fallback(Long id) {
    return new User(id, "默认用户");
}
```

**熔断状态**：
- **关闭**：正常调用
- **开启**：直接降级
- **半开**：尝试调用，成功 → 关闭，失败 → 开启

---

## 10. 性能优化与调优

### 10.1 接口优化

#### Q: 常见优化手段

**1. 索引优化**
```sql
-- 分析慢查询
EXPLAIN SELECT * FROM orders WHERE user_id = 1;

-- 添加索引
CREATE INDEX idx_user_id ON orders(user_id);
```

**2. 缓存**
```java
@Cacheable(value = "user", key = "#id")
public User getById(Long id) {
    return userMapper.selectById(id);
}
```

**3. 异步化**
```java
@Async
public void sendEmail(String to, String content) {
    // 异步发送邮件
}
```

**4. 批量操作**
```java
// 批量插入
<insert id="batchInsert">
    INSERT INTO user (name, age) VALUES
    <foreach collection="list" item="item" separator=",">
        (#{item.name}, #{item.age})
    </foreach>
</insert>
```

**5. 分页查询**
```sql
-- 深分页优化
-- 慢：
SELECT * FROM orders LIMIT 1000000, 10;

-- 快：
SELECT * FROM orders WHERE id > 1000000 LIMIT 10;
```

---

### 10.2 JVM 调优

#### Q: 实战案例

**问题**：Full GC 频繁，停顿时间长

**排查**：
```bash
# 1. 查看 GC 情况
jstat -gcutil <pid> 1000

# 2. Dump 堆内存
jmap -dump:live,format=b,file=heap.bin <pid>

# 3. 分析 Dump（MAT）
```

**优化**：
```bash
# 原参数
-Xms2g -Xmx2g -XX:+UseConcMarkSweepGC

# 优化后
-Xms4g -Xmx4g           # 增大堆内存
-Xmn2g                  # 增大新生代
-XX:+UseG1GC            # 使用 G1
-XX:MaxGCPauseMillis=200 # 目标停顿时间
```

---

## 11. 设计模式

### 11.1 单例模式

```java
// 1. 饿汉式（线程安全）
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        return INSTANCE;
    }
}

// 2. 懒汉式 + 双重检查锁（推荐）
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}

// 3. 静态内部类（推荐）
public class Singleton {
    private Singleton() {}
    
    private static class Holder {
        private static final Singleton INSTANCE = new Singleton();
    }
    
    public static Singleton getInstance() {
        return Holder.INSTANCE;
    }
}

// 4. 枚举（最安全）
public enum Singleton {
    INSTANCE;
    
    public void doSomething() {}
}
```

---

### 11.2 工厂模式

```java
// 简单工厂
public class ShapeFactory {
    public static Shape createShape(String type) {
        switch (type) {
            case "circle": return new Circle();
            case "square": return new Square();
            default: throw new IllegalArgumentException();
        }
    }
}

// 工厂方法
public interface ShapeFactory {
    Shape createShape();
}

public class CircleFactory implements ShapeFactory {
    @Override
    public Shape createShape() {
        return new Circle();
    }
}
```

---

### 11.3 策略模式

```java
// 策略接口
public interface PayStrategy {
    void pay(BigDecimal amount);
}

// 具体策略
public class AlipayStrategy implements PayStrategy {
    @Override
    public void pay(BigDecimal amount) {
        System.out.println("支付宝支付：" + amount);
    }
}

public class WechatStrategy implements PayStrategy {
    @Override
    public void pay(BigDecimal amount) {
        System.out.println("微信支付：" + amount);
    }
}

// 上下文
public class PayContext {
    private PayStrategy strategy;
    
    public PayContext(PayStrategy strategy) {
        this.strategy = strategy;
    }
    
    public void pay(BigDecimal amount) {
        strategy.pay(amount);
    }
}

// 使用
PayContext context = new PayContext(new AlipayStrategy());
context.pay(new BigDecimal("100"));
```

---

## 12. 实战场景题

### 12.1 如何设计一个秒杀系统？

**核心问题**：
1. 高并发读写
2. 超卖问题
3. 恶意刷单

**架构设计**：

```
用户请求
  ↓
CDN（静态资源）
  ↓
Nginx（限流、负载均衡）
  ↓
网关（鉴权、限流）
  ↓
秒杀服务
  ↓
Redis（库存预扣减）
  ↓
MQ（异步下单）
  ↓
订单服务
  ↓
MySQL（最终一致性）
```

**关键点**：

**1. 前端限流**
```javascript
// 按钮防重复点击
let clicking = false;
function seckill() {
    if (clicking) return;
    clicking = true;
    setTimeout(() => clicking = false, 5000);
    // 发送请求
}
```

**2. 后端限流**
```java
// Guava RateLimiter
RateLimiter limiter = RateLimiter.create(100); // 每秒 100 个请求

public Result seckill(Long productId) {
    if (!limiter.tryAcquire()) {
        return Result.error("请求过于频繁");
    }
    // 业务逻辑
}
```

**3. Redis 预扣库存**
```java
String key = "stock:" + productId;

// 初始化库存
redis.set(key, 100);

// 扣减库存
Long stock = redis.decr(key);
if (stock < 0) {
    redis.incr(key); // 回滚
    return Result.error("库存不足");
}

// 发送 MQ 异步下单
mq.send(new OrderMessage(userId, productId));
```

**4. 数据库防超卖**
```sql
-- 乐观锁
UPDATE product
SET stock = stock - 1, version = version + 1
WHERE id = ? AND stock > 0 AND version = ?

-- 悲观锁
SELECT * FROM product WHERE id = ? FOR UPDATE;
UPDATE product SET stock = stock - 1 WHERE id = ?;
```

---

### 12.2 如何设计一个短链系统？

**需求**：
- 长链转短链
- 短链跳转长链
- 统计访问量

**方案**：

**1. 短链生成**
```java
// 方案 1：自增 ID + 62 进制
public String toShortUrl(long id) {
    String chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    StringBuilder sb = new StringBuilder();
    while (id > 0) {
        sb.append(chars.charAt((int) (id % 62)));
        id /= 62;
    }
    return sb.reverse().toString();
}

// 方案 2：MD5 哈希 + 截取
public String toShortUrl(String longUrl) {
    String md5 = DigestUtils.md5Hex(longUrl);
    return md5.substring(0, 6);
}
```

**2. 存储设计**
```sql
CREATE TABLE short_url (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(10) UNIQUE NOT NULL, -- 短码
    long_url TEXT NOT NULL,                 -- 长链
    expire_time DATETIME,                   -- 过期时间
    visit_count INT DEFAULT 0,              -- 访问次数
    INDEX idx_short_code (short_code)
);
```

**3. 缓存设计**
```java
// Redis 缓存
String longUrl = redis.get("short:" + shortCode);
if (longUrl == null) {
    longUrl = db.selectByShortCode(shortCode);
    redis.setex("short:" + shortCode, 3600, longUrl);
}

// 布隆过滤器防止缓存穿透
if (!bloomFilter.mightContain(shortCode)) {
    return "短链不存在";
}
```

**4. 高并发优化**
```java
// 访问量异步更新（消息队列 + 定时批量更新）
mq.send(new VisitMessage(shortCode));

// 定时任务
@Scheduled(fixedDelay = 10000)
public void batchUpdateVisit() {
    Map<String, Integer> map = consumeFromMQ();
    db.batchUpdate(map);
}
```

---

## 📚 学习路线

### Week 1-2: 核心基础
- Java 基础（集合、并发、JVM）
- MySQL（索引、事务、优化）

### Week 3: Spring 全家桶
- Spring（IoC、AOP）
- Spring Boot（自动配置）
- MyBatis（缓存、插件）

### Week 4: 分布式系统
- 分布式理论（CAP、一致性）
- 分布式事务（Seata）
- 分布式锁（Redis、ZooKeeper）

### Week 5: 微服务
- Spring Cloud（Eureka、Feign、Gateway）
- 消息队列（RocketMQ、Kafka）
- 服务治理（熔断、限流、降级）

### Week 6: 实战演练
- 秒杀系统设计
- 短链系统设计
- Mock 面试

---

## 🎯 高频面试题清单

### 必考（90%）
- [ ] HashMap 原理
- [ ] ConcurrentHashMap 原理
- [ ] JVM 内存模型
- [ ] GC 算法与收集器
- [ ] Spring IoC/AOP 原理
- [ ] MySQL 索引原理
- [ ] 事务隔离级别
- [ ] 线程池参数

### 常考（70%）
- [ ] synchronized vs ReentrantLock
- [ ] volatile 原理
- [ ] Spring Bean 生命周期
- [ ] MyBatis 缓存机制
- [ ] Redis 数据结构
- [ ] 分布式事务
- [ ] 消息队列如何保证可靠性

### 加分项（50%）
- [ ] G1 收集器原理
- [ ] ZGC 原理
- [ ] Spring Boot 自动配置原理
- [ ] 微服务架构设计
- [ ] 限流算法
- [ ] 秒杀系统设计

---

## 📌 备注

- **适用人群**：5年 Java 后端开发经验
- **难度定位**：中高级（P6-P7）
- **最后更新**：2026-06-23

**建议**：
1. 每个知识点都要手写代码验证
2. 重点理解原理，而不是死记结论
3. 结合实际项目经验回答

---

祝面试成功！💪
