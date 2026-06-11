# 算法与数据结构资深面试指南

## 目录
1. [复杂度分析](#1-复杂度分析)
2. [数组与字符串](#2-数组与字符串)
3. [链表](#3-链表)
4. [栈与队列](#4-栈与队列)
5. [哈希表](#5-哈希表)
6. [树](#6-树)
7. [图](#7-图)
8. [排序算法](#8-排序算法)
9. [查找算法](#9-查找算法)
10. [算法思想](#10-算法思想)
11. [LeetCode 高频题](#11-leetcode-高频题)
12. [面试技巧](#12-面试技巧)

---

## 1. 复杂度分析

### 1.1 时间复杂度

```javascript
// O(1) - 常数时间
function getFirst(arr) {
  return arr[0];
}

// O(log n) - 对数时间（二分查找）
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// O(n) - 线性时间
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// O(n log n) - 线性对数时间（快速排序、归并排序）
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

// O(n²) - 平方时间（冒泡排序）
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// O(2ⁿ) - 指数时间（递归斐波那契）
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 复杂度对比（n = 1000）
// O(1):      1 次操作
// O(log n):  10 次操作
// O(n):      1,000 次操作
// O(n log n): 10,000 次操作
// O(n²):     1,000,000 次操作
// O(2ⁿ):     无法计算
```

### 1.2 空间复杂度

```javascript
// O(1) - 常数空间
function swap(a, b) {
  return [b, a];
}

// O(n) - 线性空间
function createArray(n) {
  return new Array(n).fill(0);
}

// O(n) - 递归栈空间
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1); // 递归深度 n
}
```

---

## 2. 数组与字符串

### 2.1 双指针

```javascript
// 1. 两数之和 II（有序数组）
function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;
  
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  
  return [-1, -1];
}

// 2. 移除元素
function removeElement(nums, val) {
  let slow = 0;
  
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== val) {
      nums[slow] = nums[fast];
      slow++;
    }
  }
  
  return slow;
}

// 3. 反转字符串
function reverseString(s) {
  let left = 0, right = s.length - 1;
  
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
  
  return s;
}

// 4. 回文判断
function isPalindrome(s) {
  // 预处理：只保留字母和数字，转小写
  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let left = 0, right = s.length - 1;
  
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  
  return true;
}
```

### 2.2 滑动窗口

```javascript
// 1. 最长无重复子串
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0;
  let left = 0;
  
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) {
      left = Math.max(left, map.get(s[right]) + 1);
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  
  return maxLen;
}

// 2. 最小覆盖子串
function minWindow(s, t) {
  const need = new Map();
  const window = new Map();
  
  for (const c of t) {
    need.set(c, (need.get(c) || 0) + 1);
  }
  
  let left = 0, right = 0;
  let valid = 0;
  let start = 0, minLen = Infinity;
  
  while (right < s.length) {
    const c = s[right];
    right++;
    
    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1);
      if (window.get(c) === need.get(c)) {
        valid++;
      }
    }
    
    while (valid === need.size) {
      if (right - left < minLen) {
        start = left;
        minLen = right - left;
      }
      
      const d = s[left];
      left++;
      
      if (need.has(d)) {
        if (window.get(d) === need.get(d)) {
          valid--;
        }
        window.set(d, window.get(d) - 1);
      }
    }
  }
  
  return minLen === Infinity ? '' : s.slice(start, start + minLen);
}
```

### 2.3 前缀和

```javascript
// 1. 区间和查询
class NumArray {
  constructor(nums) {
    this.prefixSum = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
      this.prefixSum[i + 1] = this.prefixSum[i] + nums[i];
    }
  }
  
  sumRange(left, right) {
    return this.prefixSum[right + 1] - this.prefixSum[left];
  }
}

// 2. 和为 K 的子数组
function subarraySum(nums, k) {
  const map = new Map([[0, 1]]);
  let sum = 0, count = 0;
  
  for (const num of nums) {
    sum += num;
    if (map.has(sum - k)) {
      count += map.get(sum - k);
    }
    map.set(sum, (map.get(sum) || 0) + 1);
  }
  
  return count;
}
```

---

## 3. 链表

### 3.1 链表基础

```javascript
// 链表节点定义
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// 创建链表
function createLinkedList(arr) {
  if (!arr.length) return null;
  const dummy = new ListNode(0);
  let curr = dummy;
  for (const val of arr) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
}

// 打印链表
function printList(head) {
  const values = [];
  while (head) {
    values.push(head.val);
    head = head.next;
  }
  console.log(values.join(' -> '));
}
```

### 3.2 链表操作

```javascript
// 1. 反转链表
function reverseList(head) {
  let prev = null;
  let curr = head;
  
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  
  return prev;
}

// 2. 反转链表 II（部分反转）
function reverseBetween(head, left, right) {
  if (left === right) return head;
  
  const dummy = new ListNode(0, head);
  let prev = dummy;
  
  // 移动到 left 前一个节点
  for (let i = 0; i < left - 1; i++) {
    prev = prev.next;
  }
  
  // 反转 left 到 right
  let curr = prev.next;
  for (let i = 0; i < right - left; i++) {
    const next = curr.next;
    curr.next = next.next;
    next.next = prev.next;
    prev.next = next;
  }
  
  return dummy.next;
}

// 3. 合并两个有序链表
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;
  
  while (l1 && l2) {
    if (l1.val < l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }
  
  curr.next = l1 || l2;
  
  return dummy.next;
}

// 4. 删除倒数第 N 个节点
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy;
  let slow = dummy;
  
  // fast 先走 n 步
  for (let i = 0; i <= n; i++) {
    fast = fast.next;
  }
  
  // fast 和 slow 一起走
  while (fast) {
    fast = fast.next;
    slow = slow.next;
  }
  
  // 删除 slow.next
  slow.next = slow.next.next;
  
  return dummy.next;
}

// 5. 环形链表检测
function hasCycle(head) {
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) return true;
  }
  
  return false;
}

// 6. 环形链表入口
function detectCycle(head) {
  let slow = head;
  let fast = head;
  
  // 判断是否有环
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      // 有环，找入口
      let ptr = head;
      while (ptr !== slow) {
        ptr = ptr.next;
        slow = slow.next;
      }
      return ptr;
    }
  }
  
  return null;
}

// 7. 链表排序
function sortList(head) {
  if (!head || !head.next) return head;
  
  // 找中点
  let slow = head;
  let fast = head.next;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  
  // 分割
  const mid = slow.next;
  slow.next = null;
  
  // 递归排序
  const left = sortList(head);
  const right = sortList(mid);
  
  // 合并
  return mergeTwoLists(left, right);
}
```

---

## 4. 栈与队列

### 4.1 栈

```javascript
// 栈实现
class Stack {
  constructor() {
    this.items = [];
  }
  
  push(item) {
    this.items.push(item);
  }
  
  pop() {
    return this.items.pop();
  }
  
  peek() {
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
}

// 1. 有效的括号
function isValid(s) {
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (const char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}

// 2. 最小栈
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  
  push(val) {
    this.stack.push(val);
    const min = this.minStack.length === 0 
      ? val 
      : Math.min(val, this.getMin());
    this.minStack.push(min);
  }
  
  pop() {
    this.stack.pop();
    this.minStack.pop();
  }
  
  top() {
    return this.stack[this.stack.length - 1];
  }
  
  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}

// 3. 每日温度
function dailyTemperatures(temperatures) {
  const n = temperatures.length;
  const result = new Array(n).fill(0);
  const stack = [];
  
  for (let i = 0; i < n; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const idx = stack.pop();
      result[idx] = i - idx;
    }
    stack.push(i);
  }
  
  return result;
}

// 4. 逆波兰表达式求值
function evalRPN(tokens) {
  const stack = [];
  
  for (const token of tokens) {
    if (['+', '-', '*', '/'].includes(token)) {
      const b = stack.pop();
      const a = stack.pop();
      
      if (token === '+') stack.push(a + b);
      else if (token === '-') stack.push(a - b);
      else if (token === '*') stack.push(a * b);
      else stack.push(Math.trunc(a / b));
    } else {
      stack.push(Number(token));
    }
  }
  
  return stack[0];
}
```

### 4.2 队列

```javascript
// 队列实现
class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(item) {
    this.items.push(item);
  }
  
  dequeue() {
    return this.items.shift();
  }
  
  front() {
    return this.items[0];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
}

// 1. 用栈实现队列
class MyQueue {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }
  
  push(x) {
    this.inStack.push(x);
  }
  
  pop() {
    if (this.outStack.length === 0) {
      while (this.inStack.length) {
        this.outStack.push(this.inStack.pop());
      }
    }
    return this.outStack.pop();
  }
  
  peek() {
    if (this.outStack.length === 0) {
      while (this.inStack.length) {
        this.outStack.push(this.inStack.pop());
      }
    }
    return this.outStack[this.outStack.length - 1];
  }
  
  empty() {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }
}

// 2. 滑动窗口最大值（单调队列）
function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = []; // 存储索引，保持递减
  
  for (let i = 0; i < nums.length; i++) {
    // 移除超出窗口的元素
    if (deque.length && deque[0] < i - k + 1) {
      deque.shift();
    }
    
    // 移除比当前元素小的元素
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }
    
    deque.push(i);
    
    // 窗口形成后，记录最大值
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }
  
  return result;
}
```

---

## 5. 哈希表

### 5.1 哈希表基础

```javascript
// 1. 两数之和
function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  
  return [-1, -1];
}

// 2. 字母异位词分组
function groupAnagrams(strs) {
  const map = new Map();
  
  for (const str of strs) {
    const key = str.split('').sort().join('');
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(str);
  }
  
  return Array.from(map.values());
}

// 3. 最长连续序列
function longestConsecutive(nums) {
  const set = new Set(nums);
  let maxLen = 0;
  
  for (const num of set) {
    // 只从序列起点开始计数
    if (!set.has(num - 1)) {
      let currentNum = num;
      let currentLen = 1;
      
      while (set.has(currentNum + 1)) {
        currentNum++;
        currentLen++;
      }
      
      maxLen = Math.max(maxLen, currentLen);
    }
  }
  
  return maxLen;
}

// 4. LRU 缓存
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) return -1;
    
    // 更新访问顺序
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  put(key, value) {
    // 删除旧的
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // 添加新的
    this.cache.set(key, value);
    
    // 超出容量，删除最久未使用的
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}
```

---

## 6. 树

### 6.1 二叉树基础

```javascript
// 树节点定义
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 创建二叉树（层序遍历数组）
function createTree(arr) {
  if (!arr.length) return null;
  
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    
    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i++;
    
    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i++;
  }
  
  return root;
}
```

### 6.2 二叉树遍历

```javascript
// 1. 前序遍历（根 → 左 → 右）
function preorderTraversal(root) {
  const result = [];
  
  function traverse(node) {
    if (!node) return;
    result.push(node.val);
    traverse(node.left);
    traverse(node.right);
  }
  
  traverse(root);
  return result;
}

// 前序遍历（迭代）
function preorderTraversal(root) {
  if (!root) return [];
  
  const result = [];
  const stack = [root];
  
  while (stack.length) {
    const node = stack.pop();
    result.push(node.val);
    
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  
  return result;
}

// 2. 中序遍历（左 → 根 → 右）
function inorderTraversal(root) {
  const result = [];
  
  function traverse(node) {
    if (!node) return;
    traverse(node.left);
    result.push(node.val);
    traverse(node.right);
  }
  
  traverse(root);
  return result;
}

// 3. 后序遍历（左 → 右 → 根）
function postorderTraversal(root) {
  const result = [];
  
  function traverse(node) {
    if (!node) return;
    traverse(node.left);
    traverse(node.right);
    result.push(node.val);
  }
  
  traverse(root);
  return result;
}

// 4. 层序遍历
function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length) {
    const level = [];
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(level);
  }
  
  return result;
}
```

### 6.3 二叉树经典题目

```javascript
// 1. 二叉树的最大深度
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// 2. 翻转二叉树
function invertTree(root) {
  if (!root) return null;
  
  [root.left, root.right] = [root.right, root.left];
  
  invertTree(root.left);
  invertTree(root.right);
  
  return root;
}

// 3. 对称二叉树
function isSymmetric(root) {
  function isMirror(left, right) {
    if (!left && !right) return true;
    if (!left || !right) return false;
    
    return left.val === right.val &&
           isMirror(left.left, right.right) &&
           isMirror(left.right, right.left);
  }
  
  return isMirror(root, root);
}

// 4. 路径总和
function hasPathSum(root, targetSum) {
  if (!root) return false;
  
  if (!root.left && !root.right) {
    return root.val === targetSum;
  }
  
  return hasPathSum(root.left, targetSum - root.val) ||
         hasPathSum(root.right, targetSum - root.val);
}

// 5. 二叉树的直径
function diameterOfBinaryTree(root) {
  let maxDiameter = 0;
  
  function depth(node) {
    if (!node) return 0;
    
    const left = depth(node.left);
    const right = depth(node.right);
    
    maxDiameter = Math.max(maxDiameter, left + right);
    
    return 1 + Math.max(left, right);
  }
  
  depth(root);
  return maxDiameter;
}

// 6. 二叉树的最近公共祖先
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  
  if (left && right) return root;
  
  return left || right;
}

// 7. 二叉树的右视图
function rightSideView(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length) {
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      
      if (i === size - 1) {
        result.push(node.val);
      }
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return result;
}
```

---

## 7. 图

### 7.1 图的表示

```javascript
// 邻接表
const graph = {
  0: [1, 2],
  1: [0, 3, 4],
  2: [0, 4],
  3: [1],
  4: [1, 2]
};

// 邻接矩阵
const graph2 = [
  [0, 1, 1, 0, 0],
  [1, 0, 0, 1, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 0, 0, 0],
  [0, 1, 1, 0, 0]
];
```

### 7.2 图的遍历

```javascript
// 1. BFS（广度优先搜索）
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const result = [];
  
  visited.add(start);
  
  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return result;
}

// 2. DFS（深度优先搜索）
function dfs(graph, start) {
  const visited = new Set();
  const result = [];
  
  function traverse(node) {
    if (visited.has(node)) return;
    
    visited.add(node);
    result.push(node);
    
    for (const neighbor of graph[node] || []) {
      traverse(neighbor);
    }
  }
  
  traverse(start);
  return result;
}
```

### 7.3 图的经典题目

```javascript
// 1. 岛屿数量
function numIslands(grid) {
  if (!grid.length) return 0;
  
  const m = grid.length;
  const n = grid[0].length;
  let count = 0;
  
  function dfs(i, j) {
    if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] === '0') {
      return;
    }
    
    grid[i][j] = '0'; // 标记已访问
    
    dfs(i + 1, j);
    dfs(i - 1, j);
    dfs(i, j + 1);
    dfs(i, j - 1);
  }
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === '1') {
        count++;
        dfs(i, j);
      }
    }
  }
  
  return count;
}

// 2. 课程表（拓扑排序）
function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);
  
  // 构建图
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }
  
  // BFS
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }
  
  let count = 0;
  while (queue.length) {
    const course = queue.shift();
    count++;
    
    for (const next of graph[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }
  
  return count === numCourses;
}

// 3. 克隆图
function cloneGraph(node) {
  if (!node) return null;
  
  const map = new Map();
  
  function clone(node) {
    if (map.has(node)) return map.get(node);
    
    const copy = new Node(node.val);
    map.set(node, copy);
    
    for (const neighbor of node.neighbors) {
      copy.neighbors.push(clone(neighbor));
    }
    
    return copy;
  }
  
  return clone(node);
}
```

---

## 8. 排序算法

### 8.1 冒泡排序

```javascript
function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n; i++) {
    let swapped = false;
    
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    
    if (!swapped) break;
  }
  
  return arr;
}

// 时间复杂度：O(n²)
// 空间复杂度：O(1)
// 稳定性：稳定
```

### 8.2 快速排序

```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 原地快排
function quickSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr;
  
  const pivotIndex = partition(arr, left, right);
  quickSortInPlace(arr, left, pivotIndex - 1);
  quickSortInPlace(arr, pivotIndex + 1, right);
  
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;
  
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

// 时间复杂度：平均 O(n log n)，最坏 O(n²)
// 空间复杂度：O(log n)
// 稳定性：不稳定
```

### 8.3 归并排序

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(n)
// 稳定性：稳定
```

### 8.4 堆排序

```javascript
function heapSort(arr) {
  const n = arr.length;
  
  // 构建最大堆
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  
  // 提取元素
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }
  
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }
  
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(1)
// 稳定性：不稳定
```

---

## 9. 查找算法

### 9.1 二分查找

```javascript
// 1. 标准二分查找
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// 2. 查找左边界
function leftBound(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return left;
}

// 3. 查找右边界
function rightBound(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return right;
}

// 4. 搜索旋转排序数组
function search(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) return mid;
    
    // 左半部分有序
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    // 右半部分有序
    else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  
  return -1;
}
```

---

## 10. 算法思想

### 10.1 递归

```javascript
// 1. 斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 优化：记忆化
function fibonacci(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

// 2. 汉诺塔
function hanoi(n, from, to, aux) {
  if (n === 1) {
    console.log(`Move disk 1 from ${from} to ${to}`);
    return;
  }
  
  hanoi(n - 1, from, aux, to);
  console.log(`Move disk ${n} from ${from} to ${to}`);
  hanoi(n - 1, aux, to, from);
}
```

### 10.2 回溯

```javascript
// 1. 全排列
function permute(nums) {
  const result = [];
  
  function backtrack(path) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    
    for (const num of nums) {
      if (path.includes(num)) continue;
      
      path.push(num);
      backtrack(path);
      path.pop();
    }
  }
  
  backtrack([]);
  return result;
}

// 2. 组合总和
function combinationSum(candidates, target) {
  const result = [];
  
  function backtrack(start, path, sum) {
    if (sum === target) {
      result.push([...path]);
      return;
    }
    
    if (sum > target) return;
    
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(i, path, sum + candidates[i]);
      path.pop();
    }
  }
  
  backtrack(0, [], 0);
  return result;
}

// 3. 括号生成
function generateParenthesis(n) {
  const result = [];
  
  function backtrack(str, left, right) {
    if (str.length === 2 * n) {
      result.push(str);
      return;
    }
    
    if (left < n) {
      backtrack(str + '(', left + 1, right);
    }
    
    if (right < left) {
      backtrack(str + ')', left, right + 1);
    }
  }
  
  backtrack('', 0, 0);
  return result;
}
```

### 10.3 动态规划

```javascript
// 1. 爬楼梯
function climbStairs(n) {
  if (n <= 2) return n;
  
  let prev = 1, curr = 2;
  
  for (let i = 3; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  
  return curr;
}

// 2. 零钱兑换
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i >= coin) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// 3. 最长递增子序列
function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  
  return Math.max(...dp);
}

// 4. 最长公共子序列
function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

// 5. 背包问题
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  return dp[n][capacity];
}
```

### 10.4 贪心算法

```javascript
// 1. 分发饼干
function findContentChildren(g, s) {
  g.sort((a, b) => a - b);
  s.sort((a, b) => a - b);
  
  let i = 0, j = 0;
  
  while (i < g.length && j < s.length) {
    if (s[j] >= g[i]) {
      i++;
    }
    j++;
  }
  
  return i;
}

// 2. 跳跃游戏
function canJump(nums) {
  let maxReach = 0;
  
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  
  return true;
}

// 3. 区间调度
function eraseOverlapIntervals(intervals) {
  if (!intervals.length) return 0;
  
  intervals.sort((a, b) => a[1] - b[1]);
  
  let count = 0;
  let end = intervals[0][1];
  
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < end) {
      count++;
    } else {
      end = intervals[i][1];
    }
  }
  
  return count;
}
```

---

## 11. LeetCode 高频题

### 11.1 Top 20 必刷题

```javascript
// 1. 两数之和 (Easy) ⭐⭐⭐⭐⭐
// 见 5.1 节

// 2. 三数之和 (Medium) ⭐⭐⭐⭐⭐
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    
    let left = i + 1, right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  return result;
}

// 3. 合并区间 (Medium) ⭐⭐⭐⭐⭐
function merge(intervals) {
  if (!intervals.length) return [];
  
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const curr = intervals[i];
    const last = result[result.length - 1];
    
    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      result.push(curr);
    }
  }
  
  return result;
}

// 4. 买卖股票的最佳时机 (Easy) ⭐⭐⭐⭐⭐
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  
  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  
  return maxProfit;
}

// 5. 最大子数组和 (Medium) ⭐⭐⭐⭐⭐
function maxSubArray(nums) {
  let maxSum = nums[0];
  let currSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currSum = Math.max(nums[i], currSum + nums[i]);
    maxSum = Math.max(maxSum, currSum);
  }
  
  return maxSum;
}

// ... 更多高频题见 LeetCode Top 100
```

---

## 12. 面试技巧

### 12.1 解题步骤

```
1. 理解题意（5分钟）
   • 输入输出是什么
   • 边界条件
   • 示例验证

2. 思考方案（10分钟）
   • 暴力解法
   • 优化方向
   • 时间/空间复杂度

3. 编码实现（15分钟）
   • 先写主逻辑
   • 再处理边界

4. 测试验证（5分钟）
   • 正常用例
   • 边界用例
   • 极端用例

5. 复杂度分析（5分钟）
   • 时间复杂度
   • 空间复杂度
   • 优化可能
```

### 12.2 常见套路

```
数组/字符串：
• 双指针
• 滑动窗口
• 前缀和
• 哈希表

链表：
• 快慢指针
• 虚拟头节点
• 递归

树：
• 递归
• BFS/DFS
• 分治

图：
• BFS/DFS
• 拓扑排序
• 并查集

动态规划：
• 状态定义
• 状态转移方程
• 初始化
• 遍历顺序
```

### 12.3 沟通技巧

```
1. 先说思路，不要直接写代码
2. 边写边说，解释你的想法
3. 遇到卡壳，说出你的困难
4. 主动询问面试官意见
5. 复杂度分析要说清楚
6. 测试用例要覆盖边界
```

### 12.4 时间管理

```
45分钟面试：
• 10分钟：理解题意 + 思考方案
• 20分钟：编码实现
• 10分钟：测试 + 优化
• 5分钟：讨论其他方案

建议：
• 不要纠结最优解
• 先写出能跑的代码
• 再优化时间/空间
• 有时间再讨论其他方案
```

---

## 资源推荐

### 在线平台
- **LeetCode**：https://leetcode.cn/
- **牛客网**：https://www.nowcoder.com/
- **CodeTop**：https://codetop.cc/（企业高频题）

### 学习资料
- 《算法导论》
- 《剑指 Offer》
- 《程序员代码面试指南》

### 刷题顺序
1. LeetCode Hot 100
2. 剑指 Offer（中文友好）
3. CodeTop 企业高频题
4. 按公司刷题（目标公司）

---

**记住**：算法面试不是考你会多少算法，而是考你的**思维能力**和**编码能力**。多练习，保持手感！