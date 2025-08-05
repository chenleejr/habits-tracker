/**
 * 时区处理工具函数
 * 解决使用 toISOString().split('T')[0] 导致的UTC时区问题
 */

/**
 * 获取本地时区的日期字符串 (YYYY-MM-DD格式)
 * @param date 可选的日期对象，默认为当前日期
 * @returns 本地时区的日期字符串
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 从日期字符串创建本地时区的日期对象
 * @param dateString YYYY-MM-DD格式的日期字符串
 * @returns 本地时区的日期对象
 */
export function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 获取昨天的本地日期字符串
 * @returns 昨天的本地日期字符串
 */
export function getYesterdayLocalString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

/**
 * 获取今天的本地日期字符串
 * @returns 今天的本地日期字符串
 */
export function getTodayLocalString(): string {
  return getLocalDateString();
}

/**
 * 获取指定天数前的本地日期字符串
 * @param daysAgo 天数
 * @returns 指定天数前的本地日期字符串
 */
export function getDaysAgoLocalString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getLocalDateString(date);
}

/**
 * 获取指定天数后的本地日期字符串
 * @param daysLater 天数
 * @returns 指定天数后的本地日期字符串
 */
export function getDaysLaterLocalString(daysLater: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysLater);
  return getLocalDateString(date);
}

/**
 * 比较两个日期字符串
 * @param date1 第一个日期字符串
 * @param date2 第二个日期字符串
 * @returns 0: 相等, 1: date1 > date2, -1: date1 < date2
 */
export function compareDateStrings(date1: string, date2: string): number {
  if (date1 === date2) return 0;
  return date1 > date2 ? 1 : -1;
}

/**
 * 计算两个日期字符串之间的天数差
 * @param startDate 开始日期字符串
 * @param endDate 结束日期字符串
 * @returns 天数差（正数表示endDate在startDate之后）
 */
export function getDaysDifference(startDate: string, endDate: string): number {
  const start = createLocalDate(startDate);
  const end = createLocalDate(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 格式化日期为中文显示
 * @param dateString YYYY-MM-DD格式的日期字符串
 * @returns 格式化后的中文日期字符串
 */
export function formatDateToChinese(dateString: string): string {
  const date = createLocalDate(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
}