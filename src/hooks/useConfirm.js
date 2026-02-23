import { useState, useCallback } from 'react';

/**
 * Hook that provides a confirm() replacement using ConfirmDialog.
 * 
 * Usage:
 *   const { confirm, dialogProps } = useConfirm();
 *   
 *   const handleDelete = async () => {
 *     const ok = await confirm({
 *       title: 'Delete user?',
 *       message: 'This action cannot be undone.',
 *       confirmText: 'Delete',
 *       variant: 'danger',
 *     });
 *     if (ok) { ... }
 *   };
 *   
 *   return <><ConfirmDialog {...dialogProps} /> ... </>;
 */
const useConfirm = () => {
  const [state, setState] = useState({
    isOpen: false,
    title: 'Are you sure?',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    resolve: null,
  });

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'danger',
        resolve,
      });
    });
  }, []);

  const onConfirm = useCallback(() => {
    state.resolve?.(true);
    setState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const onCancel = useCallback(() => {
    state.resolve?.(false);
    setState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const dialogProps = {
    isOpen: state.isOpen,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    variant: state.variant,
    onConfirm,
    onCancel,
  };

  return { confirm, dialogProps };
};

export default useConfirm;
