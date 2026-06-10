export interface Item {
    id: string;
    title: string;
    type: ItemType,
    fields?: any;
}

export enum ItemType {
    red = 'red',
    green = 'green',
    blue = 'blue',
    yellow = 'yellow'
}

export interface Link {
    records: string[];
    type: string;
}