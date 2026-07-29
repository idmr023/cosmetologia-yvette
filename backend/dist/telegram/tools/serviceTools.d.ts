export interface ServiceInfo {
    id: string;
    name: string;
    category: string;
    durationMin: number;
    price: string;
    description: string | null;
}
export declare function consultarServicios(): Promise<ServiceInfo[]>;
//# sourceMappingURL=serviceTools.d.ts.map