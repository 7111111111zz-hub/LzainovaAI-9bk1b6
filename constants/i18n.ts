// Lzainova AI - Internationalization

export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // App
    appName: 'Lzainova AI',
    tagline: 'Private. Autonomous. Yours.',
    allAgentsOnline: '● All Agents Online',

    // Tabs
    chat: 'Chat',
    library: 'Library',
    settings: 'Settings',

    // Chat
    messagePlaceholder: 'Message Lzainova AI...',
    newChat: 'New Chat',
    sending: 'Sending...',
    thinking: 'Thinking...',

    // Modes
    modeChat: 'Chat',
    modeCode: 'Code',
    modeTask: 'Task',
    modeVision: 'Vision',
    modeMemory: 'Memory',

    // Mode descriptions
    modeChatDesc: 'General conversation and questions',
    modeCodeDesc: 'Code analysis, writing and debugging',
    modeTaskDesc: 'Multi-step complex tasks',
    modeVisionDesc: 'Image and file analysis',
    modeMemoryDesc: 'Manage your memory',

    // Suggestions
    suggestion1: 'What is Android?',
    suggestion2: 'Build a to-do app',
    suggestion3: 'Explain neural networks',
    suggestion4: 'Write a Python function',

    // Tools menu
    addFile: 'Add File',
    addImage: 'Add Image',
    addDocument: 'Add Document',
    addCode: 'Add Code',
    selectProject: 'Select Project',
    lzainovaTools: 'Lzainova Tools',
    webSearch: 'Web Search',
    memory: 'Memory',

    // Agent
    taskRunning: 'Task running...',
    analyzeRequirements: 'Analyze requirements',
    createProject: 'Create project',
    writeCode: 'Write code',
    runTests: 'Run tests',
    fixErrors: 'Fix errors',
    finalVerification: 'Final verification',
    delivery: 'Delivery',

    // Task steps
    stepDone: 'Done',
    stepRunning: 'Running...',
    stepPending: 'Pending',
    stepFailed: 'Failed',

    // Library
    projects: 'Projects',
    documents: 'Documents',
    images: 'Images',
    code: 'Code',
    generatedFiles: 'Generated Files',
    newProject: 'New Project',
    projectName: 'Project Name',
    projectType: 'Project Type',
    description: 'Description',
    create: 'Create',
    cancel: 'Cancel',

    // Project types
    androidApp: 'Android App',
    webApp: 'Web Application',
    apiService: 'API Service',
    mlModel: 'ML Model',
    other: 'Other',

    // Project tabs
    files: 'Files',
    tasks: 'Tasks',
    builds: 'Builds',
    tests: 'Tests',
    changes: 'Changes',
    logs: 'Logs',

    // Settings
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
    aiEngine: 'AI Engine',
    model: 'Model',
    agentSettings: 'Agent Settings',
    maxSteps: 'Max Steps',
    autoVerify: 'Auto Verify',
    memorySettings: 'Memory',
    enableMemory: 'Enable Memory',
    clearMemory: 'Clear Memory',
    privacy: 'Privacy',
    about: 'About',
    version: 'Version',

    // Summary
    summary: 'Summary',
    timeline: 'Timeline',
    details: 'Details',
    viewDetails: 'View Details',

    // Execution
    running: 'Running',
    command: 'Command',
    stdout: 'stdout',
    stderr: 'stderr',
    exitCode: 'Exit code',
    status: 'Status',
    success: 'Success',
    failed: 'Failed',

    // Verification
    buildFailed: 'Build failed',
    testsFailed: 'Tests failed',
    verificationFailed: 'Verification failed',

    // Memory
    conversationMemory: 'Conversation Memory',
    projectMemory: 'Project Memory',
    userPreferences: 'User Preferences',
    longTermMemory: 'Long-Term Memory',

    // Errors
    connectionError: 'Connection error. Please check your network.',
    apiKeyRequired: 'API key required',
    backendRequired: 'Backend connection required',

    // Empty states
    noChats: 'No conversations yet',
    noProjects: 'No projects yet',
    startChatting: 'Start a new conversation',
    createFirstProject: 'Create your first project',

    // Code viewer
    copy: 'Copy',
    copied: 'Copied!',
    save: 'Save',
    edit: 'Edit',
    search: 'Search',
    lines: 'lines',
  },

  ar: {
    // App
    appName: 'Lzainova AI',
    tagline: 'خصوصي. مستقل. ملكك.',
    allAgentsOnline: '● جميع الوكلاء متصلون',

    // Tabs
    chat: 'المحادثات',
    library: 'المكتبة',
    settings: 'الإعدادات',

    // Chat
    messagePlaceholder: 'اسأل Lzainova...',
    newChat: 'محادثة جديدة',
    sending: 'جاري الإرسال...',
    thinking: 'جاري التفكير...',

    // Modes
    modeChat: 'محادثة',
    modeCode: 'برمجة',
    modeTask: 'مهمة',
    modeVision: 'رؤية',
    modeMemory: 'ذاكرة',

    // Mode descriptions
    modeChatDesc: 'محادثة عامة وأسئلة',
    modeCodeDesc: 'تحليل وكتابة وتصحيح الكود',
    modeTaskDesc: 'مهام معقدة متعددة الخطوات',
    modeVisionDesc: 'تحليل الصور والملفات',
    modeMemoryDesc: 'إدارة ذاكرتك',

    // Suggestions
    suggestion1: 'ما هو Android؟',
    suggestion2: 'أنشئ تطبيق قائمة مهام',
    suggestion3: 'اشرح الشبكات العصبية',
    suggestion4: 'اكتب دالة Python',

    // Tools menu
    addFile: 'إضافة ملف',
    addImage: 'إضافة صورة',
    addDocument: 'إضافة مستند',
    addCode: 'إضافة كود',
    selectProject: 'اختيار مشروع',
    lzainovaTools: 'أدوات Lzainova',
    webSearch: 'بحث الويب',
    memory: 'الذاكرة',

    // Agent
    taskRunning: 'جاري تنفيذ المهمة...',
    analyzeRequirements: 'تحليل المتطلبات',
    createProject: 'إنشاء المشروع',
    writeCode: 'كتابة الكود',
    runTests: 'تشغيل الاختبارات',
    fixErrors: 'إصلاح الأخطاء',
    finalVerification: 'التحقق النهائي',
    delivery: 'التسليم',

    // Task steps
    stepDone: 'تم',
    stepRunning: 'جاري...',
    stepPending: 'انتظار',
    stepFailed: 'فشل',

    // Library
    projects: 'المشاريع',
    documents: 'المستندات',
    images: 'الصور',
    code: 'الكود',
    generatedFiles: 'الملفات المُنشأة',
    newProject: 'مشروع جديد',
    projectName: 'اسم المشروع',
    projectType: 'نوع المشروع',
    description: 'الوصف',
    create: 'إنشاء',
    cancel: 'إلغاء',

    // Project types
    androidApp: 'تطبيق Android',
    webApp: 'تطبيق ويب',
    apiService: 'خدمة API',
    mlModel: 'نموذج تعلم آلي',
    other: 'أخرى',

    // Project tabs
    files: 'الملفات',
    tasks: 'المهام',
    builds: 'البناء',
    tests: 'الاختبارات',
    changes: 'التغييرات',
    logs: 'السجلات',

    // Settings
    appearance: 'المظهر',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    language: 'اللغة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    aiEngine: 'محرك الذكاء الاصطناعي',
    model: 'النموذج',
    agentSettings: 'إعدادات الوكيل',
    maxSteps: 'الحد الأقصى للخطوات',
    autoVerify: 'التحقق التلقائي',
    memorySettings: 'الذاكرة',
    enableMemory: 'تفعيل الذاكرة',
    clearMemory: 'مسح الذاكرة',
    privacy: 'الخصوصية',
    about: 'حول التطبيق',
    version: 'الإصدار',

    // Summary
    summary: 'الملخص',
    timeline: 'الجدول الزمني',
    details: 'التفاصيل',
    viewDetails: 'عرض التفاصيل',

    // Execution
    running: 'جاري التنفيذ',
    command: 'الأمر',
    stdout: 'المخرجات',
    stderr: 'الأخطاء',
    exitCode: 'كود الخروج',
    status: 'الحالة',
    success: 'نجاح',
    failed: 'فشل',

    // Verification
    buildFailed: 'فشل البناء',
    testsFailed: 'فشلت الاختبارات',
    verificationFailed: 'فشل التحقق',

    // Memory
    conversationMemory: 'ذاكرة المحادثات',
    projectMemory: 'ذاكرة المشاريع',
    userPreferences: 'تفضيلات المستخدم',
    longTermMemory: 'الذاكرة طويلة الأمد',

    // Errors
    connectionError: 'خطأ في الاتصال. تحقق من الشبكة.',
    apiKeyRequired: 'مفتاح API مطلوب',
    backendRequired: 'اتصال بالخادم مطلوب',

    // Empty states
    noChats: 'لا توجد محادثات بعد',
    noProjects: 'لا توجد مشاريع بعد',
    startChatting: 'ابدأ محادثة جديدة',
    createFirstProject: 'أنشئ مشروعك الأول',

    // Code viewer
    copy: 'نسخ',
    copied: 'تم النسخ!',
    save: 'حفظ',
    edit: 'تعديل',
    search: 'بحث',
    lines: 'سطر',
  },
};

export type TranslationKey = keyof typeof translations.en;
