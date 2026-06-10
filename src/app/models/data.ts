import { Item, ItemType, Link } from './spider.model';

// Расширенный список объектов (20+ элементов)
export const items: Item[] = [
  // Центральные элементы
  {
    id: 'center_001',
    title: 'Центральный Хаб',
    type: ItemType.red,
  },
  {
    id: 'hub_002',
    title: 'Главный Узел',
    type: ItemType.red,
  },
  
  // Первый уровень связей (зеленые)
  {
    id: 'green_001',
    title: 'База Данных',
    type: ItemType.green,
  },
  {
    id: 'green_002',
    title: 'API Сервер',
    type: ItemType.green,
  },
  {
    id: 'green_003',
    title: 'Кэш Хранилище',
    type: ItemType.green,
  },
  {
    id: 'green_004',
    title: 'Логи Сервис',
    type: ItemType.green,
  },
  {
    id: 'green_005',
    title: 'Аутентификация',
    type: ItemType.green,
  },
  
  // Второй уровень связей (синие)
  {
    id: 'blue_001',
    title: 'Пользователи',
    type: ItemType.blue,
  },
  {
    id: 'blue_002',
    title: 'Заказы',
    type: ItemType.blue,
  },
  {
    id: 'blue_003',
    title: 'Товары',
    type: ItemType.blue,
  },
  {
    id: 'blue_004',
    title: 'Категории',
    type: ItemType.blue,
  },
  {
    id: 'blue_005',
    title: 'Отзывы',
    type: ItemType.blue,
  },
  {
    id: 'blue_006',
    title: 'Платежи',
    type: ItemType.blue,
  },
  
  // Третий уровень связей (желтые)
  {
    id: 'yellow_001',
    title: 'Аналитика',
    type: ItemType.yellow,
  },
  {
    id: 'yellow_002',
    title: 'Отчеты',
    type: ItemType.yellow,
  },
  {
    id: 'yellow_003',
    title: 'Дашборды',
    type: ItemType.yellow,
  },
  {
    id: 'yellow_004',
    title: 'Мониторинг',
    type: ItemType.yellow,
  },
  {
    id: 'yellow_005',
    title: 'Уведомления',
    type: ItemType.yellow,
  },
  
  // Дополнительные узлы для сложных связей
  {
    id: 'extra_001',
    title: 'Микросервис A',
    type: ItemType.red,
  },
  {
    id: 'extra_002',
    title: 'Микросервис B',
    type: ItemType.green,
  },
  {
    id: 'extra_003',
    title: 'База Redis',
    type: ItemType.blue,
  },
  {
    id: 'extra_004',
    title: 'Очередь Rabbit',
    type: ItemType.yellow,
  },
  {
    id: 'extra_005',
    title: 'Шлюз API',
    type: ItemType.red,
  },
];

// Расширенный список связей
export const links: Link[] = [
  // Связи от Центрального Хаба
  {
    records: ['center_001', 'green_001'],
    type: 'red_green',
  },
  {
    records: ['center_001', 'green_002'],
    type: 'red_green',
  },
  {
    records: ['center_001', 'green_003'],
    type: 'red_green',
  },
  {
    records: ['center_001', 'green_004'],
    type: 'red_green',
  },
  {
    records: ['center_001', 'blue_001'],
    type: 'red_blue',
  },
  {
    records: ['center_001', 'blue_002'],
    type: 'red_blue',
  },
  {
    records: ['center_001', 'yellow_001'],
    type: 'red_yellow',
  },
  
  // Связи от Главного Узла
  {
    records: ['hub_002', 'green_005'],
    type: 'red_green',
  },
  {
    records: ['hub_002', 'blue_003'],
    type: 'red_blue',
  },
  {
    records: ['hub_002', 'yellow_002'],
    type: 'red_yellow',
  },
  {
    records: ['hub_002', 'extra_001'],
    type: 'red_green',
  },
  
  // Связи между зелеными (внутренние)
  {
    records: ['green_001', 'green_002'],
    type: 'red_green',
  },
  {
    records: ['green_002', 'green_003'],
    type: 'red_green',
  },
  {
    records: ['green_003', 'green_004'],
    type: 'red_green',
  },
  
  // Связи зеленых с синими
  {
    records: ['green_001', 'blue_004'],
    type: 'red_blue',
  },
  {
    records: ['green_002', 'blue_005'],
    type: 'red_blue',
  },
  {
    records: ['green_003', 'blue_006'],
    type: 'red_blue',
  },
  {
    records: ['green_004', 'blue_001'],
    type: 'red_blue',
  },
  {
    records: ['green_005', 'blue_002'],
    type: 'red_blue',
  },
  
  // Связи зеленых с желтыми
  {
    records: ['green_001', 'yellow_003'],
    type: 'red_yellow',
  },
  {
    records: ['green_002', 'yellow_004'],
    type: 'red_yellow',
  },
  {
    records: ['green_003', 'yellow_005'],
    type: 'red_yellow',
  },
  
  // Связи синих между собой
  {
    records: ['blue_001', 'blue_002'],
    type: 'red_blue',
  },
  {
    records: ['blue_002', 'blue_003'],
    type: 'red_blue',
  },
  {
    records: ['blue_003', 'blue_004'],
    type: 'red_blue',
  },
  {
    records: ['blue_004', 'blue_005'],
    type: 'red_blue',
  },
  {
    records: ['blue_005', 'blue_006'],
    type: 'red_blue',
  },
  
  // Связи синих с желтыми
  {
    records: ['blue_001', 'yellow_001'],
    type: 'red_yellow',
  },
  {
    records: ['blue_002', 'yellow_002'],
    type: 'red_yellow',
  },
  {
    records: ['blue_003', 'yellow_003'],
    type: 'red_yellow',
  },
  {
    records: ['blue_004', 'yellow_004'],
    type: 'red_yellow',
  },
  {
    records: ['blue_005', 'yellow_005'],
    type: 'red_yellow',
  },
  
  // Связи желтых между собой
  {
    records: ['yellow_001', 'yellow_002'],
    type: 'red_yellow',
  },
  {
    records: ['yellow_002', 'yellow_003'],
    type: 'red_yellow',
  },
  {
    records: ['yellow_003', 'yellow_004'],
    type: 'red_yellow',
  },
  {
    records: ['yellow_004', 'yellow_005'],
    type: 'red_yellow',
  },
  
  // Сложные кросс-связи
  {
    records: ['green_001', 'extra_002'],
    type: 'red_green',
  },
  {
    records: ['blue_002', 'extra_003'],
    type: 'red_blue',
  },
  {
    records: ['yellow_003', 'extra_004'],
    type: 'red_yellow',
  },
  {
    records: ['extra_001', 'extra_005'],
    type: 'red_green',
  },
  {
    records: ['extra_002', 'extra_003'],
    type: 'red_blue',
  },
  {
    records: ['extra_004', 'extra_005'],
    type: 'red_yellow',
  },
  
  // Многоуровневые связи
  {
    records: ['center_001', 'extra_005'],
    type: 'red_green',
  },
  {
    records: ['hub_002', 'extra_003'],
    type: 'red_blue',
  },
  {
    records: ['green_002', 'extra_004'],
    type: 'red_yellow',
  },
  {
    records: ['blue_006', 'extra_002'],
    type: 'red_blue',
  },
  {
    records: ['yellow_005', 'extra_001'],
    type: 'red_yellow',
  },
];

// Экспорт для удобства использования
export const statistics = {
  totalItems: items.length,
  totalLinks: links.length,
  redItems: items.filter(i => i.type === ItemType.red).length,
  greenItems: items.filter(i => i.type === ItemType.green).length,
  blueItems: items.filter(i => i.type === ItemType.blue).length,
  yellowItems: items.filter(i => i.type === ItemType.yellow).length,
  red_greenLinks: links.filter(l => l.type === 'red_green').length,
  red_blueLinks: links.filter(l => l.type === 'red_blue').length,
  red_yellowLinks: links.filter(l => l.type === 'red_yellow').length,
};
