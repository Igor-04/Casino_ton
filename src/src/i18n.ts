// Internationalization configuration for TON Games
// Currently supports Russian language

export interface Translations {
  // Common
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    close: string
    back: string
    next: string
    refresh: string
    copy: string
    copied: string
    share: string
  }
  
  // App
  app: {
    name: string
    title: string
    initializing: string
  }
  
  // Wallet
  wallet: {
    connect: string
    disconnect: string
    disconnected: string
    connected: string
    balance: string
    switchNetwork: string
    networkWarning: string
  }
  
  // Navigation
  navigation: {
    games: string
    history: string
    create: string
    profile: string
  }
  
  // Games
  games: {
    noActiveGames: string
    noActiveGamesDescription: string
    createGame: string
    joinGame: string
    viewHistory: string
    gameCreated: string
    joinedGame: string
    withdrawn: string
  }
  
  // Game details
  gameDetails: {
    stake: string
    bank: string
    participants: string
    deadline: string
    timeLeft: string
    status: string
    minPayout: string
    maxPayout: string
    platformFee: string
  }
  
  // Game status
  status: {
    open: string
    locked: string
    distributed: string
    refunded: string
  }
  
  // Features
  features: {
    lossProtection: string
    lossProtectionDesc: string
    instantPayouts: string
    fullTransparency: string
  }
  
  // Referrals
  referrals: {
    system: string
    code: string
    link: string
    totalInvited: string
    totalEarned: string
    activeInvitees: string
    stats: string
    inviteHistory: string
    noReferrals: string
    inviteFriends: string
    earnFrom: string
    share: string
  }
  
  // Create game
  create: {
    title: string
    gameMode: string
    timeLocked: string
    capacityLocked: string
    stakeAmount: string
    gameDeadline: string
    maxParticipants: string
    createButton: string
  }
  
  // Errors
  errors: {
    walletRequired: string
    networkRequired: string
    createGameFailed: string
    joinGameFailed: string
    withdrawFailed: string
    loadGamesFailed: string
    loadHistoryFailed: string
    transactionFailed: string
  }
  
  // History
  history: {
    roundHistory: string
    yourGames: string
    allGames: string
    profit: string
    loss: string
    participated: string
    won: string
    loadMore: string
    transparency: string
  }
  
  // Onboarding
  onboarding: {
    welcome: string
    welcomeDesc: string
    howItWorks: string
    step1: string
    step1Desc: string
    step2: string
    step2Desc: string
    step3: string
    step3Desc: string
    getStarted: string
  }
}

const translations: Translations = {
  // Common
  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    close: 'Закрыть',
    back: 'Назад',
    next: 'Далее',
    refresh: 'Обновить',
    copy: 'Копировать',
    copied: 'Скопировано!',
    share: 'Поделиться'
  },
  
  // App
  app: {
    name: 'TON Игры',
    title: 'TON Игры',
    initializing: 'Инициализация TON Игр...'
  },
  
  // Wallet
  wallet: {
    connect: 'Подключить кошелек',
    disconnect: 'Отключить кошелек',
    disconnected: 'Кошелек отключен',
    connected: 'Кошелек подключен',
    balance: 'Баланс',
    switchNetwork: 'Переключить сеть',
    networkWarning: 'Пожалуйста, переключитесь на сеть'
  },
  
  // Navigation
  navigation: {
    games: 'Игры',
    history: 'История',
    create: 'Создать',
    profile: 'Профиль'
  },
  
  // Games
  games: {
    noActiveGames: 'Нет активных игр',
    noActiveGamesDescription: 'В данный момент нет открытых раундов',
    createGame: 'Создать игру',
    joinGame: 'Присоединиться',
    viewHistory: 'Посмотреть историю',
    gameCreated: 'Игра успешно создана!',
    joinedGame: 'Вы успешно присоединились к игре!',
    withdrawn: 'Средства успешно выведены!'
  },
  
  // Game details
  gameDetails: {
    stake: 'Взнос',
    bank: 'Банк',
    participants: 'Участники',
    deadline: 'Дедлайн',
    timeLeft: 'Осталось времени',
    status: 'Статус',
    minPayout: 'Мин. выплата',
    maxPayout: 'Макс. выплата',
    platformFee: 'Комиссия платформы'
  },
  
  // Game status
  status: {
    open: 'Открыта',
    locked: 'Заблокирована',
    distributed: 'Завершена',
    refunded: 'Возврат'
  },
  
  // Features
  features: {
    lossProtection: 'Защита от потерь',
    lossProtectionDesc: 'Максимальная потеря 50%',
    instantPayouts: 'Мгновенные выплаты',
    fullTransparency: 'Полная прозрачность'
  },
  
  // Referrals
  referrals: {
    system: 'Реферальная система',
    code: 'Реферальный код',
    link: 'Реферальная ссылка',
    totalInvited: 'Всего приглашено',
    totalEarned: 'Всего заработано',
    activeInvitees: 'Активные приглашенные',
    stats: 'Статистика рефералов',
    inviteHistory: 'История приглашений',
    noReferrals: 'У вас пока нет рефералов',
    inviteFriends: 'Пригласить друзей',
    earnFrom: 'Зарабатывайте 2% с каждой игры друзей',
    share: 'Поделиться'
  },
  
  // Create game
  create: {
    title: 'Создать новую игру',
    gameMode: 'Режим игры',
    timeLocked: 'По времени',
    capacityLocked: 'По участникам',
    stakeAmount: 'Размер взноса',
    gameDeadline: 'Время окончания',
    maxParticipants: 'Макс. участников',
    createButton: 'Создать игру'
  },
  
  // Errors
  errors: {
    walletRequired: 'Сначала подключите кошелек',
    networkRequired: 'Переключитесь на сеть',
    createGameFailed: 'Не удалось создать игру',
    joinGameFailed: 'Не удалось присоединиться к игре',
    withdrawFailed: 'Не удалось вывести средства',
    loadGamesFailed: 'Не удалось загрузить игры',
    loadHistoryFailed: 'Не удалось загрузить историю',
    transactionFailed: 'Ошибка транзакции'
  },
  
  // History
  history: {
    roundHistory: 'История раундов',
    yourGames: 'Ваши игры',
    allGames: 'Все игры',
    profit: 'Прибыль',
    loss: 'Убыток',
    participated: 'Участвовал',
    won: 'Выиграл',
    loadMore: 'Загрузить еще',
    transparency: 'Полная прозрачность'
  },
  
  // Onboarding
  onboarding: {
    welcome: 'Добро пожаловать!',
    welcomeDesc: 'Присоединяйтесь к честным играм в блокчейне TON',
    howItWorks: 'Как это работает',
    step1: 'Подключите кошелек',
    step1Desc: 'Безопасно подключите свой TON кошелек',
    step2: 'Выберите игру',
    step2Desc: 'Найдите игру с подходящим взносом',
    step3: 'Получите выплату',
    step3Desc: 'Выиграйте до 2x от своего взноса',
    getStarted: 'Начать'
  }
}

let currentLanguage: string = 'ru'

export function initializeLanguage(): void {
  // For now, we only support Russian
  // In the future, this can be expanded to support multiple languages
  currentLanguage = 'ru'
}

// Function that returns the full translations object (for backward compatibility)
export function t(): Translations {
  return translations
}

// Individual key access function for convenience
export function tKey(key: keyof Translations): any {
  return translations[key]
}

export function getCurrentLanguage(): string {
  return currentLanguage
}

export function setLanguage(language: string): void {
  currentLanguage = language
  // Here you could load different translation files in the future
}