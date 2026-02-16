import React from 'react';
import { Button } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function TablePagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="d-flex justify-content-between align-items-center mt-3 px-2">
            <small className="text-muted">
                Página {currentPage} de {totalPages}
            </small>
            <div className="d-flex gap-1">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <FaChevronLeft />
                </Button>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <FaChevronRight />
                </Button>
            </div>
        </div>
    );
}

// Helper para paginar arrays
export function paginate(items, page, perPage = 10) {
    const start = (page - 1) * perPage;
    return {
        paginatedItems: items.slice(start, start + perPage),
        totalPages: Math.max(1, Math.ceil(items.length / perPage))
    };
}

export default TablePagination;
