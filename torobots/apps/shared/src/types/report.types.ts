export interface ReportFilter {
    size?: number;
    page: number;
    pageLength?: number;
    sort: {
        field: string;
        order: number;
    };
    token?: string;
    startDate?: string;
    endDate?: string;
}