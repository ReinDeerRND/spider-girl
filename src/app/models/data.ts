import { Item, ItemType, Link } from './spider.model';

export const items: Item[] = [
  {
    id: 'kfjgh8574',
    title: 'Title1',
    type: ItemType.red,
  },
  {
    id: 'kfftgh574',
    title: 'Title2',
    type: ItemType.green,
  },
  {
    id: 'k6554574',
    title: 'Title3',
    type: ItemType.green,
  },
  {
    id: 'dfgh574',
    title: 'Title4',
    type: ItemType.blue,
  },
  {
    id: 'hgyj574',
    title: 'Title5',
    type: ItemType.yellow,
  },
  {
    id: 'hgfgthgy74',
    title: 'Title6',
    type: ItemType.red,
  },
];

export const links: Link[] = [
  {
    records: ['kfjgh8574', 'kfftgh574'],
    type: 'red_green',
  },
  {
    records: ['kfjgh8574', 'k6554574'],
    type: 'red_green',
  },
  {
    records: ['kfjgh8574', 'dfgh574'],
    type: 'red_blue',
  },
  {
    records: ['kfjgh8574', 'hgyj574'],
    type: 'red_yellow',
  },
  {
    records: ['hgfgthgy74', 'hgyj574'],
    type: 'red_yellow',
  },
];
