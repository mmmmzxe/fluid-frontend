import { useState, useCallback } from 'react';

interface ConfirmDialogState {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
}

export const useConfirmDialog = () => {
    const [dialogState, setDialogState] = useState<ConfirmDialogState>({
        open: false,
        title: '',
        description: '',
        onConfirm: () => { },
        variant: 'default',
    });

    const confirm = useCallback(
        (
            title: string,
            description: string,
            onConfirm: () => void,
            variant: 'default' | 'destructive' = 'default'
        ) => {
            setDialogState({
                open: true,
                title,
                description,
                onConfirm,
                variant,
            });
        },
        []
    );

    const closeDialog = useCallback(() => {
        setDialogState((prev) => ({ ...prev, open: false }));
    }, []);

    return {
        dialogState,
        confirm,
        closeDialog,
    };
};
