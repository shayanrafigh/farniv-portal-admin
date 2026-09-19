import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Middleware for body parsing
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Directories
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically directly from OS filesystem storage
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for local OS disk storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `safe_stage_${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('فقط فایل‌های تصویری مجاز هستند (JPG, PNG, WEBP)'));
    }
  },
});

// Seed data function
function getInitialData() {
  const now = new Date().toISOString();
  return {
    admin: {
      id: 'admin_1',
      username: 'admin',
      password: 'admin',
      updatedAt: now,
    },
    customers: [
      {
        id: 'cust_101',
        name: 'جناب آقای مهندس کمالی (جواهری کیمیا)',
        username: 'kamali',
        password: '1405kamali',
        phone: '09121234567',
        address: 'تهران، بازار زرگرها، پلاک ۴۸',
        notes: 'مشتری قدیمی صنف طلا و جواهر - نیازمند امنیت فوق بالا',
        createdAt: now,
      },
      {
        id: 'cust_102',
        name: 'شرکت صرافی تجارت نوین آریا',
        username: 'sarafiaray',
        password: '1405sarafiaray',
        phone: '09129876543',
        address: 'تهران، خیابان فردوسی، برج صرافی‌ها طبقه ۲',
        notes: 'گاوصندوق ۲ درب مجزا با سیستم رمز دو کاربره',
        createdAt: now,
      },
    ],
    projects: [
      {
        id: 'proj_201',
        customerId: 'cust_101',
        title: 'گاوصندوق فوق سنگین ضدبرش و ضددیلم طلافروشی - مدل دژبان ۹۵۰',
        safeType: 'طلافروشی و جواهرات (ضد هواگاز و ضد تخریب)',
        dimensions: 'ارتفاع ۱۷۰ × عرض ۹۰ × عمق ۷۵ سانتی‌متر',
        weight: '۹۸۰ کیلوگرم (فولاد سخت + بتن الیافی مسلح)',
        lockType: 'سیستم رمزنگاری دوگانه دیجیتال کره‌ای + رمز مکانیکی آمریکایی + کلید کمرشکن تاشو',
        status: 'in_progress',
        startDate: '۱۴۰۴/۱۱/۱۰',
        estimatedDelivery: '۱۴۰۵/۰۱/۲۵',
        notes: 'دارای زبانه بندی ۴ جهته فولادی به قطر ۴۰ میلی‌متر و سیستم قفل اضطراری در صورت ضربه یا انفجار',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'proj_202',
        customerId: 'cust_102',
        title: 'خزانه اسناد مالی و ارز ضد حریق دو طبقه - مدل آریا ۵۰۰',
        safeType: 'صرافی و اسناد حساس (مقاوم تا ۱۲۰۰ درجه سانتی‌گراد)',
        dimensions: 'ارتفاع ۱۴۰ × عرض ۷۰ × عمق ۶۵ سانتی‌متر',
        weight: '۶۲۰ کیلوگرم',
        lockType: 'رمز بیومتریک اثرانگشتی و سیستم رمز چرخشی ۳ ردیفه',
        status: 'in_progress',
        startDate: '۱۴۰۴/۱۲/۰۱',
        estimatedDelivery: '۱۴۰۵/۰۲/۱۰',
        notes: 'رنگ‌آمیزی سفید متالیک الکترواستاتیک کوره‌ای',
        createdAt: now,
        updatedAt: now,
      },
    ],
    stages: [
      {
        id: 'stage_301',
        projectId: 'proj_201',
        title: 'مرحله ۱: برش‌کاری ورق آلیاژی ST52 و خم‌کاری دقیق شاسی با دستگاه CNC',
        description: 'ورق‌های ضخامت ۱۰ میلی‌متر فولاد ضدبرش مطابق نقشه مهندسی با دقت دهم میلی‌متر برش لیزر و خم‌کاری شد.',
        imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1000&auto=format&fit=crop&q=80',
        completed: true,
        date: '۱۴۰۴/۱۱/۱۵',
        order: 1,
        createdAt: now,
      },
      {
        id: 'stage_302',
        projectId: 'proj_201',
        title: 'مرحله ۲: جوشکاری تخصصی CO2 دوجداره و مهاربندی زوار ضد دیلم',
        description: 'اسکلت اصلی به همراه لچکی‌های تقویت‌کننده و نبشی‌های ضد نفوذ با گاز محافظ جوشکاری گردید.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&auto=format&fit=crop&q=80',
        completed: true,
        date: '۱۴۰۴/۱۱/۲۸',
        order: 2,
        createdAt: now,
      },
      {
        id: 'stage_303',
        projectId: 'proj_201',
        title: 'مرحله ۳: تزریق بتن مسلح عیار ۵۰۰ ضد حریق همراه با توری مش و الیاف ضد مته',
        description: 'جداره میانی بدنه و درب با ترکیب بتن ضد مته و سیلیس نسوز پر شد تا بیش از ۳ ساعت در برابر حرارت مستقیم ۱۲۰۰ درجه مقاومت کند.',
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1000&auto=format&fit=crop&q=80',
        completed: true,
        date: '۱۴۰۴/۱۲/۱۲',
        order: 3,
        createdAt: now,
      },
      {
        id: 'stage_304',
        projectId: 'proj_201',
        title: 'مرحله ۴: مونتاژ مکانیزم قفل ۴ جهته و ریل‌های روانکاری شده ضد سرقت',
        description: 'کوره‌های زبانه‌ها با میله‌های توپر استیل ضد اره نصب گردیده و سیستم ریداکور فعال‌کننده تله قفل آزمایش شد.',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&auto=format&fit=crop&q=80',
        completed: false,
        date: '۱۴۰۴/۱۲/۲۴',
        order: 4,
        createdAt: now,
      },
    ],
    messages: [
      {
        id: 'msg_401',
        projectId: 'proj_201',
        sender: 'customer',
        senderName: 'جناب آقای مهندس کمالی',
        content: 'سلام و خسته نباشید به تیم تولید. عکس‌های مرحله تزریق بتن رو دیدم، عالیه. فقط زمان تحویل اواخر فروردین حتمی هست دیگه؟ برای نصب توی جواهری نیاز به هماهنگی جرثقیل داریم.',
        replyToId: null,
        replyToContent: null,
        createdAt: '۱۴۰۴/۱۲/۱۵ - ۱۱:۳۰',
        isRead: true,
      },
      {
        id: 'msg_402',
        projectId: 'proj_201',
        sender: 'admin',
        senderName: 'مدیریت کارخانه گاوصندوق',
        content: 'سلام جناب مهندس کمالی گرامی. بله خیالتان راحت باشد، تمام مراحل جوشکاری و مکانیزم طبق زمان‌بندی پیش میرود و پس از نقاشی کوره‌ای هماهنگی لازم جهت انتقال و نصب انجام خواهد شد.',
        replyToId: 'msg_401',
        replyToContent: 'سلام و خسته نباشید به تیم تولید. عکس‌های مرحله تزریق بتن رو دیدم، عالیه...',
        createdAt: '۱۴۰۴/۱۲/۱۵ - ۱۲:۱۰',
        isRead: true,
      },
    ],
  };
}

// Database Helper
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading DB:', err);
    return getInitialData();
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// Calculate Persian Solar Year for password generation
function getCurrentSolarYear(): number {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' });
    const formatted = formatter.format(new Date());
    // Convert Persian digits to English digits
    const persianToEnglish: Record<string, string> = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    };
    const enStr = formatted.replace(/[۰-۹]/g, w => persianToEnglish[w] || w);
    const parsed = parseInt(enStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? 1405 : parsed;
  } catch {
    return 1405;
  }
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Helpers for input normalization (Persian/Arabic digits and keyboard conversion)
function normalizeInputString(str: any): string {
  if (!str) return '';
  return String(str)
    .trim()
    .replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
    .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
}

function convertPersianKeyboardToEnglish(str: string): string {
  const faToEnMap: Record<string, string> = {
    'ش': 'a', 'س': 's', 'ی': 'd', 'ب': 'f', 'ل': 'g', 'ا': 'h', 'ت': 'j', 'ن': 'k', 'م': 'l',
    'ض': 'q', 'ص': 'w', 'ث': 'e', 'ق': 'r', 'ف': 't', 'غ': 'y', 'ع': 'u', 'ه': 'i', 'خ': 'o', 'ح': 'p',
    'ج': '[', 'چ': ']', 'ظ': 'z', 'ط': 'x', 'ز': 'c', 'ر': 'v', 'ذ': 'b', 'د': 'n', 'پ': 'm', 'و': ','
  };
  return str.split('').map(char => faToEnMap[char] || char).join('');
}

// Auth: Login (Unified Gateway with Automatic Role & Permission Detection)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'شناسه کاربری و کلمه عبور الزامی است.' });
  }

  const db = readDB();
  const cleanInput = normalizeInputString(username);
  const cleanPassword = normalizeInputString(password);
  const convertedInput = convertPersianKeyboardToEnglish(cleanInput).toLowerCase();
  const convertedPassword = convertPersianKeyboardToEnglish(cleanPassword).toLowerCase();

  // 1. Check Admin Account (supports admin, Admin, ADMIN, ادمین, مدیر, or keyboard mis-switch)
  const isAdminUsername =
    (db.admin.username && db.admin.username.toLowerCase() === cleanInput.toLowerCase()) ||
    cleanInput.toLowerCase() === 'admin' ||
    convertedInput === 'admin' ||
    cleanInput === 'ادمین' ||
    cleanInput === 'مدیر' ||
    cleanInput === 'مدیریت';

  const expectedAdminPass = (db.admin.password || 'admin').trim();
  const isAdminPassword =
    cleanPassword === expectedAdminPass ||
    cleanPassword.toLowerCase() === expectedAdminPass.toLowerCase() ||
    convertedPassword === expectedAdminPass.toLowerCase() ||
    (expectedAdminPass.toLowerCase() === 'admin' && (
      cleanPassword.toLowerCase() === 'admin' ||
      convertedPassword === 'admin' ||
      cleanPassword === 'ادمین' ||
      cleanPassword === 'شقیهد' ||
      cleanPassword === 'شیمهد'
    ));

  if (isAdminUsername && isAdminPassword) {
    return res.json({
      success: true,
      user: {
        role: 'admin',
        id: db.admin.id || 'admin_1',
        username: db.admin.username || 'admin',
        name: 'مدیریت کارخانه گاوصندوق فرنیو',
        permissions: {
          canManageProjects: true,
          canCreateProject: true,
          canEditStages: true,
          canUploadStageMedia: true,
          canManageCustomers: true,
          canManageSettings: true,
          canExportReports: true,
          canSendChatMessages: true,
          canViewAllProjects: true,
        },
      },
    });
  }

  // 2. Check Customer Accounts (supports login by username OR phone number, with digit normalization)
  const normalizedCleanInput = cleanInput.replace(/\s+/g, '').toLowerCase();
  const customer = db.customers.find((c: any) => {
    const custUser = (c.username || '').trim().toLowerCase();
    const custPhone = normalizeInputString(c.phone || '').replace(/\s+/g, '');
    const custPass = (c.password || '').trim();

    const matchUsername = custUser === normalizedCleanInput || custUser === convertedInput;
    const matchPhone = custPhone === normalizedCleanInput;
    const matchPass =
      custPass === cleanPassword ||
      custPass.toLowerCase() === cleanPassword.toLowerCase() ||
      custPass.toLowerCase() === convertedPassword;

    return (matchUsername || matchPhone) && matchPass;
  });

  if (customer) {
    return res.json({
      success: true,
      user: {
        role: 'customer',
        id: customer.id,
        username: customer.username,
        name: customer.name,
        permissions: {
          canManageProjects: false,
          canCreateProject: false,
          canEditStages: false,
          canUploadStageMedia: false,
          canManageCustomers: false,
          canManageSettings: false,
          canExportReports: false,
          canSendChatMessages: true,
          canViewAllProjects: false,
        },
      },
    });
  }

  return res.status(401).json({ error: 'شناسه کاربری (نام کاربری یا شماره همراه) یا کلمه عبور اشتباه است.' });
});

// Auth: Change Admin username & password
app.post('/api/auth/change-admin-password', (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  const db = readDB();

  if (db.admin.password !== currentPassword) {
    return res.status(400).json({ error: 'رمز عبور فعلی ادمین نادرست است.' });
  }

  if (!newUsername || !newPassword) {
    return res.status(400).json({ error: 'نام کاربری و رمز جدید نمی‌تواند خالی باشد.' });
  }

  db.admin.username = newUsername.trim();
  db.admin.password = newPassword.trim();
  db.admin.updatedAt = new Date().toISOString();
  writeDB(db);

  res.json({
    success: true,
    message: 'اطلاعات ورود ادمین با موفقیت به‌روزرسانی شد.',
    user: {
      role: 'admin',
      id: db.admin.id,
      username: db.admin.username,
      name: 'مدیریت کارخانه گاوصندوق',
    },
  });
});

// Customers: Get all
app.get('/api/customers', (_req, res) => {
  const db = readDB();
  const customersWithStats = db.customers.map((c: any) => {
    const customerProjects = db.projects.filter((p: any) => p.customerId === c.id);
    return {
      ...c,
      projectsCount: customerProjects.length,
    };
  });
  res.json(customersWithStats);
});

// Customers: Create customer with auto-generated solar-year + username password
app.post('/api/customers', (req, res) => {
  const { name, username, phone, address, notes, customPassword } = req.body;
  if (!name || !username || !phone) {
    return res.status(400).json({ error: 'نام، نام کاربری و شماره تماس الزامی هستند.' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
  const db = readDB();

  // Check unique username
  if (db.customers.some((c: any) => c.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: 'این نام کاربری قبلاً برای مشتری دیگری ثبت شده است.' });
  }

  // Auto-generate password: Persian Solar Year + username (e.g. 1405 + username)
  const solarYear = getCurrentSolarYear();
  const defaultPassword = `${solarYear}${cleanUsername}`;
  const finalPassword = customPassword && customPassword.trim().length > 0 ? customPassword.trim() : defaultPassword;

  const newCustomer = {
    id: 'cust_' + Date.now(),
    name: name.trim(),
    username: cleanUsername,
    password: finalPassword,
    phone: phone.trim(),
    address: address ? address.trim() : '',
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString(),
  };

  db.customers.unshift(newCustomer);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'مشتری با موفقیت تعریف شد.',
    customer: newCustomer,
    generatedPassword: finalPassword,
  });
});

// Customers: Delete
app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.customers = db.customers.filter((c: any) => c.id !== id);
  // Also clean up projects & stages associated
  const projectIdsToDelete = db.projects.filter((p: any) => p.customerId === id).map((p: any) => p.id);
  db.projects = db.projects.filter((p: any) => p.customerId !== id);
  db.stages = db.stages.filter((s: any) => !projectIdsToDelete.includes(s.projectId));
  db.messages = db.messages.filter((m: any) => !projectIdsToDelete.includes(m.projectId));

  writeDB(db);
  res.json({ success: true, message: 'مشتری و تمام پروژه‌های وابسته حذف شدند.' });
});

// Projects: Get list (filterable by customerId)
app.get('/api/projects', (req, res) => {
  const { customerId } = req.query;
  const db = readDB();

  let projects = db.projects;
  if (customerId) {
    projects = projects.filter((p: any) => p.customerId === customerId);
  }

  // Attach customer details and counts
  const enrichedProjects = projects.map((p: any) => {
    const customer = db.customers.find((c: any) => c.id === p.customerId);
    const stages = db.stages.filter((s: any) => s.projectId === p.id);
    const messages = db.messages.filter((m: any) => m.projectId === p.id);
    const completedStages = stages.filter((s: any) => s.completed).length;

    return {
      ...p,
      customerName: customer ? customer.name : 'نامشخص',
      customerPhone: customer ? customer.phone : '',
      stagesCount: stages.length,
      completedStagesCount: completedStages,
      messagesCount: messages.length,
      unreadMessagesCount: messages.filter((m: any) => !m.isRead).length,
    };
  });

  res.json(enrichedProjects);
});

// Projects: Get single by ID with stages and messages
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const project = db.projects.find((p: any) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'پروژه مورد نظر یافت نشد.' });
  }

  const customer = db.customers.find((c: any) => c.id === project.customerId);
  const stages = db.stages
    .filter((s: any) => s.projectId === id)
    .sort((a: any, b: any) => a.order - b.order);
  const messages = db.messages
    .filter((m: any) => m.projectId === id)
    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({
    ...project,
    customer,
    stages,
    messages,
  });
});

// Projects: Create
app.post('/api/projects', (req, res) => {
  const { customerId, title, safeType, dimensions, weight, lockType, startDate, estimatedDelivery, notes } = req.body;
  if (!customerId || !title) {
    return res.status(400).json({ error: 'انتخاب مشتری و عنوان پروژه الزامی است.' });
  }

  const db = readDB();
  const customer = db.customers.find((c: any) => c.id === customerId);
  if (!customer) {
    return res.status(400).json({ error: 'مشتری انتخاب شده معتبر نیست.' });
  }

  const now = new Date().toISOString();
  const newProject = {
    id: 'proj_' + Date.now(),
    customerId,
    title: title.trim(),
    safeType: safeType ? safeType.trim() : 'سفارشی ضد سرقت',
    dimensions: dimensions ? dimensions.trim() : 'استاندارد',
    weight: weight ? weight.trim() : 'نامشخص',
    lockType: lockType ? lockType.trim() : 'سیستم مکانیکی و دیجیتال',
    status: 'in_progress',
    startDate: startDate || '۱۴۰۵/۰۱/۰۱',
    estimatedDelivery: estimatedDelivery || '۱۴۰۵/۰۲/۰۱',
    notes: notes ? notes.trim() : '',
    createdAt: now,
    updatedAt: now,
  };

  db.projects.unshift(newProject);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'پروژه ساخت گاوصندوق با موفقیت ایجاد شد.',
    project: newProject,
  });
});

// Projects: Update
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.projects.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'پروژه یافت نشد.' });
  }

  const allowedFields = [
    'title', 'safeType', 'dimensions', 'weight', 'lockType',
    'status', 'startDate', 'estimatedDelivery', 'notes', 'customerId'
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      db.projects[index][field] = req.body[field];
    }
  }

  db.projects[index].updatedAt = new Date().toISOString();
  writeDB(db);

  res.json({ success: true, project: db.projects[index] });
});

// Projects: Delete
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.projects = db.projects.filter((p: any) => p.id !== id);
  db.stages = db.stages.filter((s: any) => s.projectId !== id);
  db.messages = db.messages.filter((m: any) => m.projectId !== id);
  writeDB(db);
  res.json({ success: true, message: 'پروژه با موفقیت حذف گردید.' });
});

// Stages: Create with local OS file upload
app.post('/api/projects/:id/stages', upload.single('image'), (req, res) => {
  const { id: projectId } = req.params;
  const { title, description, date, completed } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'عنوان مرحله الزامی است.' });
  }

  const db = readDB();
  const project = db.projects.find((p: any) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'پروژه یافت نشد.' });
  }

  // Get uploaded file URL or default fallback
  let imageUrl = '';
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.imageUrl) {
    imageUrl = req.body.imageUrl;
  } else {
    imageUrl = 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1000&auto=format&fit=crop&q=80';
  }

  // Calculate order
  const existingStages = db.stages.filter((s: any) => s.projectId === projectId);
  const nextOrder = existingStages.length + 1;

  const newStage = {
    id: 'stage_' + Date.now(),
    projectId,
    title: title.trim(),
    description: description ? description.trim() : '',
    imageUrl,
    completed: completed === 'true' || completed === true,
    date: date || new Intl.DateTimeFormat('fa-IR').format(new Date()),
    order: nextOrder,
    createdAt: new Date().toISOString(),
  };

  db.stages.push(newStage);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'مرحله جدید ساخت با موفقیت ذخیره شد.',
    stage: newStage,
  });
});

// Stages: Toggle completion or update with optional new image upload
app.put('/api/stages/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const stage = db.stages.find((s: any) => s.id === id);
  if (!stage) {
    return res.status(404).json({ error: 'مرحله یافت نشد.' });
  }

  if (req.body.completed !== undefined) {
    stage.completed = req.body.completed === 'true' || req.body.completed === true;
  }
  if (req.body.title !== undefined && req.body.title.trim()) {
    stage.title = req.body.title.trim();
  }
  if (req.body.description !== undefined) {
    stage.description = req.body.description.trim();
  }
  if (req.body.date !== undefined && req.body.date.trim()) {
    stage.date = req.body.date.trim();
  }
  if (req.body.order !== undefined) {
    const parsedOrder = parseInt(req.body.order, 10);
    if (!isNaN(parsedOrder)) stage.order = parsedOrder;
  }

  // If a new image is uploaded, remove old uploaded file if local
  if (req.file) {
    if (stage.imageUrl && stage.imageUrl.startsWith('/uploads/')) {
      const oldFilename = path.basename(stage.imageUrl);
      const oldFilePath = path.join(UPLOADS_DIR, oldFilename);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.warn('Could not delete old image file:', e);
        }
      }
    }
    stage.imageUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.imageUrl && req.body.imageUrl.trim()) {
    stage.imageUrl = req.body.imageUrl.trim();
  }

  writeDB(db);
  res.json({ success: true, stage, message: 'اطلاعات مرحله با موفقیت به‌روزرسانی شد.' });
});

// Stages: Delete
app.delete('/api/stages/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const stage = db.stages.find((s: any) => s.id === id);

  if (stage && stage.imageUrl.startsWith('/uploads/')) {
    const filename = path.basename(stage.imageUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete image file:', e);
      }
    }
  }

  db.stages = db.stages.filter((s: any) => s.id !== id);
  writeDB(db);
  res.json({ success: true, message: 'مرحله با موفقیت حذف شد.' });
});

// Messages: Post message / reply
app.post('/api/projects/:id/messages', (req, res) => {
  const { id: projectId } = req.params;
  const { sender, senderName, content, replyToId } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'متن پیام نمی‌تواند خالی باشد.' });
  }

  const db = readDB();
  const project = db.projects.find((p: any) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'پروژه یافت نشد.' });
  }

  let replyToContent = null;
  if (replyToId) {
    const target = db.messages.find((m: any) => m.id === replyToId);
    if (target) {
      replyToContent = target.content.length > 60 ? target.content.substring(0, 60) + '...' : target.content;
    }
  }

  const nowFa = new Intl.DateTimeFormat('fa-IR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const newMessage = {
    id: 'msg_' + Date.now(),
    projectId,
    sender: sender || 'customer',
    senderName: senderName || (sender === 'admin' ? 'مدیریت کارخانه' : 'مشتری'),
    content: content.trim(),
    replyToId: replyToId || null,
    replyToContent,
    createdAt: nowFa,
    isRead: sender === 'admin',
  };

  db.messages.push(newMessage);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'پیام ارسال شد.',
    data: newMessage,
  });
});

// Notifications: Get unread messages for Admin
app.get('/api/admin/notifications', (_req, res) => {
  const db = readDB();
  const unreadMessages = db.messages
    .filter((m: any) => !m.isRead && m.sender === 'customer')
    .map((m: any) => {
      const project = db.projects.find((p: any) => p.id === m.projectId);
      const customer = db.customers.find((c: any) => c.id === project?.customerId);
      return {
        id: m.id,
        projectId: m.projectId,
        projectTitle: project ? project.title : 'پروژه فرنیو',
        customerName: customer ? customer.name : (m.senderName || 'خریدار'),
        customerPhone: customer ? customer.phone : '',
        content: m.content,
        createdAt: m.createdAt,
      };
    })
    .reverse();

  res.json({
    unreadCount: unreadMessages.length,
    notifications: unreadMessages,
  });
});

// Notifications: Mark messages of a project as read
app.post('/api/projects/:id/messages/mark-read', (req, res) => {
  const { id: projectId } = req.params;
  const db = readDB();
  let updatedCount = 0;

  db.messages.forEach((m: any) => {
    if (m.projectId === projectId && m.sender === 'customer' && !m.isRead) {
      m.isRead = true;
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    writeDB(db);
  }

  res.json({ success: true, updatedCount });
});

// Notifications: Mark all unread messages as read
app.post('/api/messages/mark-all-read', (_req, res) => {
  const db = readDB();
  let updatedCount = 0;

  db.messages.forEach((m: any) => {
    if (m.sender === 'customer' && !m.isRead) {
      m.isRead = true;
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    writeDB(db);
  }

  res.json({ success: true, updatedCount });
});

// Export PHP & MySQL standalone code package endpoint
app.get('/api/php-deployment-package', (_req, res) => {
  const sqlScript = `-- ====================================================
-- Safe Box Manufacturing Tracking System
-- MySQL Database Schema
-- Charset: utf8mb4_unicode_ci
-- ====================================================

CREATE DATABASE IF NOT EXISTS \`safebox_tracker\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`safebox_tracker\`;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS \`admins\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(100) DEFAULT 'مدیریت کارخانه گاوصندوق',
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`admins\` (\`username\`, \`password\`, \`name\`) 
VALUES ('admin', 'admin', 'مدیریت کارخانه گاوصندوق')
ON DUPLICATE KEY UPDATE \`username\` = \`username\`;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`phone\` VARCHAR(30) NOT NULL,
  \`address\` TEXT NULL,
  \`notes\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS \`projects\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`customer_id\` INT NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`safe_type\` VARCHAR(100) DEFAULT 'سفارشی ضد سرقت',
  \`dimensions\` VARCHAR(100) DEFAULT 'استاندارد',
  \`weight\` VARCHAR(100) DEFAULT 'نامشخص',
  \`lock_type\` VARCHAR(150) DEFAULT 'مکانیکی و دیجیتال',
  \`status\` ENUM('in_progress', 'completed', 'on_hold') DEFAULT 'in_progress',
  \`start_date\` VARCHAR(50) NULL,
  \`estimated_delivery\` VARCHAR(50) NULL,
  \`notes\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Project Stages Table (With Local Image Path)
CREATE TABLE IF NOT EXISTS \`stages\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`project_id\` INT NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`description\` TEXT NULL,
  \`image_url\` VARCHAR(255) NOT NULL,
  \`completed\` TINYINT(1) DEFAULT 0,
  \`stage_date\` VARCHAR(50) NULL,
  \`stage_order\` INT DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Messages & Replies Table
CREATE TABLE IF NOT EXISTS \`messages\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`project_id\` INT NOT NULL,
  \`sender\` ENUM('customer', 'admin') NOT NULL,
  \`sender_name\` VARCHAR(100) NOT NULL,
  \`content\` TEXT NOT NULL,
  \`reply_to_id\` INT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`is_read\` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

  const phpConfig = `<?php
/**
 * Configuration & Database Connection for Safe Box Tracker
 */
define('DB_HOST', 'localhost');
define('DB_NAME', 'safebox_tracker');
define('DB_USER', 'root');
define('DB_PASS', '');
define('UPLOADS_DIR', __DIR__ . '/uploads/');

// Create uploads folder if not exists
if (!file_exists(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
`;

  const phpApi = `<?php
/**
 * Standalone Single-File PHP Backend API for Safe Box Manufacturing Tracking
 * Supports: Login, Customers, Projects, Local Image Uploads, Messages & Replies
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($action) {
    // 1. LOGIN
    case 'login':
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        // Check Admin
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ? AND password = ?");
        $stmt->execute([$username, $password]);
        $admin = $stmt->fetch();
        if ($admin) {
            echo json_encode([
                'success' => true,
                'user' => ['role' => 'admin', 'id' => $admin['id'], 'username' => $admin['username'], 'name' => $admin['name']]
            ]);
            exit;
        }

        // Check Customer
        $stmt = $pdo->prepare("SELECT * FROM customers WHERE username = ? AND password = ?");
        $stmt->execute([$username, $password]);
        $customer = $stmt->fetch();
        if ($customer) {
            echo json_encode([
                'success' => true,
                'user' => ['role' => 'customer', 'id' => $customer['id'], 'username' => $customer['username'], 'name' => $customer['name']]
            ]);
            exit;
        }

        http_response_code(401);
        echo json_encode(['error' => 'نام کاربری یا رمز عبور اشتباه است.']);
        break;

    // 2. CHANGE ADMIN CREDENTIALS
    case 'change_admin':
        $currentPass = trim($input['currentPassword'] ?? '');
        $newUsername = trim($input['newUsername'] ?? '');
        $newPassword = trim($input['newPassword'] ?? '');

        $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = 1 AND password = ?");
        $stmt->execute([$currentPass]);
        if (!$stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'رمز عبور فعلی نادرست است.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE admins SET username = ?, password = ? WHERE id = 1");
        $stmt->execute([$newUsername, $newPassword]);
        echo json_encode(['success' => true, 'message' => 'مشخصات ادمین به‌روزرسانی شد.']);
        break;

    // 3. GET CUSTOMERS
    case 'customers':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT c.*, COUNT(p.id) as projectsCount FROM customers c LEFT JOIN projects p ON p.customer_id = c.id GROUP BY c.id ORDER BY c.id DESC");
            echo json_encode($stmt->fetchAll());
        } elseif ($method === 'POST') {
            $name = trim($input['name'] ?? '');
            $username = strtolower(trim($input['username'] ?? ''));
            $phone = trim($input['phone'] ?? '');
            $address = trim($input['address'] ?? '');
            $notes = trim($input['notes'] ?? '');
            $customPassword = trim($input['customPassword'] ?? '');

            // Auto password: 1405 + username
            $password = !empty($customPassword) ? $customPassword : ('1405' . $username);

            $stmt = $pdo->prepare("INSERT INTO customers (name, username, password, phone, address, notes) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $username, $password, $phone, $address, $notes]);

            echo json_encode([
                'success' => true,
                'customer' => ['id' => $pdo->lastInsertId(), 'name' => $name, 'username' => $username, 'password' => $password, 'phone' => $phone]
            ]);
        }
        break;

    // 4. GET PROJECTS
    case 'projects':
        $customerId = $_GET['customerId'] ?? null;
        $sql = "SELECT p.*, c.name as customerName, c.phone as customerPhone FROM projects p JOIN customers c ON p.customer_id = c.id";
        $params = [];
        if ($customerId) {
            $sql .= " WHERE p.customer_id = ?";
            $params[] = $customerId;
        }
        $sql .= " ORDER BY p.id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
        break;

    // 5. UPLOAD STAGE WITH LOCAL LINUX OS STORAGE
    case 'add_stage':
        $projectId = $_POST['projectId'] ?? 0;
        $title = trim($_POST['title'] ?? '');
        $desc = trim($_POST['description'] ?? '');
        $date = trim($_POST['date'] ?? date('Y-m-d'));
        $completed = isset($_POST['completed']) && $_POST['completed'] == '1' ? 1 : 0;

        $imageUrl = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $filename = 'safe_stage_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
            $dest = UPLOADS_DIR . $filename;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
                $imageUrl = 'uploads/' . $filename;
            }
        }

        $stmt = $pdo->prepare("INSERT INTO stages (project_id, title, description, image_url, completed, stage_date) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$projectId, $title, $desc, $imageUrl, $completed, $date]);

        echo json_encode(['success' => true, 'stageId' => $pdo->lastInsertId(), 'imageUrl' => $imageUrl]);
        break;

    // 6. MESSAGES
    case 'messages':
        if ($method === 'GET') {
            $projectId = $_GET['projectId'] ?? 0;
            $stmt = $pdo->prepare("SELECT * FROM messages WHERE project_id = ? ORDER BY id ASC");
            $stmt->execute([$projectId]);
            echo json_encode($stmt->fetchAll());
        } elseif ($method === 'POST') {
            $projectId = $input['projectId'] ?? 0;
            $sender = $input['sender'] ?? 'customer';
            $senderName = $input['senderName'] ?? '';
            $content = trim($input['content'] ?? '');
            $replyToId = $input['replyToId'] ?? null;

            $stmt = $pdo->prepare("INSERT INTO messages (project_id, sender, sender_name, content, reply_to_id) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$projectId, $sender, $senderName, $content, $replyToId]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        }
        break;

    default:
        echo json_encode(['status' => 'Safe Box Manufacturing API is running.']);
        break;
}
`;

  res.json({
    sql: sqlScript,
    configPhp: phpConfig,
    apiPhp: phpApi,
    instructions: `راهنمای نصب آسان روی هاست‌های لینوکس (cPanel / DirectAdmin):
1. در هاست خود یک دیتابیس MySQL بسازید (مثلاً safebox_tracker).
2. وارد phpMyAdmin شوید و فایل safebox_schema.sql را ایمپورت (Import) کنید.
3. فایل config.php را باز کرده و نام کاربری و پسورد دیتابیس خود را وارد کنید.
4. فایل‌های api.php و config.php را درون پوشه public_html یا یک ساب‌فولدر قرار دهید.
5. یک پوشه به نام uploads بسازید و دسترسی (Permissions) آن را روی 755 یا 777 قرار دهید تا عکس‌های مراحل گاوصندوق مستقیماً روی هارد لینوکس ذخیره شوند بدون نیاز به خرید استوریج جانبی!
6. نام کاربری و رمز عبور پیش‌فرض ادمین admin / admin می‌باشد که می‌توانید از بخش تنظیمات تغییر دهید.`,
  });
});

// ==================== VITE & STATIC FALLBACK ====================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
});
