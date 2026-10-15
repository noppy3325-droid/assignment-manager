import { format } from 'date-fns';
export const parseSmartInput = (text: string, currentSubjects: string[] = []) => {
  if (!text) return null;
  
  let title = text.trim();
  let subject = "";
  let estimatedHours = 1;
  const now = new Date();
  let deadlineDate = format(now, 'yyyy-MM-dd');
  let deadlineTime = "23:59";
  let priority: 'low' | 'medium' | 'high' = 'medium';
  let scheduledDate = format(now, 'yyyy-MM-dd');

  // 1. Estimate duration (e.g. 1.5h, 2.5時間, 30分)
  const hoursMatch = title.match(/(\d+(?:\.\d+)?)\s*(?:時間|h(?:rs?)?\b)/i);
  if (hoursMatch) {
    estimatedHours = parseFloat(hoursMatch[1]);
    title = title.replace(hoursMatch[0], '');
  } else {
    const minsMatch = title.match(/(\d+)\s*(?:分|mins?\b|m\b)/i);
    if (minsMatch) {
      estimatedHours = Math.round((parseInt(minsMatch[1]) / 60) * 10) / 10;
      title = title.replace(minsMatch[0], '');
    }
  }

  // 2. Parse subject
  const detectedSubject = currentSubjects.find(subj => title.toLowerCase().includes(subj.toLowerCase()));
  if (detectedSubject) {
    subject = detectedSubject;
  } else {
    if (title.includes("英")) subject = "英語";
    else if (title.includes("数")) subject = "数学";
    else if (title.includes("国") || title.includes("現文") || title.includes("古文") || title.includes("漢文")) subject = "国語";
    else if (title.includes("物")) subject = "物理";
    else if (title.includes("化")) subject = "化学";
    else if (title.includes("生")) subject = "生物";
    else if (title.includes("歴") || title.includes("日史") || title.includes("世史")) subject = "日本史";
    else if (title.includes("地理")) subject = "地理";
    else subject = currentSubjects[0] || "その他";
  }

  // 3. Parse priority
  if (/テスト|定期テスト|試験|中間|期末|模試|重|高|至急|緊急|\b(?:high|exam|test)\b/i.test(title)) {
    priority = 'high';
  } else if (/自主|予習|読書|低|趣味|low/i.test(title)) {
    priority = 'low';
  }

  // 4. Parse deadline date
  if (/今日|today/i.test(title)) {
    deadlineDate = format(now, 'yyyy-MM-dd');
    title = title.replace(/今日|today/gi, '');
  } else if (/明日|tomorrow/i.test(title)) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    deadlineDate = format(tomorrow, 'yyyy-MM-dd');
    title = title.replace(/明日|tomorrow/gi, '');
  } else if (/明後日/i.test(title)) {
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    deadlineDate = format(dayAfter, 'yyyy-MM-dd');
    title = title.replace(/明後日/gi, '');
  } else if (/来週/i.test(title)) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    deadlineDate = format(nextWeek, 'yyyy-MM-dd');
    title = title.replace(/来週/gi, '');
  }

  // 5. Parse deadline time (e.g. 17:30, 17時)
  const timeMatch = title.match(/(\d{1,2})[:：](\d{2})/);
  if (timeMatch && Number(timeMatch[1]) < 24 && Number(timeMatch[2]) < 60) {
    const h = parseInt(timeMatch[1]).toString().padStart(2, '0');
    const m = timeMatch[2];
    deadlineTime = `${h}:${m}`;
    title = title.replace(timeMatch[0], '');
  } else {
    const hourMatch = title.match(/(\d{1,2})\s*時/);
    if (hourMatch && Number(hourMatch[1]) < 24) {
      const h = parseInt(hourMatch[1]).toString().padStart(2, '0');
      deadlineTime = `${h}:00`;
      title = title.replace(hourMatch[0], '');
    }
  }

  // Clean title: remove common fill words
  title = title.replace(/まで(?:に)?/g, '');
  title = title.replace(/優先度\s*[:：]\s*(?:高|中|低)/g, '');
  title = title.replace(/priority\s*[:：]\s*(?:high|med|medium|low)/gi, '');
  title = title.replace(/\s+/g, ' ').trim();
  if (!title) {
    title = "自動解析タスク";
  }

  return { title, subject, estimatedHours: Math.max(0.1, estimatedHours), deadlineDate, deadlineTime, priority, scheduledDate: deadlineDate };
};

