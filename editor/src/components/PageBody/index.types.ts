
export interface PageState {
    [x: string]: any
}
export interface Menu {
    title?: string,
    href?: string,
    onIcon?: (pageState?: PageState) => any,
    onTitle?: (title?: string, pageState?: PageState) => any,
    onClick?: (e?: any, pageState?: {[x: string]: any}) => void,
    children?: Menu[],
    forceMobileDisplay?: boolean
}/*
export interface Menu {
    title?: string,
    data?: MenuData | MenuData[],
    onIcon?: () => any,
    onClick?: (e?: any, t?: any, pageState?: any) => void
}*/