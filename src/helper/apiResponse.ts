import { Response } from "express";

export type PaginationMeta = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export type ApiResponse<T=null> = {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown|null;
};

export type PaginatedResponse<T> = {
    success: boolean;
    message: string;
    data: T[];
    pagination: PaginationMeta;
};


export const successResponse = <T>(
    res: Response,
    data?: T,
    message = "Success",
    statusCode = 200,
): Response<ApiResponse<T>> => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const errorResponse = (
    res: Response,
    message = "Internal server error",
    statusCode = 500,
    errors: unknown | null = null
): Response<ApiResponse<null>> => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

export const paginatedResponse = <T>(
    res: Response,
    data: T[],
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
    },
    message: string = "Success",
    statusCode: number = 200
): Response<PaginatedResponse<T>> => {
    const totalPages = Math.ceil(
        pagination.totalItems / pagination.limit
    );

    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            totalItems: pagination.totalItems,
            totalPages,
            hasNextPage: pagination.page < totalPages,
            hasPrevPage: pagination.page > 1,
        },
    });
};